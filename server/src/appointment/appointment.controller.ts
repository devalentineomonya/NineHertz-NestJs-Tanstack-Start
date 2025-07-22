import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { RequestWithUser } from 'src/shared/types/request.types';
import { AppointmentService } from './appointment.service';
import { AppointmentFilter } from './dto/appointment-filter.dto';
import { AppointmentPaginatedDto } from './dto/appointment-paginated.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('Appointment')
@Roles(Role.DOCTOR, Role.PATIENT, Role.ADMIN)
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  /*=======================================================
                  CREATE  APPOINTMENT
  ========================================================*/

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Patient or Doctor not found' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  /*=======================================================
                  GET ALL  APPOINTMENTS
  ========================================================*/

  @Get()
  @ApiOperation({ summary: 'Get all appointments with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments',
    type: AppointmentPaginatedDto,
  })
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: AppointmentFilter,
    @Req() req: RequestWithUser,
  ) {
    console.log(req.user);
    return this.appointmentService.findAll(
      pagination,
      filters,
      req.user.sub,
      req.user.role,
    );
  }

  /*=======================================================
                  GET  APPOINTMENT WITH ID
  ========================================================*/

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

  /*=======================================================
                  UPDATE  APPOINTMENT WITH ID
  ========================================================*/

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

  /*=======================================================
                  DELETE  APPOINTMENT WITH ID
  ========================================================*/

  @Get('video-token/:callId')
  async getVideoToken(
    @Param('callId') callId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    return this.appointmentService.getVideoUserToken(callId, userId);
  }

  /*=======================================================
                  DELETE  APPOINTMENT WITH ID
  ========================================================*/

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 204, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}
