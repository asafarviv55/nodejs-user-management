import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePermissionDto {
  @ApiProperty({ example: 'View Users', description: 'Permission name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'users', description: 'Resource this permission applies to' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'read', description: 'Action allowed' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiPropertyOptional({ example: 'Allows viewing user list', description: 'Permission description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'moderator', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Can moderate content', description: 'Role description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'senior-moderator', description: 'Role name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Senior content moderator', description: 'Role description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignPermissionDto {
  @ApiProperty({ example: 1, description: 'Permission ID to assign' })
  @IsInt()
  @Type(() => Number)
  permissionId: number;
}

export class SetRolePermissionsDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Array of permission IDs' })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}

export class AssignUserRoleDto {
  @ApiProperty({ example: 2, description: 'Role ID to assign' })
  @IsInt()
  @Type(() => Number)
  roleId: number;
}

export class PermissionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'View Users' })
  name: string;

  @ApiProperty({ example: 'users' })
  resource: string;

  @ApiProperty({ example: 'read' })
  action: string;

  @ApiPropertyOptional({ example: 'Allows viewing user list' })
  description?: string;
}

export class RoleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  name: string;

  @ApiPropertyOptional({ example: 'Full access administrator' })
  description?: string;

  @ApiProperty({ example: false })
  isSystem: boolean;

  @ApiProperty({ example: 10 })
  userCount: number;

  @ApiProperty({ example: 15 })
  permissionCount: number;
}

export class RoleWithPermissionsDto extends RoleResponseDto {
  @ApiProperty({ type: [PermissionResponseDto] })
  permissions: PermissionResponseDto[];
}

export class UserPermissionsDto {
  @ApiProperty({ type: [PermissionResponseDto] })
  permissions: PermissionResponseDto[];
}

export class CheckPermissionDto {
  @ApiProperty({ example: 'users' })
  resource: string;

  @ApiProperty({ example: 'read' })
  action: string;
}

export class CheckPermissionResponseDto {
  @ApiProperty({ example: true })
  hasPermission: boolean;
}
