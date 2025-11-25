import { Controller, Get, Query, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivityService } from '../services/activity.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ActivityQueryDto, SearchActivityDto } from '../dto';

@ApiTags('activity')
@ApiBearerAuth()
@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user activity' })
  @ApiResponse({ status: 200, description: 'User activity log' })
  async getMyActivity(@Req() req: any, @Query() query: ActivityQueryDto) {
    return this.activityService.getUserActivity(req.user.id, query);
  }

  @Get('me/login-history')
  @ApiOperation({ summary: 'Get login history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Login history' })
  async getLoginHistory(@Req() req: any, @Query('limit') limit?: number) {
    return this.activityService.getLoginHistory(req.user.id, limit || 10);
  }

  @Get('me/security')
  @ApiOperation({ summary: 'Get security events' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Security events' })
  async getSecurityEvents(@Req() req: any, @Query('limit') limit?: number) {
    return this.activityService.getSecurityEvents(req.user.id, limit || 20);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get activity stats' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Activity statistics' })
  async getActivityStats(@Req() req: any, @Query('days') days?: number) {
    return this.activityService.getActivityStats(req.user.id, days || 30);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user activity (admin)' })
  @ApiResponse({ status: 200, description: 'User activity log' })
  async getUserActivity(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: ActivityQueryDto,
  ) {
    return this.activityService.getUserActivity(userId, query);
  }

  @Get('resource/:resource/:resourceId')
  @ApiOperation({ summary: 'Get resource activity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Resource activity log' })
  async getResourceActivity(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activityService.getResourceActivity(resource, resourceId, limit || 50);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent activity (admin)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiResponse({ status: 200, description: 'Recent activity' })
  async getRecentActivity(
    @Query('limit') limit?: number,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
  ) {
    return this.activityService.getRecentActivity({ limit, action, resource });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search activity logs' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchActivity(@Query() query: SearchActivityDto) {
    return this.activityService.searchActivity({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }
}
