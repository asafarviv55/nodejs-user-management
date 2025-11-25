import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

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

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @ApiPropertyOptional({ example: 'johndoe', description: 'Username' })
  username: string | null;

  @ApiProperty({ example: 1, description: 'Role ID' })
  roleId: number;
}
