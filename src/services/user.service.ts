import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';
import { SearchUsersDto, UpdateUserDto } from '../dto/user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Create User
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    try {
      return await this.prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          roleId: userData.roleId,
          password: hashedPassword,
        },
      });
    } catch (error) {
      console.error('Failed to create user:', error.message);
      throw new BadRequestException('Failed to create user');
    }
  }

  // 2. Search & Paginate Users
  async searchUsers(searchDto: SearchUsersDto) {
    const { search, roleId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = searchDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { username: { contains: search } },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          username: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 3. Get User by ID
  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user as User;
  }

  // 4. Update User
  async updateUser(id: number, updateDto: UpdateUserDto): Promise<User> {
    await this.findById(id); // Check exists

    const data: any = { ...updateDto };
    if (updateDto.password) {
      data.password = await bcrypt.hash(updateDto.password, SALT_ROUNDS);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<User>;
  }

  // 5. Delete User
  async deleteUser(id: number): Promise<void> {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
  }

  // 6. Bulk Delete Users
  async bulkDeleteUsers(ids: number[]): Promise<{ deleted: number }> {
    const result = await this.prisma.user.deleteMany({
      where: { id: { in: ids } },
    });
    return { deleted: result.count };
  }

  // 7. User Statistics Dashboard
  async getUserStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

    const [totalUsers, newUsersThisMonth, newUsersThisWeek, usersByRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.user.groupBy({
        by: ['roleId'],
        _count: { roleId: true },
      }),
    ]);

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[`role_${item.roleId}`] = item._count.roleId;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      usersByRole: roleStats,
      activeUsersToday: 0, // Would need activity tracking
    };
  }

  // 8. Export Users to CSV
  async exportUsersToCSV(): Promise<string> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        roleId: true,
        createdAt: true,
      },
    });

    const header = 'ID,Email,Username,RoleID,CreatedAt\n';
    const rows = users.map(u =>
      `${u.id},"${u.email}","${u.username || ''}",${u.roleId},${u.createdAt?.toISOString() || ''}`
    ).join('\n');

    return header + rows;
  }

  // 9. Log User Activity
  async logActivity(userId: number, action: string, ipAddress: string, resource: string = 'user') {
    return this.prisma.activityLog.create({
      data: { userId, action, ipAddress, resource },
    });
  }

  async getActivityLog(userId: number, limit = 50) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // 10. Role Management
  async createRole(name: string, description?: string) {
    return this.prisma.role.create({
      data: { name, description },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany();
  }

  async updateRole(id: number, name: string, description?: string) {
    return this.prisma.role.update({
      where: { id },
      data: { name, description },
    });
  }

  async deleteRole(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }

  // Legacy methods
  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        roleId: true,
      },
    }) as Promise<User[]>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}