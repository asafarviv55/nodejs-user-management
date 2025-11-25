import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateProfileDto, UpdateUsernameDto, ChangeEmailDto, UploadAvatarDto } from '../dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getMyProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @Put('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMyProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, dto);
  }

  @Put('me/username')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update username' })
  @ApiResponse({ status: 200, description: 'Username updated' })
  async updateUsername(@Req() req: any, @Body() dto: UpdateUsernameDto) {
    return this.profileService.updateUsername(req.user.id, dto.username);
  }

  @Post('me/email-change')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request email change' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async requestEmailChange(@Req() req: any, @Body() dto: ChangeEmailDto) {
    return this.profileService.requestEmailChange(req.user.id, dto.newEmail);
  }

  @Post('me/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded' })
  async uploadAvatar(@Req() req: any, @Body() dto: UploadAvatarDto) {
    return this.profileService.uploadAvatar(req.user.id, dto.avatarUrl);
  }

  @Delete('me/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove avatar' })
  @ApiResponse({ status: 200, description: 'Avatar removed' })
  async removeAvatar(@Req() req: any) {
    return this.profileService.removeAvatar(req.user.id);
  }

  @Get('me/completeness')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get profile completeness' })
  @ApiResponse({ status: 200, description: 'Profile completeness stats' })
  async getProfileCompleteness(@Req() req: any) {
    return this.profileService.getProfileCompleteness(req.user.id);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get public profile of a user' })
  @ApiResponse({ status: 200, description: 'Public profile' })
  async getPublicProfile(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const viewerId = req.user?.id;
    return this.profileService.getPublicProfile(id, viewerId);
  }

  @Get('search')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit: number,
    @Req() req: any,
  ) {
    return this.profileService.searchUsers(query, {
      limit: limit || 10,
      excludeUserId: req.user.id,
    });
  }
}
