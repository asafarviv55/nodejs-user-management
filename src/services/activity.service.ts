import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

interface ActivityLogData {
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: ActivityLogData) {
    return this.prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status || 'success',
      },
    });
  }

  async getUserActivity(
    userId: number,
    options: { page?: number; limit?: number; action?: string; resource?: string },
  ) {
    const { page = 1, limit = 20, action, resource } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (action) where.action = action;
    if (resource) where.resource = resource;

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLoginHistory(userId: number, limit: number = 10) {
    return this.prisma.activityLog.findMany({
      where: {
        userId,
        action: { in: ['login', 'login_failed', 'logout'] },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getSecurityEvents(userId: number, limit: number = 20) {
    return this.prisma.activityLog.findMany({
      where: {
        userId,
        action: {
          in: [
            'login',
            'login_failed',
            'logout',
            'password_changed',
            'password_reset',
            '2fa_enabled',
            '2fa_disabled',
            'session_revoked',
            'email_changed',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getResourceActivity(resource: string, resourceId: string, limit: number = 50) {
    return this.prisma.activityLog.findMany({
      where: { resource, resourceId },
      include: {
        user: { select: { id: true, email: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecentActivity(options: { limit?: number; action?: string; resource?: string }) {
    const { limit = 50, action, resource } = options;

    const where: any = {};
    if (action) where.action = action;
    if (resource) where.resource = resource;

    return this.prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getActivityStats(userId: number, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const activities = await this.prisma.activityLog.groupBy({
      by: ['action'],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    const dailyActivity = await this.prisma.activityLog.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    return {
      actionBreakdown: activities.map((a) => ({ action: a.action, count: a._count })),
      totalActions: activities.reduce((sum, a) => sum + a._count, 0),
      periodDays: days,
    };
  }

  async searchActivity(query: {
    userId?: number;
    action?: string;
    resource?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    ipAddress?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = { contains: query.action };
    if (query.resource) where.resource = query.resource;
    if (query.status) where.status = query.status;
    if (query.ipAddress) where.ipAddress = query.ipAddress;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = query.startDate;
      if (query.endDate) where.createdAt.lte = query.endDate;
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteOldActivity(daysToKeep: number = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await this.prisma.activityLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    return { deletedCount: result.count };
  }
}
