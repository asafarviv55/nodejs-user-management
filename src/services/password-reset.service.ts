import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordResetService {
  private readonly TOKEN_EXPIRY_HOURS = 24;
  private readonly SALT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return success even if user not found (security: don't reveal if email exists)
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    if (!user.isActive) {
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    // Invalidate any existing reset tokens
    await this.prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { expiresAt: new Date() },
    });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // In production, send email here
    const resetLink = `/auth/reset-password/${token}`;

    return {
      message: 'If an account exists with this email, a reset link has been sent.',
      // Only return link in development
      ...(process.env.NODE_ENV === 'development' && { resetLink }),
    };
  }

  async validateResetToken(token: string) {
    const resetRequest = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
      },
    });

    if (!resetRequest) {
      throw new NotFoundException('Invalid reset token');
    }

    if (resetRequest.usedAt) {
      throw new BadRequestException('This reset link has already been used');
    }

    if (new Date() > resetRequest.expiresAt) {
      throw new BadRequestException('This reset link has expired');
    }

    if (!resetRequest.user.isActive) {
      throw new BadRequestException('Account is not active');
    }

    return {
      valid: true,
      email: resetRequest.user.email,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetRequest = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRequest) {
      throw new NotFoundException('Invalid reset token');
    }

    if (resetRequest.usedAt) {
      throw new BadRequestException('This reset link has already been used');
    }

    if (new Date() > resetRequest.expiresAt) {
      throw new BadRequestException('This reset link has expired');
    }

    // Validate password strength
    this.validatePasswordStrength(newPassword);

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, resetRequest.user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRequest.userId },
        data: {
          password: hashedPassword,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all active sessions for security
      this.prisma.session.updateMany({
        where: { userId: resetRequest.userId, isActive: true },
        data: { isActive: false },
      }),
    ]);

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate password strength
    this.validatePasswordStrength(newPassword);

    // Check if new password is same as old
    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async getResetHistory(userId: number) {
    return this.prisma.passwordReset.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        usedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  private validatePasswordStrength(password: string) {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('. '));
    }
  }
}
