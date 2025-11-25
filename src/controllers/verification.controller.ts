import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VerificationService } from '../services/verification.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SendPhoneVerificationDto, VerifyPhoneDto, ResendVerificationDto } from '../dto';

@ApiTags('verification')
@Controller('verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('email/send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async sendEmailVerification(@Req() req: any) {
    return this.verificationService.sendEmailVerification(req.user.id);
  }

  @Get('email/:token')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verifyEmail(@Param('token') token: string) {
    return this.verificationService.verifyEmail(token);
  }

  @Post('phone/send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send phone verification code' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  async sendPhoneVerification(@Req() req: any, @Body() dto: SendPhoneVerificationDto) {
    return this.verificationService.sendPhoneVerification(req.user.id, dto.phoneNumber);
  }

  @Post('phone')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify phone with code' })
  @ApiResponse({ status: 200, description: 'Phone verified' })
  async verifyPhone(@Req() req: any, @Body() dto: VerifyPhoneDto) {
    return this.verificationService.verifyPhone(req.user.id, dto.code);
  }

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get verification status' })
  @ApiResponse({ status: 200, description: 'Verification status' })
  async checkVerificationStatus(@Req() req: any) {
    return this.verificationService.checkVerificationStatus(req.user.id);
  }

  @Post('resend')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Resend verification' })
  @ApiResponse({ status: 200, description: 'Verification resent' })
  async resendVerification(@Req() req: any, @Body() dto: ResendVerificationDto) {
    return this.verificationService.resendVerification(req.user.id, dto.type);
  }

  @Get('tokens')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get verification token history' })
  @ApiResponse({ status: 200, description: 'Verification tokens' })
  async getVerificationTokens(@Req() req: any) {
    return this.verificationService.getVerificationTokens(req.user.id);
  }
}
