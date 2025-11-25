import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(newUser: Omit<User, 'id'>): Promise<{ message: string; token: string }> {
    const existingUser = await this.userService.existsByEmail(newUser.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const user = await this.userService.createUser(newUser);
    const token = this.generateToken(user);

    return { message: 'User registered successfully', token };
  }

  async login(credentials: { email: string; password: string }): Promise<{ message: string; token: string }> {
    const user = await this.userService.findByEmail(credentials.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await this.userService.validatePassword(
      credentials.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.generateToken(user);

    return { message: 'Login successful', token };
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '10d'),
    });
  }

  verifyToken(token: string): { sub: number; email: string } {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }
}