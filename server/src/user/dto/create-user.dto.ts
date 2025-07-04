import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123', required: false })
  password?: string;

  @ApiProperty({ example: 'google_oauth_id', required: false })
  googleId?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;
}
