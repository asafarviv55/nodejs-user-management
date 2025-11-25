import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, IsEnum, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum TeamRoleDto {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export class CreateTeamDto {
  @ApiProperty({ example: 'Engineering Team', description: 'Team name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Our awesome engineering team', description: 'Team description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Engineering Team', description: 'Team name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Team description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class AddTeamMemberDto {
  @ApiProperty({ example: 5, description: 'User ID to add' })
  @IsInt()
  @Type(() => Number)
  userId: number;

  @ApiPropertyOptional({ enum: TeamRoleDto, default: TeamRoleDto.MEMBER })
  @IsEnum(TeamRoleDto)
  @IsOptional()
  role?: TeamRoleDto = TeamRoleDto.MEMBER;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: TeamRoleDto })
  @IsEnum(TeamRoleDto)
  role: TeamRoleDto;
}

export class TransferOwnershipDto {
  @ApiProperty({ example: 5, description: 'New owner user ID' })
  @IsInt()
  @Type(() => Number)
  newOwnerId: number;
}

export class TeamResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Engineering Team' })
  name: string;

  @ApiProperty({ example: 'engineering-team' })
  slug: string;

  @ApiPropertyOptional({ example: 'Our awesome team' })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 1 })
  ownerId: number;

  @ApiProperty({ example: 5 })
  memberCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class TeamMemberResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  userId: number;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'johndoe' })
  username?: string;

  @ApiProperty({ enum: TeamRoleDto })
  role: TeamRoleDto;

  @ApiProperty()
  joinedAt: Date;
}
