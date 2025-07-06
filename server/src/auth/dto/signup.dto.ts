import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'The password of the user. Must be at least 8 characters long.',
    example: 'strongPassword123',
  })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
