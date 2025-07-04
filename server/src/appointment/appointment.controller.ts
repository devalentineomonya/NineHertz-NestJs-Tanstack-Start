import {
  Controller,
  Get,
  // Post,
  Body,
  Patch,
  Param,
  Delete,
  // Query,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
// import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  // ApiQuery,
} from '@nestjs/swagger';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
// import { AppointmentPaginatedDto } from './dto/appointment-paginated.dto';

@ApiTags('Appointment')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // @Post()
  // @ApiOperation({ summary: 'Create a new appointment' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Appointment created successfully',
  //   type: AppointmentResponseDto,
  // })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 404, description: 'Patient or Doctor not found' })
  // create(@Body() createAppointmentDto: CreateAppointmentDto) {
  //   return this.appointmentService.create(createAppointmentDto);
  // }

  // @Get()
  // @ApiOperation({ summary: 'Get all appointments with pagination' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of appointments',
  //   type: AppointmentPaginatedDto,
  // })
  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   type: Number,
  //   description: 'Page number (default: 1)',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   type: Number,
  //   description: 'Items per page (default: 10)',
  // })
  // @ApiQuery({
  //   name: 'status',
  //   required: false,
  //   enum: ['scheduled', 'completed', 'cancelled'],
  //   description: 'Filter by appointment status',
  // })
  // @ApiQuery({
  //   name: 'patientId',
  //   required: false,
  //   type: String,
  //   description: 'Filter by patient ID',
  // })
  // @ApiQuery({
  //   name: 'doctorId',
  //   required: false,
  //   type: String,
  //   description: 'Filter by doctor ID',
  // })
  // findAll(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 10,
  //   @Query('status') status?: string,
  //   @Query('patientId') patientId?: string,
  //   @Query('doctorId') doctorId?: string,
  // ) {
  //   return this.appointmentService.findAll(
  //     { page, limit },
  //     { status, patientId, doctorId },
  //   );
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment details',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 204, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}
