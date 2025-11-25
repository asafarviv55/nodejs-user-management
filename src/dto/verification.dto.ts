import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, IsPhoneNumber, IsOptional } from 'class-validator';

export class SendEmailVerificationDto {
  // No body needed - uses authenticated user's email
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'abc123token', description: 'Email verification token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class SendPhoneVerificationDto {
  @ApiProperty({ example: '+1234567890', description: 'Phone number to verify' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class VerifyPhoneDto {
  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class ResendVerificationDto {
  @ApiProperty({ example: 'email', enum: ['email', 'phone'], description: 'Type of verification to resend' })
  @IsString()
  type: 'email' | 'phone';
}

export class VerificationResponseDto {
  @ApiProperty({ example: 'Verification email sent' })
  message: string;

  @ApiPropertyOptional({ example: '/verify/email/abc123', description: 'Only in development' })
  verificationLink?: string;

  @ApiPropertyOptional({ example: '123456', description: 'Only in development for phone verification' })
  code?: string;
}

export class VerificationStatusDto {
  @ApiProperty({ example: true })
  emailVerified: boolean;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phoneNumber?: string;
}

export class VerificationSuccessDto {
  @ApiProperty({ example: 'Email verified successfully' })
  message: string;
}
