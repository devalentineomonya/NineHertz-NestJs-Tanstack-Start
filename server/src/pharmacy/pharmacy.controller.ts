import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { PharmacyResponseDto } from './dto/pharmacy-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Pharmacies')
@Controller('pharmacies')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pharmacy' })
  @ApiResponse({
    status: 201,
    description: 'Pharmacy created',
    type: PharmacyResponseDto,
  })
  create(@Body() createDto: CreatePharmacyDto): Promise<PharmacyResponseDto> {
    return this.pharmacyService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pharmacies' })
  @ApiResponse({
    status: 200,
    description: 'List of pharmacies',
    type: [PharmacyResponseDto],
  })
  findAll(): Promise<PharmacyResponseDto[]> {
    return this.pharmacyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pharmacy by ID' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @ApiResponse({
    status: 200,
    description: 'Pharmacy found',
    type: PharmacyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pharmacy not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PharmacyResponseDto> {
    return this.pharmacyService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a pharmacy' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @ApiResponse({
    status: 200,
    description: 'Pharmacy updated',
    type: PharmacyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pharmacy not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePharmacyDto,
  ): Promise<PharmacyResponseDto> {
    return this.pharmacyService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pharmacy' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @ApiResponse({ status: 204, description: 'Pharmacy deleted' })
  @ApiResponse({ status: 404, description: 'Pharmacy not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.pharmacyService.remove(id);
  }
}
