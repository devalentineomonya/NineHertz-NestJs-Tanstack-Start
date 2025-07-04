import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export type SocialProvider = 'google' | 'github';

export class SocialLoginDto {
  @IsEnum(['google', 'github'])
  provider: SocialProvider;

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;
}
