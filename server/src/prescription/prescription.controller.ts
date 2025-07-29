import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Prescription } from './entities/prescription.entity';
import { RequestWithUser } from 'src/shared/types/request.types';

@ApiTags('Prescription')
@ApiBearerAuth()
@Roles(Role.DOCTOR, Role.ADMIN)
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  /*=======================================================
                  CREATE  PRESCRIPTION
  ========================================================*/
  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({
    status: 201,
    description: 'Prescription created successfully',
    type: Prescription,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() dto: CreatePrescriptionDto): Promise<Prescription> {
    return this.prescriptionService.create(dto);
  }

  /*=======================================================
              GET ALL PRESCRIPTIONS
  ========================================================*/
  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get()
  @ApiOperation({ summary: 'Get all prescriptions' })
  @ApiResponse({
    status: 200,
    description: 'List of prescriptions',
    type: [Prescription],
  })
  async findAll(@Req() req: RequestWithUser): Promise<Prescription[]> {
    return this.prescriptionService.findAll(req.user.sub, req.user.role);
  }

  /*=======================================================
              GET PRESCRIPTION BY ID
  ========================================================*/
  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Prescription found',
    type: Prescription,
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Prescription> {
    return this.prescriptionService.findOne(id);
  }

  /*=======================================================
            GET PRESCRIPTIONS BY PATIENT ID
========================================================*/
  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all prescriptions for a specific patient' })
  @ApiResponse({
    status: 200,
    description: 'List of prescriptions for the given patient',
    type: [Prescription],
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findByPatientId(
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ): Promise<Prescription[]> {
    return this.prescriptionService.findByPatientId(patientId);
  }

  /*=======================================================
              UPDATE PRESCRIPTION BY ID
  ========================================================*/
  @Patch(':id')
  @ApiOperation({ summary: 'Update prescription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Prescription updated successfully',
    type: Prescription,
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrescriptionDto,
  ): Promise<Prescription> {
    return this.prescriptionService.update(id, dto);
  }

  /*=======================================================
              DELETE PRESCRIPTION BY ID
  ========================================================*/
  @Delete(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete prescription by ID' })
  @ApiResponse({
    status: 204,
    description: 'Prescription deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.prescriptionService.remove(id);
  }
}
