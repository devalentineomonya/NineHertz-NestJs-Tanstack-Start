// src/order/order.controller.ts
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
import { OrderService } from './order.service';
// import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  // ApiQuery,
} from '@nestjs/swagger';
import { OrderResponseDto } from './dto/order-response.dto';
// import { OrderPaginatedDto } from './dto/order-paginated.dto';
// import { OrderStatus } from 'src/enums/order.enum';
@ApiTags('Order')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // @Post()
  // @ApiOperation({ summary: 'Create a new order' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Order created successfully',
  //   type: OrderResponseDto,
  // })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Patient, Pharmacy or Medicine not found',
  // })
  // create(@Body() createOrderDto: CreateOrderDto) {
  //   return this.orderService.create(createOrderDto);
  // }

  // @Get()
  // @ApiOperation({ summary: 'Get all orders with pagination' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of orders',
  //   type: OrderPaginatedDto,
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
  //   enum: OrderStatus,
  //   description: 'Filter by order status',
  // })
  // @ApiQuery({
  //   name: 'patientId',
  //   required: false,
  //   type: String,
  //   description: 'Filter by patient ID',
  // })
  // @ApiQuery({
  //   name: 'pharmacyId',
  //   required: false,
  //   type: String,
  //   description: 'Filter by pharmacy ID',
  // })
  // @ApiQuery({
  //   name: 'fromDate',
  //   required: false,
  //   type: String,
  //   description: 'Filter orders from this date (YYYY-MM-DD)',
  // })
  // @ApiQuery({
  //   name: 'toDate',
  //   required: false,
  //   type: String,
  //   description: 'Filter orders to this date (YYYY-MM-DD)',
  // })
  // findAll(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 10,
  //   @Query('status') status?: OrderStatus,
  //   @Query('patientId') patientId?: string,
  //   @Query('pharmacyId') pharmacyId?: string,
  //   @Query('fromDate') fromDate?: string,
  //   @Query('toDate') toDate?: string,
  // ) {
  //   return this.orderService.findAll(
  //     { page, limit },
  //     { status, patientId, pharmacyId, fromDate, toDate },
  //   );
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Patch(':id/process-payment')
  @ApiOperation({ summary: 'Process payment for an order' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Payment already processed' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  processPayment(
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod: 'stripe' | 'paystack',
    @Body('paymentToken') paymentToken: string,
  ) {
    return this.orderService.processPayment(id, paymentMethod, paymentToken);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancel(@Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
