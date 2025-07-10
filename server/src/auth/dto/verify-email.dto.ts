import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'The email address to be verified.',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description:
      'The one-time password (OTP) sent to the email for verification.',
    example: '123456',
  })
  otp: string;
}
