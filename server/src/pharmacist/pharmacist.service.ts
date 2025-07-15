import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacist } from './entities/pharmacist.entity';
import { CreatePharmacistDto } from './dto/create-pharmacist.dto';
import { UpdatePharmacistDto } from './dto/update-pharmacist.dto';
import { User } from 'src/user/entities/user.entity';
import { Pharmacy } from 'src/pharmacy/entity/pharmacy.entity';
import { PharmacistResponseDto } from './dto/pharmacy-response.dto';

@Injectable()
export class PharmacistService {
  constructor(
    @InjectRepository(Pharmacist)
    private pharmacistRepository: Repository<Pharmacist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
  ) {}

  private mapToResponseDto(pharmacist: Pharmacist): PharmacistResponseDto {
    return {
      id: pharmacist.id,
      fullName: pharmacist.fullName,
      licenseNumber: pharmacist.licenseNumber,
      createdAt: pharmacist.createdAt,
      updatedAt: pharmacist.updatedAt,
      status: pharmacist.status,
      user: pharmacist.user
        ? {
            id: pharmacist.user.id,
            email: pharmacist.user.email,
            role: pharmacist.user.role,
            isEmailVerified: pharmacist.user.isEmailVerified,
            createdAt: pharmacist.user.createdAt,
          }
        : null,
      pharmacy: pharmacist.pharmacy
        ? {
            name: pharmacist.pharmacy.name,
            id: pharmacist.pharmacy.id,
            address: pharmacist.pharmacy.address,
            contactPhone: pharmacist.pharmacy.contactPhone,
            licenseNumber: pharmacist.pharmacy.licenseNumber,
            createdAt: pharmacist.pharmacy.createdAt,
            updatedAt: pharmacist.pharmacy.updatedAt,
            inventoryIds: pharmacist.pharmacy.inventory?.map((item) => item.id),
            orderIds: pharmacist.pharmacy.orders?.map((order) => order.id),
            pharmacistIds: pharmacist.pharmacy.pharmacists?.map(
              (pharmacist) => pharmacist.id,
            ),
          }
        : null,
    };
  }

  async create(createDto: CreatePharmacistDto): Promise<PharmacistResponseDto> {
    const user = await this.userRepository.findOneBy({ id: createDto.userId });
    if (!user) throw new NotFoundException('User not found');

    const pharmacy = await this.pharmacyRepository.findOneBy({
      id: createDto.pharmacyId,
    });
    if (!pharmacy) throw new NotFoundException('Pharmacy not found');

    const pharmacist = this.pharmacistRepository.create({
      fullName: createDto.fullName,
      licenseNumber: createDto.licenseNumber,
      user,
      pharmacy,
    });

    const savedPharmacist = await this.pharmacistRepository.save(pharmacist);
    return this.mapToResponseDto(savedPharmacist);
  }

  async findAll(): Promise<PharmacistResponseDto[]> {
    const pharmacists = await this.pharmacistRepository.find({
      relations: ['user', 'pharmacy'],
    });
    return pharmacists.map((ph) => this.mapToResponseDto(ph));
  }

  async findOne(id: string): Promise<PharmacistResponseDto> {
    const pharmacist = await this.pharmacistRepository.findOne({
      where: { id },
      relations: ['user', 'pharmacy'],
    });
    if (!pharmacist) throw new NotFoundException('Pharmacist not found');
    return this.mapToResponseDto(pharmacist);
  }

  async update(
    id: string,
    updateDto: UpdatePharmacistDto,
  ): Promise<PharmacistResponseDto> {
    let pharmacist = await this.pharmacistRepository.findOneBy({ id });
    if (!pharmacist) throw new NotFoundException('Pharmacist not found');

    if (updateDto.userId) {
      const user = await this.userRepository.findOneBy({
        id: updateDto.userId,
      });
      if (!user) throw new NotFoundException('User not found');
      pharmacist.user = user;
    }

    if (updateDto.pharmacyId) {
      const pharmacy = await this.pharmacyRepository.findOneBy({
        id: updateDto.pharmacyId,
      });
      if (!pharmacy) throw new NotFoundException('Pharmacy not found');
      pharmacist.pharmacy = pharmacy;
    }

    // Update other properties
    pharmacist = Object.assign(pharmacist, updateDto);
    const updatedPharmacist = await this.pharmacistRepository.save(pharmacist);
    return this.mapToResponseDto(updatedPharmacist);
  }

  async remove(id: string): Promise<void> {
    const result = await this.pharmacistRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Pharmacist not found');
    }
  }
}
