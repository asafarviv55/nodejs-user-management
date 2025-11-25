import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  timezone?: string;
  language?: string;
  dateOfBirth?: Date;
  address?: string;
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
        role: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: number, data: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profile) {
      return this.prisma.userProfile.update({
        where: { userId },
        data,
      });
    }

    return this.prisma.userProfile.create({
      data: { userId, ...data },
    });
  }

  async uploadAvatar(userId: number, avatarUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profile) {
      return this.prisma.userProfile.update({
        where: { userId },
        data: { avatarUrl },
      });
    }

    return this.prisma.userProfile.create({
      data: { userId, avatarUrl },
    });
  }

  async removeAvatar(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.userProfile.update({
      where: { userId },
      data: { avatarUrl: null },
    });
  }

  async updateUsername(userId: number, username: string) {
    // Check if username is already taken
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username,
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw new BadRequestException('Username is already taken');
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      throw new BadRequestException(
        'Username must be 3-30 characters and contain only letters, numbers, and underscores',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { username },
      select: { id: true, username: true },
    });
  }

  async requestEmailChange(userId: number, newEmail: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email === newEmail) {
      throw new BadRequestException('New email is the same as current email');
    }

    // Check if email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    // In production, send verification email to new address
    // For now, just return a message
    return {
      message: 'Verification email sent to new address. Please verify to complete the change.',
      pendingEmail: newEmail,
    };
  }

  async getPublicProfile(userId: number, viewerId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: { select: { showOnlineStatus: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      avatar: user.profile?.avatarUrl,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      bio: user.profile?.bio,
      jobTitle: user.profile?.jobTitle,
      department: user.profile?.department,
      memberSince: user.createdAt,
    };
  }

  async searchUsers(query: string, options: { limit?: number; excludeUserId?: number }) {
    const { limit = 10, excludeUserId } = options;

    return this.prisma.user.findMany({
      where: {
        isActive: true,
        ...(excludeUserId && { id: { not: excludeUserId } }),
        OR: [
          { email: { contains: query } },
          { username: { contains: query } },
          { profile: { firstName: { contains: query } } },
          { profile: { lastName: { contains: query } } },
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
        profile: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
      },
      take: limit,
    });
  }

  async getProfileCompleteness(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fields = {
      email: !!user.email,
      emailVerified: user.isEmailVerified,
      username: !!user.username,
      firstName: !!user.profile?.firstName,
      lastName: !!user.profile?.lastName,
      phone: !!user.profile?.phone,
      avatar: !!user.profile?.avatarUrl,
      bio: !!user.profile?.bio,
      jobTitle: !!user.profile?.jobTitle,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    const completed = Object.values(fields).filter(Boolean).length;
    const total = Object.keys(fields).length;

    return {
      completeness: Math.round((completed / total) * 100),
      fields,
      missingFields: Object.entries(fields)
        .filter(([_, v]) => !v)
        .map(([k]) => k),
    };
  }
}
