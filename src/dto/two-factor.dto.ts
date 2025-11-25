import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Setup2FAResponseDto {
  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP', description: 'Secret key for TOTP' })
  secret: string;

  @ApiProperty({ example: 'otpauth://totp/...', description: 'URL for QR code generation' })
  qrCodeUrl: string;

  @ApiProperty({ example: 'abc123token', description: 'Setup token for confirmation' })
  setupToken: string;

  @ApiProperty({ example: ['1234-ABCD', '5678-EFGH'], description: 'Backup codes' })
  backupCodes: string[];
}

export class Confirm2FADto {
  @ApiProperty({ example: 'abc123token', description: 'Setup token from initiation' })
  @IsString()
  @IsNotEmpty()
  setupToken: string;

  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class Verify2FADto {
  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class Disable2FADto {
  @ApiProperty({ example: '123456', description: '6-digit TOTP code to confirm disable' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class BackupCodesResponseDto {
  @ApiProperty({ example: ['1234-ABCD', '5678-EFGH'], description: 'New backup codes' })
  backupCodes: string[];
}

export class TwoFactorStatusDto {
  @ApiProperty({ example: true })
  enabled: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  enabledAt?: Date;
}
