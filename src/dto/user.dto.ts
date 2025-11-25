import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'Password (min 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'johndoe', description: 'Username' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 1, description: 'Role ID' })
  @IsInt()
  roleId: number;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'johndoe' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  roleId?: number;

  @ApiPropertyOptional({ example: 'newPassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}

export class SearchUsersDto {
  @ApiPropertyOptional({ example: 'john', description: 'Search by email or username' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by role ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roleId?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'email', enum: ['email', 'username', 'createdAt'] })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class BulkDeleteDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Array of user IDs to delete' })
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @ApiPropertyOptional({ example: 'johndoe', description: 'Username' })
  username: string | null;

  @ApiProperty({ example: 1, description: 'Role ID' })
  roleId: number;

  @ApiPropertyOptional({ description: 'Created timestamp' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp' })
  updatedAt?: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class UserStatsDto {
  @ApiProperty({ example: 150 })
  totalUsers: number;

  @ApiProperty({ example: 25 })
  newUsersThisMonth: number;

  @ApiProperty({ example: 10 })
  newUsersThisWeek: number;

  @ApiProperty({ example: { admin: 10, user: 130, moderator: 10 } })
  usersByRole: Record<string, number>;

  @ApiProperty({ example: 5 })
  activeUsersToday: number;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'moderator' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Can moderate content' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class RoleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  name: string;

  @ApiPropertyOptional({ example: 'Administrator role' })
  description?: string;
}

export class ActivityLogDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'LOGIN' })
  action: string;

  @ApiProperty({ example: '192.168.1.1' })
  ipAddress: string;

  @ApiProperty()
  timestamp: Date;
}
