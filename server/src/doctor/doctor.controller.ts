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
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { DoctorFilterDto } from './dto/doctor-filter.dto';
import { DoctorAvailabilityDto } from './dto/availability-slot.dto';
import { RequestWithUser } from 'src/shared/types/request.types';

@ApiTags('Doctor')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  /*=======================================================
                  CREATE  DOCTOR PROFILE
  ========================================================*/
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new doctor profile' })
  @ApiResponse({
    status: 201,
    description: 'Doctor created successfully',
    type: DoctorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  /*=======================================================
              GET ALL DOCTORS WITH FILTERS & PAGINATION
  ========================================================*/
  @Get()
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({
    status: 200,
    description: 'List of doctors',
    type: [DoctorResponseDto],
  })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: DoctorFilterDto,
    @Req() req: RequestWithUser,
  ) {
    return this.doctorService.findAll(
      pagination,
      filters,
      req.user.sub,
      req.user.role,
    );
  }

  /*=======================================================
                    GET DOCTOR BY ID
    ========================================================*/
  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiResponse({
    status: 200,
    description: 'Doctor details',
    type: DoctorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  /*=======================================================
                GET DOCTOR BY USER ID
    ========================================================*/
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get doctor by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Doctor details by user ID',
    type: DoctorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.doctorService.findByUserId(userId);
  }

  /*=======================================================
                  UPDATE DOCTOR PROFILE BY ID
  ========================================================*/
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update doctor profile' })
  @ApiResponse({
    status: 200,
    description: 'Doctor updated successfully',
    type: DoctorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  /*=======================================================
                  DELETE DOCTOR PROFILE BY ID
  ========================================================*/
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete doctor profile' })
  @ApiResponse({ status: 204, description: 'Doctor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }

  /*=======================================================
              GET DOCTOR AVAILABILITY BY ID
  ========================================================*/
  @Get(':id/availability')
  @ApiOperation({ summary: 'Get doctor availability' })
  @ApiResponse({
    status: 200,
    description: 'Doctor availability',
    type: DoctorAvailabilityDto,
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  getAvailability(@Param('id') id: string) {
    return this.doctorService.getDoctorAvailability(id);
  }
}
