import { ApiProperty } from '@nestjs/swagger';
import { PatientResponseDto } from 'src/patient/dto/patient-response.dto';
import { DoctorResponseDto } from 'src/doctor/dto/doctor-response.dto';

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  comment: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty()
  patient: PatientResponseDto;

  @ApiProperty()
  doctor: DoctorResponseDto;

  @ApiProperty()
  createdAt: Date;
}
