import { ApiProperty } from '@nestjs/swagger';
import {
  IsJWT,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'JWT token for password reset' })
  @IsString({ message: 'The token must be a string.' })
  @IsJWT({ message: 'The token must be a valid JWT.' })
  @IsNotEmpty({ message: 'The token field cannot be empty.' })
  token: string;

  @ApiProperty({ description: 'New password for the user' })
  @IsString({ message: 'The new password must be a string.' })
  @IsStrongPassword(undefined, {
    message:
      'The new password must be strong (include uppercase, lowercase, numbers, and symbols).',
  })
  @MinLength(6, {
    message: 'The new password must be at least 6 characters long.',
  })
  newPassword: string;
}
