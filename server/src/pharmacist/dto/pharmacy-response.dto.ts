import { ApiProperty } from '@nestjs/swagger';

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
    example: '456e7890-e12b-34d5-c678-901234567890',
  })
  userId: string;

  @ApiProperty({
    description:
      'Unique identifier of the pharmacy associated with the pharmacist.',
    example: '789e0123-f45b-67d8-e901-234567890123',
  })
  pharmacyId: string;

  constructor(partial: Partial<PharmacistResponseDto>) {
    Object.assign(this, partial);
  }
}
