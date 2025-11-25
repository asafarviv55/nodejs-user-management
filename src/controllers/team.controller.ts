import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeamService } from '../services/team.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto, UpdateMemberRoleDto, TransferOwnershipDto } from '../dto';
import { TeamRole } from '@prisma/client';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  async createTeam(@Req() req: any, @Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams for current user' })
  @ApiResponse({ status: 200, description: 'List of user teams' })
  async getUserTeams(@Req() req: any) {
    return this.teamService.getUserTeams(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team details' })
  @ApiResponse({ status: 200, description: 'Team details' })
  async getTeam(@Param('id', ParseIntPipe) id: number) {
    return this.teamService.getTeam(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update team' })
  @ApiResponse({ status: 200, description: 'Team updated' })
  async updateTeam(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamService.updateTeam(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete team' })
  @ApiResponse({ status: 200, description: 'Team deleted' })
  async deleteTeam(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.teamService.deleteTeam(id, req.user.id);
    return { message: 'Team deleted successfully' };
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to team' })
  @ApiResponse({ status: 201, description: 'Member added' })
  async addMember(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.teamService.addMember(id, req.user.id, dto.userId, dto.role as TeamRole);
  }

  @Put(':id/members/:userId/role')
  @ApiOperation({ summary: 'Update member role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  async updateMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: any,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.teamService.updateMemberRole(id, req.user.id, userId, dto.role as TeamRole);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from team' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: any,
  ) {
    await this.teamService.removeMember(id, req.user.id, userId);
    return { message: 'Member removed successfully' };
  }

  @Post(':id/transfer-ownership')
  @ApiOperation({ summary: 'Transfer team ownership' })
  @ApiResponse({ status: 200, description: 'Ownership transferred' })
  async transferOwnership(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: TransferOwnershipDto,
  ) {
    await this.teamService.transferOwnership(id, req.user.id, dto.newOwnerId);
    return { message: 'Ownership transferred successfully' };
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave team' })
  @ApiResponse({ status: 200, description: 'Left team' })
  async leaveTeam(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.teamService.removeMember(id, req.user.id, req.user.id);
    return { message: 'Left team successfully' };
  }
}
