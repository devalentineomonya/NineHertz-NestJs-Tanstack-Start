import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() createPatientDto: CreatePatientDto,
  ): Promise<PatientResponseDto> {
    return await this.patientService.create(createPatientDto, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PatientResponseDto> {
    return await this.patientService.findOne(id);
  }
}
