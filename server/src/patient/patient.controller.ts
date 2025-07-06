import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
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

  @Get()
  async findAll(): Promise<PatientResponseDto[]> {
    return await this.patientService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PatientResponseDto> {
    return await this.patientService.findOne(id);
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<PatientResponseDto> {
    return await this.patientService.findByUserId(userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return await this.patientService.update(id, updatePatientDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.patientService.remove(id);
  }
}
