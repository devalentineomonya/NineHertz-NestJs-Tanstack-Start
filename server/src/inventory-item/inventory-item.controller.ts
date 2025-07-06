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
import { InventoryItemService } from './inventory-item.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';
import { InventoryItemPaginatedDto } from './dto/inventory-item-paginated.dto';
import { InventoryFilter } from './dto/inventory-filter.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

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

  @Get()
  @ApiOperation({ summary: 'Get all inventory items with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of inventory items',
    type: InventoryItemPaginatedDto,
  })
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: InventoryFilter,
  ) {
    return this.inventoryItemService.findAll(pagination, filters);
  }

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
