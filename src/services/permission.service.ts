import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

interface CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async createPermission(data: CreatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({
      where: { resource_action: { resource: data.resource, action: data.action } },
    });

    if (existing) {
      throw new BadRequestException('Permission already exists');
    }

    return this.prisma.permission.create({ data });
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  async getPermissionsByResource(resource: string) {
    return this.prisma.permission.findMany({
      where: { resource },
      orderBy: { action: 'asc' },
    });
  }

  async deletePermission(permissionId: number) {
    await this.prisma.permission.delete({ where: { id: permissionId } });
    return { message: 'Permission deleted' };
  }

  async createRole(name: string, description?: string) {
    const existing = await this.prisma.role.findUnique({ where: { name } });

    if (existing) {
      throw new BadRequestException('Role already exists');
    }

    return this.prisma.role.create({
      data: { name, description },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: {
        _count: { select: { users: true, permissions: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getRole(roleId: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async updateRole(roleId: number, data: { name?: string; description?: string }) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system role');
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data,
    });
  }

  async deleteRole(roleId: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system role');
    }

    if (role._count.users > 0) {
      throw new BadRequestException('Cannot delete role with assigned users');
    }

    await this.prisma.role.delete({ where: { id: roleId } });
    return { message: 'Role deleted' };
  }

  async assignPermissionToRole(roleId: number, permissionId: number) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const permission = await this.prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) throw new NotFoundException('Permission not found');

    const existing = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId } },
    });

    if (existing) {
      throw new BadRequestException('Permission already assigned to role');
    }

    return this.prisma.rolePermission.create({
      data: { roleId, permissionId },
      include: { permission: true },
    });
  }

  async removePermissionFromRole(roleId: number, permissionId: number) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (role?.isSystem) {
      throw new BadRequestException('Cannot modify system role permissions');
    }

    await this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });

    return { message: 'Permission removed from role' };
  }

  async setRolePermissions(roleId: number, permissionIds: number[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system role permissions');
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      }),
    ]);

    return this.getRole(roleId);
  }

  async getUserPermissions(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.role.permissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      resource: rp.permission.resource,
      action: rp.permission.action,
    }));
  }

  async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user) return false;

    return user.role.permissions.some(
      (rp) => rp.permission.resource === resource && rp.permission.action === action,
    );
  }

  async assignUserRole(userId: number, roleId: number) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: { role: true },
    });
  }

  async seedDefaultPermissions() {
    const defaultPermissions = [
      { name: 'View Users', resource: 'users', action: 'read' },
      { name: 'Create Users', resource: 'users', action: 'create' },
      { name: 'Update Users', resource: 'users', action: 'update' },
      { name: 'Delete Users', resource: 'users', action: 'delete' },
      { name: 'View Teams', resource: 'teams', action: 'read' },
      { name: 'Create Teams', resource: 'teams', action: 'create' },
      { name: 'Update Teams', resource: 'teams', action: 'update' },
      { name: 'Delete Teams', resource: 'teams', action: 'delete' },
      { name: 'View Roles', resource: 'roles', action: 'read' },
      { name: 'Manage Roles', resource: 'roles', action: 'manage' },
      { name: 'View Activity Logs', resource: 'activity', action: 'read' },
      { name: 'Export Data', resource: 'data', action: 'export' },
    ];

    for (const perm of defaultPermissions) {
      await this.prisma.permission.upsert({
        where: { resource_action: { resource: perm.resource, action: perm.action } },
        update: {},
        create: perm,
      });
    }

    return { message: 'Default permissions seeded' };
  }
}
