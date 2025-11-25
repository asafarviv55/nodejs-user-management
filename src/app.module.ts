import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { APP_GUARD } from '@nestjs/core';
import { validate } from './config/env.validation';
import { winstonConfig } from './config/logger.config';

// Services
import { PrismaService } from './services/prisma.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { TeamService } from './services/team.service';
import { InvitationService } from './services/invitation.service';
import { TwoFactorService } from './services/two-factor.service';
import { SessionService } from './services/session.service';
import { ProfileService } from './services/profile.service';
import { PreferencesService } from './services/preferences.service';
import { PasswordResetService } from './services/password-reset.service';
import { VerificationService } from './services/verification.service';
import { PermissionService } from './services/permission.service';
import { ActivityService } from './services/activity.service';

// Controllers
import { HealthController } from './controllers/health.controller';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { TeamController } from './controllers/team.controller';
import { InvitationController } from './controllers/invitation.controller';
import { TwoFactorController } from './controllers/two-factor.controller';
import { SessionController } from './controllers/session.controller';
import { ProfileController } from './controllers/profile.controller';
import { PreferencesController } from './controllers/preferences.controller';
import { PasswordController } from './controllers/password.controller';
import { VerificationController } from './controllers/verification.controller';
import { PermissionController } from './controllers/permission.controller';
import { ActivityController } from './controllers/activity.controller';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env', '.env.local'],
    }),
    // Rate limiting: 100 requests per minute per IP
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    WinstonModule.forRoot(winstonConfig),
    JwtModule.register({}),
  ],
  controllers: [
    HealthController,
    AuthController,
    UserController,
    TeamController,
    InvitationController,
    TwoFactorController,
    SessionController,
    ProfileController,
    PreferencesController,
    PasswordController,
    VerificationController,
    PermissionController,
    ActivityController,
  ],
  providers: [
    PrismaService,
    UserService,
    AuthService,
    TeamService,
    InvitationService,
    TwoFactorService,
    SessionService,
    ProfileService,
    PreferencesService,
    PasswordResetService,
    VerificationService,
    PermissionService,
    ActivityService,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
