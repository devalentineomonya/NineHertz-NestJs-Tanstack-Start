import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePharmacistDto } from './dto/create-pharmacist.dto';
import { PharmacistResponseDto } from './dto/pharmacist-response.dto';
import { UpdatePharmacistDto } from './dto/update-pharmacist.dto';
import { PharmacistService } from './pharmacist.service';

@ApiTags('Pharmacists')
@Controller('pharmacists')
export class PharmacistController {
  constructor(private readonly pharmacistService: PharmacistService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pharmacist' })
  @ApiResponse({
    status: 201,
    description: 'Pharmacist created',
    type: PharmacistResponseDto,
  })
  create(
    @Body() createDto: CreatePharmacistDto,
  ): Promise<PharmacistResponseDto> {
    return this.pharmacistService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pharmacists' })
  @ApiResponse({
    status: 200,
    description: 'List of pharmacists',
    type: [PharmacistResponseDto],
  })
  findAll(): Promise<PharmacistResponseDto[]> {
    return this.pharmacistService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pharmacist by ID' })
  @ApiParam({ name: 'id', description: 'Pharmacist ID' })
  @ApiResponse({
    status: 200,
    description: 'Pharmacist found',
    type: PharmacistResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pharmacist not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PharmacistResponseDto> {
    return this.pharmacistService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get a pharmacist by User ID' })
  @ApiParam({
    name: 'userId',
    description: 'User ID associated with the pharmacist',
  })
  @ApiResponse({
    status: 200,
    description: 'Pharmacist found',
    type: PharmacistResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pharmacist not found' })
  findByUserId(
    @Param('userId') userId: string,
  ): Promise<PharmacistResponseDto> {
    return this.pharmacistService.findByUserId(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a pharmacist' })
  @ApiParam({ name: 'id', description: 'Pharmacist ID' })
  @ApiResponse({
    status: 200,
    description: 'Pharmacist updated',
    type: PharmacistResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pharmacist not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePharmacistDto,
  ): Promise<PharmacistResponseDto> {
    return this.pharmacistService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pharmacist' })
  @ApiParam({ name: 'id', description: 'Pharmacist ID' })
  @ApiResponse({ status: 204, description: 'Pharmacist deleted' })
  @ApiResponse({ status: 404, description: 'Pharmacist not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.pharmacistService.remove(id);
  }
}
