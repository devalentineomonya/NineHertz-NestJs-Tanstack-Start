// src/consultation/dto/consultation-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PatientResponseDto } from '../../patient/dto/patient-response.dto';
import { DoctorResponseDto } from '../../doctor/dto/doctor-response.dto';

export class ConsultationResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique consultation ID',
  })
  id: string;

  @ApiProperty({
    example: '2023-12-15T10:30:00Z',
    description: 'Consultation start time',
  })
  startTime: Date;

  @ApiProperty({
    example: '2023-12-15T11:00:00Z',
    description: 'Consultation end time',
  })
  endTime: Date;

  @ApiProperty({
    example: 'session_123456789',
    description: 'Video session ID',
  })
  videoSessionId: string;

  @ApiProperty({
    example: 30,
    description: 'Duration in minutes',
  })
  duration: number;

  @ApiProperty({
    example: 'Patient presented with flu symptoms.',
    description: 'Doctor notes',
  })
  notes: string;

  @ApiProperty({
    type: PatientResponseDto,
    description: 'Patient details',
  })
  patient: PatientResponseDto;

  @ApiProperty({
    type: DoctorResponseDto,
    description: 'Doctor details',
  })
  doctor: DoctorResponseDto;

  @ApiProperty({
    example: '2023-11-01T08:00:00Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-11-05T14:30:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
