import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';
import { InventoryItemPaginatedDto } from './dto/inventory-item-paginated.dto';
import { Medicine } from '../medicine/entities/medicine.entity';
import { Pharmacy } from 'src/pharmacy/entity/pharmacy.entity';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { InventoryFilter } from './dto/inventory-filter.dto';

@Injectable()
export class InventoryItemService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
  ) {}

  async create(
    createDto: CreateInventoryItemDto,
  ): Promise<InventoryItemResponseDto> {
    const medicine = await this.medicineRepository.findOne({
      where: { id: createDto.medicineId },
    });
    if (!medicine) {
      throw new NotFoundException(
        `Medicine with ID ${createDto.medicineId} not found`,
      );
    }

    const pharmacy = await this.pharmacyRepository.findOne({
      where: { id: createDto.pharmacyId },
      relations: ['institution'],
    });
    if (!pharmacy) {
      throw new NotFoundException(
        `Pharmacy with ID ${createDto.pharmacyId} not found`,
      );
    }

    // Check if item already exists
    const existingItem = await this.inventoryItemRepository.findOne({
      where: {
        medicine: { id: createDto.medicineId },
        pharmacy: { id: createDto.pharmacyId },
      },
    });

    if (existingItem) {
      throw new BadRequestException(
        'Inventory item for this medicine already exists in this pharmacy',
      );
    }

    const inventoryItem = this.inventoryItemRepository.create({
      quantity: createDto.quantity,
      reorderThreshold: createDto.reorderThreshold,
      medicine,
      pharmacy,
      lastRestocked: new Date(),
    });

    const savedItem = await this.inventoryItemRepository.save(inventoryItem);
    return this.mapToResponseDto(savedItem);
  }

  async findAll(
    pagination: PaginationDto,
    filters: InventoryFilter,
  ): Promise<InventoryItemPaginatedDto> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<InventoryItem> = {};

    if (filters.pharmacyId) {
      where.pharmacy = { id: filters.pharmacyId };
    }

    if (filters.medicineId) {
      where.medicine = { id: filters.medicineId };
    }

    if (filters.lowStock) {
      where.quantity = LessThan(filters.reorderThreshold || 0);
    }

    const [items, total] = await this.inventoryItemRepository.findAndCount({
      where,
      relations: ['medicine', 'pharmacy', 'pharmacy.institution'],
      take: limit,
      skip,
      order: { lastRestocked: 'DESC' },
    });

    return {
      data: items.map((item) => this.mapToResponseDto(item)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<InventoryItemResponseDto> {
    const item = await this.inventoryItemRepository.findOne({
      where: { id },
      relations: ['medicine', 'pharmacy', 'pharmacy.institution'],
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return this.mapToResponseDto(item);
  }

  async update(
    id: string,
    updateDto: UpdateInventoryItemDto,
  ): Promise<InventoryItemResponseDto> {
    const item = await this.inventoryItemRepository.findOne({
      where: { id },
      relations: ['medicine', 'pharmacy'],
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    if (updateDto.quantity !== undefined) {
      item.quantity = updateDto.quantity;
    }

    if (updateDto.reorderThreshold !== undefined) {
      item.reorderThreshold = updateDto.reorderThreshold;
    }

    const updatedItem = await this.inventoryItemRepository.save(item);
    return this.mapToResponseDto(updatedItem);
  }

  async restock(
    id: string,
    quantity: number,
  ): Promise<InventoryItemResponseDto> {
    const item = await this.inventoryItemRepository.findOne({
      where: { id },
      relations: ['medicine', 'pharmacy'],
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    if (quantity <= 0) {
      throw new BadRequestException('Restock quantity must be greater than 0');
    }

    item.quantity += quantity;
    item.lastRestocked = new Date();

    const updatedItem = await this.inventoryItemRepository.save(item);
    return this.mapToResponseDto(updatedItem);
  }

  async remove(id: string): Promise<void> {
    const result = await this.inventoryItemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
  }

  private mapToResponseDto(item: InventoryItem): InventoryItemResponseDto {
    return {
      id: item.id,
      quantity: item.quantity,
      reorderThreshold: item.reorderThreshold,
      lastRestocked: item.lastRestocked,
      medicine: {
        id: item.medicine.id,
        name: item.medicine.name,
        genericName: item.medicine.genericName,
        description: item.medicine.description,
        price: item.medicine.price,
        manufacturer: item.medicine.manufacturer,
        barcode: item.medicine.barcode,
        createdAt: item.medicine.createdAt,
        updatedAt: item.medicine.updatedAt,
      },
      pharmacy: {
        id: item.pharmacy.id,
        name: item.pharmacy.name,
        address: item.pharmacy.address,
        contactPhone: item.pharmacy.contactPhone,
        licenseNumber: item.pharmacy.licenseNumber,
        inventoryIds:
          item.pharmacy.inventory?.map((inventory) => inventory.id) || [],
        orderIds: item.pharmacy.orders?.map((order) => order.id) || [],
        pharmacistIds:
          item.pharmacy.pharmacists?.map((pharmacist) => pharmacist.id) || [],
      },
    };
  }
}
