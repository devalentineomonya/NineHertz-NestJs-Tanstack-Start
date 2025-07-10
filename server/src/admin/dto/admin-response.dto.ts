import { ApiProperty } from '@nestjs/swagger';
import { AdminType } from 'src/enums/admin.enum';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

export class AdminResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique identifier for the admin',
  })
  id: string;

  @ApiProperty({
    example: 'Jane Smith',
    description: 'Full name of the administrator',
  })
  fullName: string;

  @ApiProperty({
    enum: AdminType,
    example: AdminType.SUPPORT_ADMIN,
    description: 'Type of admin role',
  })
  adminType: AdminType;

  @ApiProperty({
    type: () => UserResponseDto,
    description: 'Linked user account information',
  })
  user: UserResponseDto;

  @ApiProperty({
    example: '2023-08-15T10:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-08-20T14:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
