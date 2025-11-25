import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Software engineer passionate about code', description: 'Bio' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ example: 'Senior Developer', description: 'Job title' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'Engineering', description: 'Department' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: 'America/New_York', description: 'Timezone' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 'en', description: 'Preferred language' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ example: '1990-01-15', description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country', description: 'Address' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;
}

export class UpdateUsernameDto {
  @ApiProperty({ example: 'johndoe', description: 'New username (3-30 chars, alphanumeric and underscore)' })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,30}$/, {
    message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores',
  })
  username: string;
}

export class ChangeEmailDto {
  @ApiProperty({ example: 'newemail@example.com', description: 'New email address' })
  @IsString()
  newEmail: string;
}

export class UploadAvatarDto {
  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
  @IsString()
  avatarUrl: string;
}

export class ProfileResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'johndoe' })
  username?: string;

  @ApiProperty({ example: true })
  isEmailVerified: boolean;

  @ApiProperty({ example: false })
  twoFactorEnabled: boolean;

  @ApiPropertyOptional()
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    bio?: string;
    jobTitle?: string;
    department?: string;
    timezone: string;
    language: string;
  };

  @ApiProperty()
  createdAt: Date;
}

export class PublicProfileResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiPropertyOptional({ example: 'johndoe' })
  username?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'Software engineer' })
  bio?: string;

  @ApiPropertyOptional({ example: 'Senior Developer' })
  jobTitle?: string;

  @ApiProperty()
  memberSince: Date;
}

export class ProfileCompletenessDto {
  @ApiProperty({ example: 75 })
  completeness: number;

  @ApiProperty({ example: { email: true, firstName: false } })
  fields: Record<string, boolean>;

  @ApiProperty({ example: ['firstName', 'phone'] })
  missingFields: string[];
}
