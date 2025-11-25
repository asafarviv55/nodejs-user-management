import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateUserDto, UserResponseDto } from '../dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<{ success: boolean; user: UserResponseDto }> {
    const newUser = await this.userService.createUser(createUserDto);
    const { password, ...userResponse } = newUser;
    return { success: true, user: userResponse };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllUsers(): Promise<{ success: boolean; users: UserResponseDto[] }> {
    const users = await this.userService.findAllUsers();
    return { success: true, users };
  }
}

