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
import { InventoryItemService } from './inventory-item.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  // ApiQuery,
} from '@nestjs/swagger';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';
// import { InventoryItemPaginatedDto } from './dto/inventory-item-paginated.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory-items')
export class InventoryItemController {
  constructor(private readonly inventoryItemService: InventoryItemService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({
    status: 201,
    description: 'Inventory item created successfully',
    type: InventoryItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Medicine or Pharmacy not found' })
  create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryItemService.create(createInventoryItemDto);
  }

  // @Get()
  // @ApiOperation({ summary: 'Get all inventory items with pagination' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of inventory items',
  //   type: InventoryItemPaginatedDto,
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
  //   name: 'pharmacyId',
  //   required: false,
  //   type: String,
  //   description: 'Filter by pharmacy ID',
  // })
  // @ApiQuery({
  //   name: 'medicineId',
  //   required: false,
  //   type: String,
  //   description: 'Filter by medicine ID',
  // })
  // @ApiQuery({
  //   name: 'lowStock',
  //   required: false,
  //   type: Boolean,
  //   description: 'Filter items below reorder threshold',
  // })
  // findAll(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 10,
  //   @Query('pharmacyId') pharmacyId?: string,
  //   @Query('medicineId') medicineId?: string,
  //   @Query('lowStock') lowStock?: boolean,
  // ) {
  //   return this.inventoryItemService.findAll(
  //     { page, limit },
  //     { pharmacyId, medicineId, lowStock },
  //   );
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item details',
    type: InventoryItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  findOne(@Param('id') id: string) {
    return this.inventoryItemService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item updated successfully',
    type: InventoryItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  update(
    @Param('id') id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
  ) {
    return this.inventoryItemService.update(id, updateInventoryItemDto);
  }

  @Patch(':id/restock')
  @ApiOperation({ summary: 'Restock inventory item' })
  @ApiResponse({
    status: 200,
    description: 'Inventory restocked successfully',
    type: InventoryItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  restock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.inventoryItemService.restock(id, quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory item' })
  @ApiResponse({
    status: 204,
    description: 'Inventory item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  remove(@Param('id') id: string) {
    return this.inventoryItemService.remove(id);
  }
}
