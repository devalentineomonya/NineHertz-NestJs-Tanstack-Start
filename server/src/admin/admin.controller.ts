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
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminResponseDto } from './dto/admin-response.dto';
import { AdminPaginatedDto } from './dto/admin-paginated.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin profile' })
  @ApiResponse({
    status: 201,
    description: 'Admin profile created successfully',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admins with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of admins',
    type: AdminPaginatedDto,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['super', 'support'],
    description: 'Filter by admin type',
  })
  findAll(@Query() pagination: PaginationDto, @Query('type') type?: string) {
    return this.adminService.findAll(pagination, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin details',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get admin by User ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin details by User ID',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.adminService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin profile' })
  @ApiResponse({
    status: 200,
    description: 'Admin updated successfully',
    type: AdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin profile' })
  @ApiResponse({ status: 204, description: 'Admin deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }
}
