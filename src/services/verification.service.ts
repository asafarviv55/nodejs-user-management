import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { VerificationType } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class VerificationService {
  private readonly EMAIL_TOKEN_EXPIRY_HOURS = 48;
  private readonly PHONE_TOKEN_EXPIRY_MINUTES = 10;

  constructor(private readonly prisma: PrismaService) {}

  async sendEmailVerification(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Invalidate existing verification tokens
    await this.prisma.verificationToken.updateMany({
      where: {
        userId,
        type: VerificationType.EMAIL,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { expiresAt: new Date() },
    });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.prisma.verificationToken.create({
      data: {
        userId,
        token,
        type: VerificationType.EMAIL,
        expiresAt,
      },
    });

    // In production, send email here
    const verificationLink = `/verify/email/${token}`;

    return {
      message: 'Verification email sent',
      ...(process.env.NODE_ENV === 'development' && { verificationLink }),
    };
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new NotFoundException('Invalid verification token');
    }

    if (verificationToken.type !== VerificationType.EMAIL) {
      throw new BadRequestException('Invalid token type');
    }

    if (verificationToken.usedAt) {
      throw new BadRequestException('This verification link has already been used');
    }

    if (new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('This verification link has expired');
    }

    if (verificationToken.user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { isEmailVerified: true },
      }),
      this.prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async sendPhoneVerification(userId: number, phoneNumber: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update phone number in profile
    if (user.profile) {
      await this.prisma.userProfile.update({
        where: { userId },
        data: { phone: phoneNumber },
      });
    } else {
      await this.prisma.userProfile.create({
        data: { userId, phone: phoneNumber },
      });
    }

    // Invalidate existing phone verification tokens
    await this.prisma.verificationToken.updateMany({
      where: {
        userId,
        type: VerificationType.PHONE,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { expiresAt: new Date() },
    });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + this.PHONE_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.verificationToken.create({
      data: {
        userId,
        token: code,
        type: VerificationType.PHONE,
        expiresAt,
      },
    });

    // In production, send SMS here
    return {
      message: 'Verification code sent to your phone',
      ...(process.env.NODE_ENV === 'development' && { code }),
    };
  }

  async verifyPhone(userId: number, code: string) {
    const verificationToken = await this.prisma.verificationToken.findFirst({
      where: {
        userId,
        token: code,
        type: VerificationType.PHONE,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Phone number verified successfully' };
  }

  async checkVerificationStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      emailVerified: user.isEmailVerified,
      email: user.email,
      phoneNumber: user.profile?.phone || null,
    };
  }

  async resendVerification(userId: number, type: 'email' | 'phone') {
    if (type === 'email') {
      return this.sendEmailVerification(userId);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile?.phone) {
      throw new BadRequestException('No phone number on file');
    }

    return this.sendPhoneVerification(userId, user.profile.phone);
  }

  async getVerificationTokens(userId: number) {
    return this.prisma.verificationToken.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        createdAt: true,
        expiresAt: true,
        usedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}
