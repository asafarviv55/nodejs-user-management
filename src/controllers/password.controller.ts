import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PasswordResetService } from '../services/password-reset.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestPasswordResetDto, ResetPasswordDto, ChangePasswordDto } from '../dto';

@ApiTags('password')
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'If account exists, reset email sent' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.passwordResetService.requestPasswordReset(dto.email);
  }

  @Get('reset/:token/validate')
  @ApiOperation({ summary: 'Validate password reset token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  async validateResetToken(@Param('token') token: string) {
    return this.passwordResetService.validateResetToken(token);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('change')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password (authenticated)' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.passwordResetService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get password reset history' })
  @ApiResponse({ status: 200, description: 'Password reset history' })
  async getResetHistory(@Req() req: any) {
    return this.passwordResetService.getResetHistory(req.user.id);
  }
}
