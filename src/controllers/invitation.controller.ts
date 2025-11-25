import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvitationService } from '../services/invitation.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SendInvitationDto } from '../dto';
import { InvitationStatus, TeamRole } from '@prisma/client';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send an invitation' })
  @ApiResponse({ status: 201, description: 'Invitation sent' })
  async sendInvitation(@Req() req: any, @Body() dto: SendInvitationDto) {
    return this.invitationService.sendInvitation(
      req.user.id,
      dto.email,
      dto.teamId,
      dto.role as TeamRole,
      dto.message,
    );
  }

  @Get('token/:token')
  @ApiOperation({ summary: 'Get invitation details by token' })
  @ApiResponse({ status: 200, description: 'Invitation details' })
  async getInvitation(@Param('token') token: string) {
    return this.invitationService.getInvitation(token);
  }

  @Post('accept/:token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Accept an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  async acceptInvitation(@Param('token') token: string, @Req() req: any) {
    return this.invitationService.acceptInvitation(token, req.user.id);
  }

  @Post('decline/:token')
  @ApiOperation({ summary: 'Decline an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation declined' })
  async declineInvitation(@Param('token') token: string) {
    return this.invitationService.declineInvitation(token);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel a sent invitation' })
  @ApiResponse({ status: 200, description: 'Invitation cancelled' })
  async cancelInvitation(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.invitationService.cancelInvitation(id, req.user.id);
  }

  @Post(':id/resend')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Resend an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation resent' })
  async resendInvitation(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.invitationService.resendInvitation(id, req.user.id);
  }

  @Get('sent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get invitations sent by current user' })
  @ApiQuery({ name: 'status', required: false, enum: InvitationStatus })
  @ApiResponse({ status: 200, description: 'List of sent invitations' })
  async getSentInvitations(@Req() req: any, @Query('status') status?: InvitationStatus) {
    return this.invitationService.getSentInvitations(req.user.id, status);
  }

  @Get('pending')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get pending invitations for current user email' })
  @ApiResponse({ status: 200, description: 'List of pending invitations' })
  async getPendingInvitations(@Req() req: any) {
    return this.invitationService.getPendingInvitationsForEmail(req.user.email);
  }

  @Get('team/:teamId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get invitations for a team' })
  @ApiQuery({ name: 'status', required: false, enum: InvitationStatus })
  @ApiResponse({ status: 200, description: 'List of team invitations' })
  async getTeamInvitations(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Query('status') status?: InvitationStatus,
  ) {
    return this.invitationService.getTeamInvitations(teamId, status);
  }
}
