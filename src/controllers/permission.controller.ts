import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CreatePermissionDto,
  CreateRoleDto as CreateRolePermissionDto,
  UpdateRoleDto,
  AssignPermissionDto,
  SetRolePermissionsDto,
  AssignUserRoleDto,
} from '../dto';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // Permissions
  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created' })
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionService.createPermission(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions' })
  async getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  @Get('resource/:resource')
  @ApiOperation({ summary: 'Get permissions by resource' })
  @ApiResponse({ status: 200, description: 'List of permissions for resource' })
  async getPermissionsByResource(@Param('resource') resource: string) {
    return this.permissionService.getPermissionsByResource(resource);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted' })
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.deletePermission(id);
  }

  // Roles
  @Post('roles')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  async createRole(@Body() dto: CreateRolePermissionDto) {
    return this.permissionService.createRole(dto.name, dto.description);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async getAllRoles() {
    return this.permissionService.getAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role details with permissions' })
  @ApiResponse({ status: 200, description: 'Role details' })
  async getRole(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.getRole(id);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  async updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.permissionService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.deleteRole(id);
  }

  // Role-Permission assignments
  @Post('roles/:roleId/permissions')
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiResponse({ status: 201, description: 'Permission assigned' })
  async assignPermissionToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: AssignPermissionDto,
  ) {
    return this.permissionService.assignPermissionToRole(roleId, dto.permissionId);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiResponse({ status: 200, description: 'Permission removed' })
  async removePermissionFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.permissionService.removePermissionFromRole(roleId, permissionId);
  }

  @Put('roles/:roleId/permissions')
  @ApiOperation({ summary: 'Set all permissions for a role' })
  @ApiResponse({ status: 200, description: 'Permissions set' })
  async setRolePermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: SetRolePermissionsDto,
  ) {
    return this.permissionService.setRolePermissions(roleId, dto.permissionIds);
  }

  // User permissions
  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({ status: 200, description: 'User permissions' })
  async getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.permissionService.getUserPermissions(userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user permissions' })
  @ApiResponse({ status: 200, description: 'Current user permissions' })
  async getMyPermissions(@Req() req: any) {
    return this.permissionService.getUserPermissions(req.user.id);
  }

  @Put('users/:userId/role')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned' })
  async assignUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AssignUserRoleDto,
  ) {
    return this.permissionService.assignUserRole(userId, dto.roleId);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default permissions' })
  @ApiResponse({ status: 200, description: 'Default permissions seeded' })
  async seedDefaultPermissions() {
    return this.permissionService.seedDefaultPermissions();
  }
}
