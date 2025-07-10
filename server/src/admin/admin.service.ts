import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { AdminResponseDto } from './dto/admin-response.dto';
import { AdminPaginatedDto } from './dto/admin-paginated.dto';
import { UserService } from '../user/user.service';
import { AdminType } from 'src/enums/admin.enum';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    private userService: UserService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<AdminResponseDto> {
    const user = await this.userService.findOne(createAdminDto.userUuid);
    if (!user) {
      throw new NotFoundException(
        `User with uuid ${createAdminDto.userUuid} was not found`,
      );
    }
    if (user.role !== 'admin') {
      throw new NotFoundException(
        `User with uuid ${createAdminDto.userUuid} does not have the required admin role`,
      );
    }
    const admin = this.adminRepository.create({
      ...createAdminDto,
      user,
    });

    const savedAdmin = await this.adminRepository.save(admin);
    return this.mapToResponseDto(savedAdmin);
  }

  async findAll(
    pagination: PaginationDto,
    type?: string,
  ): Promise<AdminPaginatedDto> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const query = this.adminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.user', 'user')
      .take(limit)
      .skip(skip);

    if (type) {
      query.where('admin.adminType = :type', { type });
    }

    const [admins, total] = await query.getManyAndCount();

    return {
      data: admins.map((admin) => this.mapToResponseDto(admin)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<AdminResponseDto> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      relations: ['institution', 'user'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return this.mapToResponseDto(admin);
  }

  async update(
    id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<AdminResponseDto> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      relations: ['institution', 'user'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    Object.assign(admin, updateAdminDto);
    const updatedAdmin = await this.adminRepository.save(admin);
    return this.mapToResponseDto(updatedAdmin);
  }

  async remove(id: string): Promise<void> {
    const result = await this.adminRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
  }

  private mapToResponseDto(admin: Admin): AdminResponseDto {
    return {
      id: admin.id,
      fullName: admin.fullName,
      adminType: admin.adminType as AdminType,

      user: {
        id: admin.user.id,
        email: admin.user.email,
        role: admin.user.role,
        isEmailVerified: admin.user.isEmailVerified,
        createdAt: admin.user.createdAt,
      },
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
