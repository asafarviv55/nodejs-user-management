import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt, IsEnum, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { TeamRoleDto } from './team.dto';

export enum InvitationStatusDto {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export class SendInvitationDto {
  @ApiProperty({ example: 'newuser@example.com', description: 'Email to send invitation to' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 1, description: 'Team ID (optional)' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  teamId?: number;

  @ApiPropertyOptional({ enum: TeamRoleDto, default: TeamRoleDto.MEMBER })
  @IsEnum(TeamRoleDto)
  @IsOptional()
  role?: TeamRoleDto = TeamRoleDto.MEMBER;

  @ApiPropertyOptional({ example: 'Join our team!', description: 'Custom message' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;
}

export class AcceptInvitationDto {
  @ApiProperty({ example: 'abc123token', description: 'Invitation token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class InvitationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'newuser@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 1 })
  teamId?: number;

  @ApiPropertyOptional({ example: 'Engineering Team' })
  teamName?: string;

  @ApiProperty({ enum: TeamRoleDto })
  role: TeamRoleDto;

  @ApiProperty({ enum: InvitationStatusDto })
  status: InvitationStatusDto;

  @ApiPropertyOptional({ example: 'Join our team!' })
  message?: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ example: '/invitations/accept/abc123' })
  inviteLink?: string;
}

export class SenderInfoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'sender@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'sendername' })
  username?: string;
}

export class InvitationDetailsResponseDto extends InvitationResponseDto {
  @ApiProperty({ type: SenderInfoDto })
  sender: SenderInfoDto;
}
