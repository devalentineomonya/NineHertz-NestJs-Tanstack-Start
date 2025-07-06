import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordInitiateDto {
  @ApiProperty({
    description: 'The email address of the user requesting a password reset',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
