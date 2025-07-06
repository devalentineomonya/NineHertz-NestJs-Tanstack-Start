import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { Repository } from 'typeorm';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';
import { MedicinePaginatedDto } from './dto/medicine-paginated.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { MedicineFilter } from './dto/medicine-filter.dto';
import { InventoryItem } from '../inventory-item/entities/inventory-item.entity';

@Injectable()
export class MedicineService {
  constructor(
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
  ) {}

  async create(createDto: CreateMedicineDto): Promise<MedicineResponseDto> {
    // Check for duplicate barcode
    if (createDto.barcode) {
      const existing = await this.medicineRepository.findOne({
        where: { barcode: createDto.barcode },
      });
      if (existing) {
        throw new BadRequestException(
          'Medicine with this barcode already exists',
        );
      }
    }

    const medicine = this.medicineRepository.create(createDto);
    const savedMedicine = await this.medicineRepository.save(medicine);
    return this.mapToResponseDto(savedMedicine);
  }

  async findAll(
    pagination: PaginationDto,
    filters: MedicineFilter,
  ): Promise<MedicinePaginatedDto> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const query = this.medicineRepository
      .createQueryBuilder('medicine')
      .take(limit)
      .skip(skip);

    if (filters.search) {
      query.andWhere(
        `(medicine.name ILIKE :search OR medicine.genericName ILIKE :search)`,
        { search: `%${filters.search}%` },
      );
    }

    if (filters.manufacturer) {
      query.andWhere('medicine.manufacturer ILIKE :manufacturer', {
        manufacturer: `%${filters.manufacturer}%`,
      });
    }

    if (filters.minPrice !== undefined) {
      query.andWhere('medicine.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      query.andWhere('medicine.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    const [medicines, total] = await query.getManyAndCount();

    return {
      data: medicines.map((medicine) => this.mapToResponseDto(medicine)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<MedicineResponseDto> {
    const medicine = await this.medicineRepository.findOne({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }

    return this.mapToResponseDto(medicine);
  }

  async findByBarcode(barcode: string): Promise<MedicineResponseDto> {
    const medicine = await this.medicineRepository.findOne({
      where: { barcode },
    });

    if (!medicine) {
      throw new NotFoundException(`Medicine with barcode ${barcode} not found`);
    }

    return this.mapToResponseDto(medicine);
  }

  async update(
    id: string,
    updateDto: UpdateMedicineDto,
  ): Promise<MedicineResponseDto> {
    const medicine = await this.medicineRepository.findOne({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }

    // Check for duplicate barcode if updating
    if (updateDto.barcode && updateDto.barcode !== medicine.barcode) {
      const existing = await this.medicineRepository.findOne({
        where: { barcode: updateDto.barcode },
      });
      if (existing) {
        throw new BadRequestException(
          'Another medicine with this barcode already exists',
        );
      }
    }

    Object.assign(medicine, updateDto);
    const updatedMedicine = await this.medicineRepository.save(medicine);
    return this.mapToResponseDto(updatedMedicine);
  }

  async remove(id: string): Promise<void> {
    // Check if medicine has inventory items
    const inventoryCount = await this.inventoryItemRepository.count({
      where: { medicine: { id } },
    });

    if (inventoryCount > 0) {
      throw new BadRequestException(
        'Cannot delete medicine with associated inventory items',
      );
    }

    const result = await this.medicineRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }
  }

  private mapToResponseDto(medicine: Medicine): MedicineResponseDto {
    return {
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      description: medicine.description,
      price: medicine.price,
      manufacturer: medicine.manufacturer,
      barcode: medicine.barcode,
      createdAt: medicine.createdAt,
      updatedAt: medicine.updatedAt,
    };
  }
}
