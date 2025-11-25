import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address for password reset' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ValidateResetTokenDto {
  @ApiProperty({ example: 'abc123token', description: 'Password reset token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123token', description: 'Password reset token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewSecure@Pass123', description: 'New password (min 8 chars, must include uppercase, lowercase, number, special char)' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPass123!', description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewSecure@Pass123', description: 'New password (min 8 chars, must include uppercase, lowercase, number, special char)' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}

export class PasswordResetResponseDto {
  @ApiProperty({ example: 'If an account exists with this email, a reset link has been sent.' })
  message: string;
}

export class ValidateTokenResponseDto {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ example: 'user@example.com' })
  email: string;
}

export class PasswordChangedResponseDto {
  @ApiProperty({ example: 'Password has been reset successfully. Please log in with your new password.' })
  message: string;
}
