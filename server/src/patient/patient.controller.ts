import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { RequestWithUser } from 'src/shared/types/request.types';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientService } from './patient.service';

@ApiTags('patients')
@Roles(Role.DOCTOR, Role.PATIENT, Role.PHARMACIST, Role.ADMIN)
@ApiBearerAuth()
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  /*=======================================================
                CREATE PATIENT WITH USER ID
  ========================================================*/

  @Post(':userId')
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiParam({
    name: 'userId',
    description: 'User ID associated with the patient',
  })
  @ApiResponse({
    status: 201,
    description: 'Patient created successfully',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Param('userId') userId: string,
    @Body() createPatientDto: CreatePatientDto,
  ): Promise<PatientResponseDto> {
    return await this.patientService.create(createPatientDto, userId);
  }

  /*=======================================================
                        GET ALL PATIENTS
  ========================================================*/

  @Get()
  @ApiOperation({ summary: 'Retrieve all patients' })
  @ApiResponse({
    status: 200,
    description: 'List of patients',
    type: [PatientResponseDto],
  })
  async findAll(@Req() req: RequestWithUser): Promise<PatientResponseDto[]> {
    return await this.patientService.findAll(req.user.sub, req.user.role);
  }

  /*=======================================================
                        GET  PATIENT WITH ID
  ========================================================*/

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient details',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findOne(@Param('id') id: string): Promise<PatientResponseDto> {
    return await this.patientService.findOne(id);
  }

  /*=======================================================
                  GET  PATIENT WITH USER ID
  ========================================================*/

  @Get('user/:userId')
  @ApiOperation({ summary: 'Retrieve a patient by User ID' })
  @ApiParam({
    name: 'userId',
    description: 'User ID associated with the patient',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient details',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<PatientResponseDto> {
    return (await this.patientService.findByUserId(
      userId,
    )) as unknown as PatientResponseDto;
  }

  /*=======================================================
                  UPDATE  PATIENT WITH ID
  ========================================================*/

  @Put(':id')
  @ApiOperation({ summary: 'Update a patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return (await this.patientService.update(
      id,
      updatePatientDto,
    )) as unknown as PatientResponseDto;
  }

  /*=======================================================
                  DELETE  PATIENT WITH ID
  ========================================================*/

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.patientService.remove(id);
  }
}
