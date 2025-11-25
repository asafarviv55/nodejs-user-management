import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ example: true, description: 'Receive email notifications' })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Receive push notifications' })
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Receive marketing emails' })
  @IsBoolean()
  @IsOptional()
  marketingEmails?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Receive security alerts' })
  @IsBoolean()
  @IsOptional()
  securityAlerts?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Receive weekly digest' })
  @IsBoolean()
  @IsOptional()
  weeklyDigest?: boolean;

  @ApiPropertyOptional({ example: 'dark', enum: ['light', 'dark', 'system'] })
  @IsString()
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;

  @ApiPropertyOptional({ example: false, description: 'Use compact view' })
  @IsBoolean()
  @IsOptional()
  compactView?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Show online status to others' })
  @IsBoolean()
  @IsOptional()
  showOnlineStatus?: boolean;
}

export class NotificationSettingsDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  marketingEmails?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  securityAlerts?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  weeklyDigest?: boolean;
}

export class DisplaySettingsDto {
  @ApiPropertyOptional({ example: 'dark', enum: ['light', 'dark', 'system'] })
  @IsString()
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  compactView?: boolean;
}

export class PrivacySettingsDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  showOnlineStatus?: boolean;
}

export class PreferencesResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: true })
  emailNotifications: boolean;

  @ApiProperty({ example: true })
  pushNotifications: boolean;

  @ApiProperty({ example: false })
  marketingEmails: boolean;

  @ApiProperty({ example: true })
  securityAlerts: boolean;

  @ApiProperty({ example: true })
  weeklyDigest: boolean;

  @ApiProperty({ example: 'system' })
  theme: string;

  @ApiProperty({ example: false })
  compactView: boolean;

  @ApiProperty({ example: true })
  showOnlineStatus: boolean;
}

export class NotificationChannelsDto {
  @ApiProperty({ example: true })
  email: boolean;

  @ApiProperty({ example: true })
  push: boolean;

  @ApiProperty({ example: false })
  marketing: boolean;

  @ApiProperty({ example: true })
  security: boolean;

  @ApiProperty({ example: true })
  digest: boolean;
}
