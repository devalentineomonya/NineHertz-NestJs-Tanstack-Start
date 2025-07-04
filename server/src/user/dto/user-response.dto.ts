import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique identifier for the user',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'admin',
    description: 'User role',
  })
  role: string;

  @ApiProperty({
    example: true,
    description: 'Email verification status',
  })
  isEmailVerified: boolean;

  @ApiProperty({
    example: '2023-08-10T08:00:00.000Z',
    description: 'Account creation date',
  })
  createdAt: Date;
}
