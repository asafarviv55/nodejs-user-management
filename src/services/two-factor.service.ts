import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { randomBytes, createHmac } from 'crypto';

@Injectable()
export class TwoFactorService {
  private readonly TOTP_WINDOW = 1; // Allow 1 step before/after current time
  private readonly TOTP_STEP = 30; // 30 second time step

  constructor(private readonly prisma: PrismaService) {}

  async initiate2FASetup(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes();

    // Store setup token temporarily
    const setupToken = randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        userId,
        token: setupToken,
        type: 'TWO_FACTOR_SETUP',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Temporarily store secret (will be confirmed later)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    const otpauthUrl = this.generateOTPAuthURL(user.email, secret);

    return {
      secret,
      qrCodeUrl: otpauthUrl,
      setupToken,
      backupCodes,
    };
  }

  async confirm2FASetup(userId: number, setupToken: string, code: string) {
    const verificationToken = await this.prisma.verificationToken.findFirst({
      where: {
        userId,
        token: setupToken,
        type: 'TWO_FACTOR_SETUP',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired setup token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!this.verifyTOTP(user.twoFactorSecret, code)) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      }),
      this.prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Two-factor authentication enabled successfully' };
  }

  async disable2FA(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    if (!this.verifyTOTP(user.twoFactorSecret, code)) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { message: 'Two-factor authentication disabled' };
  }

  async verify2FA(userId: number, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    if (!this.verifyTOTP(user.twoFactorSecret, code)) {
      throw new UnauthorizedException('Invalid verification code');
    }

    return true;
  }

  async regenerateBackupCodes(userId: number, code: string) {
    await this.verify2FA(userId, code);
    const newBackupCodes = this.generateBackupCodes();
    return { backupCodes: newBackupCodes };
  }

  private generateSecret(length: number = 20): string {
    const buffer = randomBytes(length);
    return this.base32Encode(buffer);
  }

  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  private generateOTPAuthURL(email: string, secret: string): string {
    const issuer = encodeURIComponent('UserManagement');
    const account = encodeURIComponent(email);
    return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  }

  private verifyTOTP(secret: string, code: string): boolean {
    const now = Math.floor(Date.now() / 1000);

    for (let i = -this.TOTP_WINDOW; i <= this.TOTP_WINDOW; i++) {
      const timeStep = Math.floor(now / this.TOTP_STEP) + i;
      const expectedCode = this.generateTOTP(secret, timeStep);
      if (expectedCode === code) {
        return true;
      }
    }
    return false;
  }

  private generateTOTP(secret: string, timeStep: number): string {
    const time = Buffer.alloc(8);
    time.writeBigInt64BE(BigInt(timeStep));

    const decodedSecret = this.base32Decode(secret);
    const hmac = createHmac('sha1', decodedSecret);
    hmac.update(time);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;

    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        result += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 31];
    }

    return result;
  }

  private base32Decode(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;

    for (const char of encoded.toUpperCase()) {
      const index = alphabet.indexOf(char);
      if (index === -1) continue;

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(bytes);
  }
}
