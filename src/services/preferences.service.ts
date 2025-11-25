import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

interface UpdatePreferencesDto {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  securityAlerts?: boolean;
  weeklyDigest?: boolean;
  theme?: string;
  compactView?: boolean;
  showOnlineStatus?: boolean;
}

@Injectable()
export class PreferencesService {
  private readonly VALID_THEMES = ['light', 'dark', 'system'];

  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: number) {
    let preferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  async updatePreferences(userId: number, data: UpdatePreferencesDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.theme && !this.VALID_THEMES.includes(data.theme)) {
      data.theme = 'system';
    }

    const existingPreferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (existingPreferences) {
      return this.prisma.userPreferences.update({
        where: { userId },
        data,
      });
    }

    return this.prisma.userPreferences.create({
      data: { userId, ...data },
    });
  }

  async updateNotificationSettings(
    userId: number,
    settings: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      marketingEmails?: boolean;
      securityAlerts?: boolean;
      weeklyDigest?: boolean;
    },
  ) {
    return this.updatePreferences(userId, settings);
  }

  async updateDisplaySettings(
    userId: number,
    settings: {
      theme?: string;
      compactView?: boolean;
    },
  ) {
    return this.updatePreferences(userId, settings);
  }

  async updatePrivacySettings(
    userId: number,
    settings: {
      showOnlineStatus?: boolean;
    },
  ) {
    return this.updatePreferences(userId, settings);
  }

  async resetToDefaults(userId: number) {
    const existingPreferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    const defaultPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      securityAlerts: true,
      weeklyDigest: true,
      theme: 'system',
      compactView: false,
      showOnlineStatus: true,
    };

    if (existingPreferences) {
      return this.prisma.userPreferences.update({
        where: { userId },
        data: defaultPreferences,
      });
    }

    return this.prisma.userPreferences.create({
      data: { userId, ...defaultPreferences },
    });
  }

  async enableAllNotifications(userId: number) {
    return this.updatePreferences(userId, {
      emailNotifications: true,
      pushNotifications: true,
      securityAlerts: true,
      weeklyDigest: true,
    });
  }

  async disableAllNotifications(userId: number) {
    return this.updatePreferences(userId, {
      emailNotifications: false,
      pushNotifications: false,
      weeklyDigest: false,
      // Keep security alerts enabled for safety
    });
  }

  async getNotificationChannels(userId: number) {
    const preferences = await this.getPreferences(userId);

    return {
      email: preferences.emailNotifications,
      push: preferences.pushNotifications,
      marketing: preferences.marketingEmails,
      security: preferences.securityAlerts,
      digest: preferences.weeklyDigest,
    };
  }

  async shouldNotify(userId: number, notificationType: string): Promise<boolean> {
    const preferences = await this.getPreferences(userId);

    switch (notificationType) {
      case 'security':
        return preferences.securityAlerts;
      case 'marketing':
        return preferences.marketingEmails;
      case 'digest':
        return preferences.weeklyDigest;
      case 'email':
        return preferences.emailNotifications;
      case 'push':
        return preferences.pushNotifications;
      default:
        return preferences.emailNotifications;
    }
  }

  private async createDefaultPreferences(userId: number) {
    return this.prisma.userPreferences.create({
      data: {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        securityAlerts: true,
        weeklyDigest: true,
        theme: 'system',
        compactView: false,
        showOnlineStatus: true,
      },
    });
  }
}
