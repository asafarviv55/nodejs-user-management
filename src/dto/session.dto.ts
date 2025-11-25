import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @ApiPropertyOptional({ example: 'MacBook Pro', description: 'Device name' })
  @IsString()
  @IsOptional()
  deviceName?: string;

  @ApiPropertyOptional({ example: 'desktop', enum: ['desktop', 'mobile', 'tablet'] })
  @IsString()
  @IsOptional()
  deviceType?: string;

  @ApiPropertyOptional({ example: 'Chrome', description: 'Browser name' })
  @IsString()
  @IsOptional()
  browser?: string;
}

export class SessionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiPropertyOptional({ example: 'MacBook Pro' })
  deviceName?: string;

  @ApiPropertyOptional({ example: 'desktop' })
  deviceType?: string;

  @ApiPropertyOptional({ example: 'Chrome' })
  browser?: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'New York, US' })
  location?: string;

  @ApiProperty()
  lastActiveAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ example: true })
  isCurrent?: boolean;
}

export class SessionTokenResponseDto {
  @ApiProperty({ example: 'abc123...xyz789' })
  sessionToken: string;

  @ApiProperty()
  expiresAt: Date;
}

export class RevokeSessionsResponseDto {
  @ApiProperty({ example: 'Session revoked successfully' })
  message: string;
}

export class RevokeAllSessionsResponseDto {
  @ApiProperty({ example: '3 session(s) revoked' })
  message: string;
}
