import { ApiProperty } from '@nestjs/swagger';
import { PharmacyResponseDto } from 'src/pharmacy/dto/pharmacy-response.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

export class PharmacistResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the pharmacist.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Full name of the pharmacist.',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'License number of the pharmacist.',
    example: 'PH123456789',
  })
  licenseNumber: string;

  @ApiProperty({
    description:
      'Unique identifier of the user associated with the pharmacist.',
    example: UserResponseDto,
  })
  user: UserResponseDto | null;

  @ApiProperty({
    description:
      'Unique identifier of the pharmacy associated with the pharmacist.',
    example: PharmacistResponseDto,
  })
  pharmacy: PharmacyResponseDto | null;

  @ApiProperty({
    description: 'Timestamp when the pharmacist record was created.',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the pharmacist record was last updated.',
    example: '2023-01-02T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Current status of the pharmacist.',
    example: 'active',
  })
  status: string;

  constructor(partial: Partial<PharmacistResponseDto>) {
    Object.assign(this, partial);
  }
}
