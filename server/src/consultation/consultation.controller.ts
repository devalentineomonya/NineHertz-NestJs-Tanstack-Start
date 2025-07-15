import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { RequestWithUser } from 'src/shared/types/request.types';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ConsultationResponseDto } from './dto/consultation-response.dto';
import { ConsultationPaginatedDto } from './dto/consultation-paginated.dto';

@ApiTags('Consultation')
@ApiBearerAuth()
@Roles(Role.DOCTOR, Role.PATIENT, Role.ADMIN)
@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  /*=======================================================
                    CREATE  CONSULTATION
  ========================================================*/
  @Post()
  @ApiOperation({ summary: 'Create a new consultation' })
  @ApiResponse({
    status: 201,
    description: 'Consultation created successfully',
    type: ConsultationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Patient or Doctor not found' })
  create(@Body() createConsultationDto: CreateConsultationDto) {
    return this.consultationService.create(createConsultationDto);
  }

  /*=======================================================
              GET ALL CONSULTATIONS WITH FILTERS
  ========================================================*/
  @Get()
  @ApiOperation({ summary: 'Get all consultations with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of consultations',
    type: ConsultationPaginatedDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    type: String,
    description: 'Filter by patient ID',
  })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    type: String,
    description: 'Filter by doctor ID',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by date (YYYY-MM-DD)',
  })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Req() req: RequestWithUser,
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
  ) {
    return this.consultationService.findAll(
      { page, limit },
      { patientId, doctorId, date },
      req.user.sub,
      req.user.role,
    );
  }

  /*=======================================================
                  GET  CONSULTATION BY ID
  ========================================================*/
  @Get(':id')
  @ApiOperation({ summary: 'Get consultation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Consultation details',
    type: ConsultationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  findOne(@Param('id') id: string) {
    return this.consultationService.findOne(id);
  }

  /*=======================================================
                  UPDATE  CONSULTATION BY ID
  ========================================================*/
  @Patch(':id')
  @ApiOperation({ summary: 'Update consultation' })
  @ApiResponse({
    status: 200,
    description: 'Consultation updated successfully',
    type: ConsultationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ) {
    return this.consultationService.update(id, updateConsultationDto);
  }

  /*=======================================================
                  DELETE  CONSULTATION BY ID
  ========================================================*/
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete consultation' })
  @ApiResponse({
    status: 204,
    description: 'Consultation deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  remove(@Param('id') id: string) {
    return this.consultationService.remove(id);
  }
}
