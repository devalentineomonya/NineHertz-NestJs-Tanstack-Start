import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // Query,
} from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  // ApiQuery,
} from '@nestjs/swagger';
import { MedicineResponseDto } from './dto/medicine-response.dto';
// import { MedicinePaginatedDto } from './dto/medicine-paginated.dto';

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

  // @Get()
  // @ApiOperation({ summary: 'Get all medicines with pagination' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of medicines',
  //   type: MedicinePaginatedDto,
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
  //   name: 'search',
  //   required: false,
  //   type: String,
  //   description: 'Search by name or generic name',
  // })
  // @ApiQuery({
  //   name: 'manufacturer',
  //   required: false,
  //   type: String,
  //   description: 'Filter by manufacturer',
  // })
  // @ApiQuery({
  //   name: 'minPrice',
  //   required: false,
  //   type: Number,
  //   description: 'Minimum price filter',
  // })
  // @ApiQuery({
  //   name: 'maxPrice',
  //   required: false,
  //   type: Number,
  //   description: 'Maximum price filter',
  // })
  // findAll(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 10,
  //   @Query('search') search?: string,
  //   @Query('manufacturer') manufacturer?: string,
  //   @Query('minPrice') minPrice?: number,
  //   @Query('maxPrice') maxPrice?: number,
  // ) {
  //   return this.medicineService.findAll(
  //     { page, limit },
  //     { search, manufacturer, minPrice, maxPrice },
  //   );
  // }

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
