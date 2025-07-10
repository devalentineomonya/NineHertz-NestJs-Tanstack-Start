import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class FindUsersFilterDto {
  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Filter users by their role',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter users by their email address',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter users by their email verification status',
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Search for users by a keyword',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
