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
import { MedicineService } from './medicine.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MedicineResponseDto } from './dto/medicine-response.dto';
import { MedicinePaginatedDto } from './dto/medicine-paginated.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { MedicineFilter } from './dto/medicine-filter.dto';

@ApiTags('Medicine')
@ApiBearerAuth()
@Controller('medicines')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medicine' })
  @ApiResponse({
    status: 201,
    description: 'Medicine created successfully',
    type: MedicineResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicineService.create(createMedicineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of medicines',
    type: MedicinePaginatedDto,
  })
  findAll(@Query() pagination: PaginationDto, filter: MedicineFilter) {
    return this.medicineService.findAll(pagination, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine by ID' })
  @ApiResponse({
    status: 200,
    description: 'Medicine details',
    type: MedicineResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findOne(@Param('id') id: string) {
    return this.medicineService.findOne(id);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Get medicine by barcode' })
  @ApiResponse({
    status: 200,
    description: 'Medicine details',
    type: MedicineResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.medicineService.findByBarcode(barcode);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medicine' })
  @ApiResponse({
    status: 200,
    description: 'Medicine updated successfully',
    type: MedicineResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  update(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineDto,
  ) {
    return this.medicineService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete medicine' })
  @ApiResponse({ status: 204, description: 'Medicine deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  @ApiResponse({
    status: 400,
    description: 'Medicine has associated inventory items',
  })
  remove(@Param('id') id: string) {
    return this.medicineService.remove(id);
  }
}
