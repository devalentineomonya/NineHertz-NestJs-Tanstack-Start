import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsObject,
} from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({
    example: 'Dr. Jane Smith',
    description: 'Full name of the doctor',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'Cardiology',
    description: 'Doctor specialty',
  })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({
    example: {
      days: ['Monday', 'Wednesday'],
      hours: ['09:00-12:00', '14:00-17:00'],
    },
    description: 'Doctor availability schedule',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  availability: Record<string, any>;

  @ApiProperty({
    example: 150.0,
    description: 'Consultation fee',
  })
  @IsNumber()
  consultationFee: number;

  @ApiProperty({
    example: 'MD123456',
    description: 'Medical license number',
  })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Healthcare institution ID',
  })
  @IsUUID()
  institutionId: string;

  @ApiProperty({
    example: 'doctor@example.com',
    description: 'Email for user account creation',
  })
  @IsString()
  @IsNotEmpty()
  userEmail: string;
}
