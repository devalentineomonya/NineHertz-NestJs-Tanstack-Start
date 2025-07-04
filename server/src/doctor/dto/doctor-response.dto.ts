import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class DoctorResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique doctor ID',
  })
  id: string;

  @ApiProperty({
    example: 'Dr. Jane Smith',
    description: 'Doctor full name',
  })
  fullName: string;

  @ApiProperty({
    example: 'Cardiology',
    description: 'Doctor specialty',
  })
  specialty: string;

  @ApiProperty({
    example: {
      days: ['Monday', 'Wednesday'],
      hours: ['09:00-12:00', '14:00-17:00'],
    },
    description: 'Doctor availability',
  })
  availability: {
    days: string[];
    hours: string[];
  };

  @ApiProperty({
    example: 150.0,
    description: 'Consultation fee',
  })
  consultationFee: number;

  @ApiProperty({
    example: 'MD123456',
    description: 'Medical license number',
  })
  licenseNumber: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Associated user account',
  })
  user: UserResponseDto;
}
