import { Controller, Get, Post, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService } from '../services/two-factor.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Confirm2FADto, Verify2FADto, Disable2FADto } from '../dto';

@ApiTags('two-factor')
@ApiBearerAuth()
@Controller('2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Initiate 2FA setup' })
  @ApiResponse({ status: 200, description: 'Returns secret and QR code URL' })
  async initiate2FA(@Req() req: any) {
    return this.twoFactorService.initiate2FASetup(req.user.id);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm 2FA setup with TOTP code' })
  @ApiResponse({ status: 200, description: '2FA enabled' })
  async confirm2FA(@Req() req: any, @Body() dto: Confirm2FADto) {
    return this.twoFactorService.confirm2FASetup(req.user.id, dto.setupToken, dto.code);
  }

  @Delete()
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled' })
  async disable2FA(@Req() req: any, @Body() dto: Disable2FADto) {
    return this.twoFactorService.disable2FA(req.user.id, dto.code);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify 2FA code' })
  @ApiResponse({ status: 200, description: 'Code verified' })
  async verify2FA(@Req() req: any, @Body() dto: Verify2FADto) {
    await this.twoFactorService.verify2FA(req.user.id, dto.code);
    return { verified: true };
  }

  @Post('backup-codes')
  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({ status: 200, description: 'New backup codes generated' })
  async regenerateBackupCodes(@Req() req: any, @Body() dto: Verify2FADto) {
    return this.twoFactorService.regenerateBackupCodes(req.user.id, dto.code);
  }
}
