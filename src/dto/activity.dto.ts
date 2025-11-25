import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ActivityQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'login', description: 'Filter by action type' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({ example: 'users', description: 'Filter by resource' })
  @IsString()
  @IsOptional()
  resource?: string;
}

export class SearchActivityDto extends ActivityQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter by user ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ example: 'success', description: 'Filter by status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: '192.168.1.1', description: 'Filter by IP address' })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}

export class ActivityLogResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiPropertyOptional({ example: 1 })
  userId?: number;

  @ApiProperty({ example: 'login' })
  action: string;

  @ApiProperty({ example: 'auth' })
  resource: string;

  @ApiPropertyOptional({ example: '5' })
  resourceId?: string;

  @ApiPropertyOptional({ example: { browser: 'Chrome', os: 'Windows' } })
  details?: Record<string, any>;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  userAgent?: string;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty()
  createdAt: Date;
}

export class PaginatedActivityDto {
  @ApiProperty({ type: [ActivityLogResponseDto] })
  activities: ActivityLogResponseDto[];

  @ApiProperty()
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ActivityStatsDto {
  @ApiProperty({ example: [{ action: 'login', count: 50 }] })
  actionBreakdown: { action: string; count: number }[];

  @ApiProperty({ example: 150 })
  totalActions: number;

  @ApiProperty({ example: 30 })
  periodDays: number;
}

export class LoginHistoryDto {
  @ApiProperty({ example: 'login' })
  action: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress?: string;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty()
  createdAt: Date;
}

export class SecurityEventsDto {
  @ApiProperty({ type: [ActivityLogResponseDto] })
  events: ActivityLogResponseDto[];
}
