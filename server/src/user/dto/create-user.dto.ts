import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  profilePicture?: string;

  @ApiPropertyOptional({ example: 'password123' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'google_oauth_id' })
  @IsOptional()
  googleId?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.PATIENT })
  @IsEnum(UserRole)
  role: UserRole;
}
