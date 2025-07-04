import { ApiProperty } from '@nestjs/swagger';
import { AdminType } from 'src/enums/admin.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class Availability {
  @ApiProperty({
    example: ['Monday', 'Wednesday'],
    description: 'Days of availability',
  })
  @IsString({ each: true })
  @IsNotEmpty()
  days: string[];

  @ApiProperty({
    example: ['09:00-12:00', '14:00-17:00'],
    description: 'Hours of availability',
  })
  @IsString({ each: true })
  @IsNotEmpty()
  hours: string[];
}

export class CreateAdminDto {
  @ApiProperty({
    example: 'Jane Smith',
    description: 'Full name of the administrator',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    enum: AdminType,
    example: AdminType.INSTITUTION_ADMIN,
    description: 'Type of admin role',
  })
  @IsEnum(AdminType)
  adminType: AdminType;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email for user account creation',
  })
  @IsString()
  @IsNotEmpty()
  userEmail: string;

  @ApiProperty({
    example: 'Cardiology',
    description: 'Specialty of the admin',
  })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({
    type: Availability,
    description: 'Availability details of the admin',
  })
  @ValidateNested()
  @Type(() => Availability)
  availability: Availability;

  @ApiProperty({
    example: 150,
    description: 'Consultation fee of the admin',
  })
  @IsNumber()
  @IsNotEmpty()
  consultationFee: number;

  @ApiProperty({
    example: 'MD123456',
    description: 'License number of the admin',
  })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;
}
