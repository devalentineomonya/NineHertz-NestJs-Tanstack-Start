import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DoctorFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by full name (case-insensitive partial match)',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Filter by medical specialty (exact match)',
    example: 'Cardiology',
  })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({
    description: 'Filter by license number (exact match)',
    example: 'MD-12345',
  })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({
    description: 'Filter by associated user email (exact match)',
    example: 'doctor@example.com',
  })
  @IsOptional()
  @IsString()
  userEmail?: string;
}
