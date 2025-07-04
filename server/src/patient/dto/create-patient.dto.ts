import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  dateOfBirth?: Date;

  @ApiProperty({
    example: { allergies: ['penicillin'], conditions: ['hypertension'] },
    required: false,
  })
  medicalHistory?: Record<string, any>;
}
