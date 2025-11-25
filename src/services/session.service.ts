import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

interface DeviceInfo {
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionService {
  private readonly sessionDuration: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.sessionDuration = parseInt(this.configService.get('SESSION_DURATION', '604800000')); // 7 days default
  }

  async createSession(userId: number, deviceInfo: DeviceInfo) {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + this.sessionDuration);

    // Parse location from IP if needed (in production, use IP geolocation service)
    const location = deviceInfo.ipAddress ? 'Unknown' : undefined;

    const session = await this.prisma.session.create({
      data: {
        userId,
        token,
        deviceName: deviceInfo.deviceName || this.parseDeviceName(deviceInfo.userAgent),
        deviceType: deviceInfo.deviceType || this.parseDeviceType(deviceInfo.userAgent),
        browser: deviceInfo.browser || this.parseBrowser(deviceInfo.userAgent),
        ipAddress: deviceInfo.ipAddress,
        location,
        expiresAt,
      },
    });

    return { sessionToken: session.token, expiresAt: session.expiresAt };
  }

  async validateSession(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: { id: true, email: true, isActive: true, roleId: true },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    if (!session.isActive) {
      throw new UnauthorizedException('Session has been revoked');
    }

    if (new Date() > session.expiresAt) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { isActive: false },
      });
      throw new UnauthorizedException('Session has expired');
    }

    if (!session.user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    // Update last active time
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });

    return session.user;
  }

  async getUserSessions(userId: number) {
    return this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        browser: true,
        ipAddress: true,
        location: true,
        lastActiveAt: true,
        createdAt: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });
  }

  async revokeSession(sessionId: number, userId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new UnauthorizedException('You can only revoke your own sessions');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    return { message: 'Session revoked successfully' };
  }

  async revokeAllSessions(userId: number, exceptSessionId?: number) {
    const where: any = { userId, isActive: true };
    if (exceptSessionId) {
      where.id = { not: exceptSessionId };
    }

    const result = await this.prisma.session.updateMany({
      where,
      data: { isActive: false },
    });

    return { message: `${result.count} session(s) revoked` };
  }

  async revokeSessionByToken(token: string) {
    await this.prisma.session.update({
      where: { token },
      data: { isActive: false },
    });
  }

  async extendSession(token: string) {
    const session = await this.prisma.session.findUnique({ where: { token } });

    if (!session || !session.isActive) {
      throw new UnauthorizedException('Invalid session');
    }

    const newExpiresAt = new Date(Date.now() + this.sessionDuration);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: newExpiresAt, lastActiveAt: new Date() },
    });

    return { expiresAt: newExpiresAt };
  }

  async cleanupExpiredSessions() {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false, lastActiveAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        ],
      },
    });

    return { deletedCount: result.count };
  }

  private parseDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';

    return 'Unknown Device';
  }

  private parseDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return 'mobile';
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  private parseBrowser(userAgent?: string): string {
    if (!userAgent) return 'Unknown';

    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Unknown';
  }
}
