import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        roleId: true,
        password: false, // Never return passwords
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