import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { DoctorFilterDto } from './dto/doctor-filter.dto';
import { DoctorAvailabilityDto } from './dto/availability-slot.dto';

@ApiTags('Doctor')
@ApiBearerAuth()
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new doctor profile' })
  @ApiResponse({
    status: 201,
    description: 'Doctor created successfully',
    type: DoctorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Institution not found' })
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: DoctorFilterDto,
  ) {
    return this.doctorService.findAll(pagination, filters);
  }

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

  @Patch(':id')
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete doctor profile' })
  @ApiResponse({ status: 204, description: 'Doctor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get doctor availability' })
  @ApiResponse({
    status: 200,
    description: 'Doctor availability',
    type: DoctorAvailabilityDto,
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  getAvailability(
    @Param('id') id: string,
    // @Query('dayOfWeek') dayOfWeek?: DoctorAvailabilityQueryDto,
  ) {
    return this.doctorService.getDoctorAvailability(id);
  }
}
