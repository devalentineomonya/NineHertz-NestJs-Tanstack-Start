import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacy } from './entity/pharmacy.entity';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { PharmacyResponseDto } from './dto/pharmacy-response.dto';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
  ) {}

  private mapToResponseDto(pharmacy: Pharmacy): PharmacyResponseDto {
    return new PharmacyResponseDto({
      id: pharmacy.id,
      name: pharmacy.name,
      address: pharmacy.address,
      contactPhone: pharmacy.contactPhone,
      licenseNumber: pharmacy.licenseNumber,
      inventoryIds: pharmacy.inventory?.map((item) => item.id) || [],
      orderIds: pharmacy.orders?.map((order) => order.id) || [],
      pharmacistIds: pharmacy.pharmacists?.map((ph) => ph.id) || [],
    });
  }

  async create(createDto: CreatePharmacyDto): Promise<PharmacyResponseDto> {
    const pharmacy = this.pharmacyRepository.create(createDto);
    const savedPharmacy = await this.pharmacyRepository.save(pharmacy);
    return this.mapToResponseDto(savedPharmacy);
  }

  async findAll(): Promise<PharmacyResponseDto[]> {
    const pharmacies = await this.pharmacyRepository.find({
      relations: ['inventory', 'orders', 'pharmacists'],
    });
    return pharmacies.map((ph) => this.mapToResponseDto(ph));
  }

  async findOne(id: string): Promise<PharmacyResponseDto> {
    const pharmacy = await this.pharmacyRepository.findOne({
      where: { id },
      relations: ['inventory', 'orders', 'pharmacists'],
    });
    if (!pharmacy) throw new NotFoundException('Pharmacy not found');
    return this.mapToResponseDto(pharmacy);
  }

  async update(
    id: string,
    updateDto: UpdatePharmacyDto,
  ): Promise<PharmacyResponseDto> {
    const pharmacy = await this.pharmacyRepository.preload({
      id,
      ...updateDto,
    });

    if (!pharmacy) throw new NotFoundException('Pharmacy not found');

    const updatedPharmacy = await this.pharmacyRepository.save(pharmacy);
    return this.mapToResponseDto(updatedPharmacy);
  }

  async remove(id: string): Promise<void> {
    const result = await this.pharmacyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Pharmacy not found');
    }
  }
}
