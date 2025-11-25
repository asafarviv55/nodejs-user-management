import { Controller, Get, Put, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PreferencesService } from '../services/preferences.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdatePreferencesDto, NotificationSettingsDto, DisplaySettingsDto, PrivacySettingsDto } from '../dto';

@ApiTags('preferences')
@ApiBearerAuth()
@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences' })
  async getPreferences(@Req() req: any) {
    return this.preferencesService.getPreferences(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updatePreferences(@Req() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.preferencesService.updatePreferences(req.user.id, dto);
  }

  @Put('notifications')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings updated' })
  async updateNotificationSettings(@Req() req: any, @Body() dto: NotificationSettingsDto) {
    return this.preferencesService.updateNotificationSettings(req.user.id, dto);
  }

  @Put('display')
  @ApiOperation({ summary: 'Update display settings' })
  @ApiResponse({ status: 200, description: 'Display settings updated' })
  async updateDisplaySettings(@Req() req: any, @Body() dto: DisplaySettingsDto) {
    return this.preferencesService.updateDisplaySettings(req.user.id, dto);
  }

  @Put('privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings updated' })
  async updatePrivacySettings(@Req() req: any, @Body() dto: PrivacySettingsDto) {
    return this.preferencesService.updatePrivacySettings(req.user.id, dto);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset preferences to defaults' })
  @ApiResponse({ status: 200, description: 'Preferences reset' })
  async resetToDefaults(@Req() req: any) {
    return this.preferencesService.resetToDefaults(req.user.id);
  }

  @Post('notifications/enable-all')
  @ApiOperation({ summary: 'Enable all notifications' })
  @ApiResponse({ status: 200, description: 'All notifications enabled' })
  async enableAllNotifications(@Req() req: any) {
    return this.preferencesService.enableAllNotifications(req.user.id);
  }

  @Post('notifications/disable-all')
  @ApiOperation({ summary: 'Disable all notifications (except security)' })
  @ApiResponse({ status: 200, description: 'Notifications disabled' })
  async disableAllNotifications(@Req() req: any) {
    return this.preferencesService.disableAllNotifications(req.user.id);
  }

  @Get('notification-channels')
  @ApiOperation({ summary: 'Get notification channel status' })
  @ApiResponse({ status: 200, description: 'Notification channels' })
  async getNotificationChannels(@Req() req: any) {
    return this.preferencesService.getNotificationChannels(req.user.id);
  }
}
