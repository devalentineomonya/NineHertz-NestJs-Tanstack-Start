import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class PatientResponseDto {
  @ApiProperty({ description: 'Unique patient ID' })
  id: string;

  @ApiProperty({ description: 'Patient full name' })
  fullName: string;

  @ApiProperty({ description: 'Patient phone number' })
  phone: string;

  @ApiProperty({ description: 'Patient date of birth' })
  dateOfBirth: Date;

  @ApiProperty({
    example: { allergies: ['penicillin'], conditions: ['asthma'] },
    description: 'Medical history',
  })
  medicalHistory: Record<string, any>;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Associated user account',
  })
  user: UserResponseDto;

  @ApiProperty({
    type: [Object],
    description: 'Associated orders',
    example: [
      {
        id: 'ord_123',
        status: 'completed',
        orderDate: '2023-01-01',
        totalAmount: 99.99,
      },
    ],
  })
  orders?: {
    id: string;
    status: string;
    orderDate: Date;
    totalAmount: number;
  }[];

  @ApiProperty({
    type: [Object],
    description: 'Associated appointments',
    example: [
      { id: 'app_123', datetime: '2023-01-01T10:00:00Z', status: 'confirmed' },
    ],
  })
  appointments?: {
    id: string;
    datetime: Date;
    status: string;
  }[];

  @ApiProperty({
    type: [Object],
    description: 'Associated prescriptions',
    example: [
      { id: 'rx_123', issueDate: '2023-01-01', expiryDate: '2024-01-01' },
    ],
  })
  prescriptions?: {
    id: string;
    issueDate: Date;
    expiryDate: Date;
  }[];

  @ApiProperty({
    description: 'Patient status (active or inactive)',
    example: 'active',
  })
  status?: 'active' | 'inactive';
}
