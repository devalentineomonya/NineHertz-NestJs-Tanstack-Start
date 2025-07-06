import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class FindUsersFilterDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
