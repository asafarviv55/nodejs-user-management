import { Controller, Get, Post, Delete, Param, UseGuards, Req, ParseIntPipe, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionService } from '../services/session.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active sessions for current user' })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  async getUserSessions(@Req() req: any) {
    return this.sessionService.getUserSessions(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  async revokeSession(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.sessionService.revokeSession(id, req.user.id);
  }

  @Delete()
  @ApiOperation({ summary: 'Revoke all other sessions (keep current)' })
  @ApiResponse({ status: 200, description: 'All other sessions revoked' })
  async revokeAllSessions(@Req() req: any) {
    return this.sessionService.revokeAllSessions(req.user.id, req.sessionId);
  }

  @Post('extend')
  @ApiOperation({ summary: 'Extend current session' })
  @ApiResponse({ status: 200, description: 'Session extended' })
  async extendSession(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.sessionService.extendSession(token);
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Cleanup expired sessions (admin only)' })
  @ApiResponse({ status: 200, description: 'Expired sessions cleaned up' })
  async cleanupExpiredSessions() {
    return this.sessionService.cleanupExpiredSessions();
  }
}
