import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
// import { AppointmentResponseDto } from 'src/appointment/dto/appointment-response.dto';
// import { ConsultationResponseDto } from 'src/consultation/dto/consultation-response.dto';
// import { CreatePrescriptionDto } from 'src/prescription/dto/create-prescription.dto';
// import { OrderResponseDto } from 'src/order/dto/order-response.dto';

export class PatientResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique patient ID',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Patient full name',
  })
  fullName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Patient phone number',
  })
  phone: string;

  @ApiProperty({
    example: '1990-01-15',
    description: 'Patient date of birth',
  })
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
  // @ApiProperty({
  //   type: AppointmentResponseDto,
  //   description: 'Associated user appointments',
  // })
  // appointments: AppointmentResponseDto[];
  // @ApiProperty({
  //   type: ConsultationResponseDto,
  //   description: 'Associated user consultations',
  // })
  // consultations: ConsultationResponseDto[];
  // @ApiProperty({
  //   type: CreatePrescriptionDto,
  //   description: 'Associated user appointments',
  // })
  // prescriptions: CreatePrescriptionDto[];
  //   @ApiProperty({
  //     type: OrderResponseDto,
  //     description: 'Associated user appointments',
  //   })
  //   orders: OrderResponseDto[];
}
