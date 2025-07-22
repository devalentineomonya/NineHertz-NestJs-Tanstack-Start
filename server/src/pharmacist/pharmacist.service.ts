import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePharmacistDto } from './dto/create-pharmacist.dto';
import { PharmacistResponseDto } from './dto/pharmacist-response.dto';
import { UpdatePharmacistDto } from './dto/update-pharmacist.dto';
import { Pharmacist } from './entities/pharmacist.entity';

@Injectable()
export class PharmacistService {
  constructor(
    @InjectRepository(Pharmacist)
    private pharmacistRepository: Repository<Pharmacist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private mapToResponseDto(pharmacist: Pharmacist): PharmacistResponseDto {
    return {
      id: pharmacist.id,
      fullName: pharmacist.fullName,
      licenseNumber: pharmacist.licenseNumber,
      phoneNumber: pharmacist.phoneNumber,
      createdAt: pharmacist.createdAt,
      updatedAt: pharmacist.updatedAt,
      status: pharmacist.status,
      user: pharmacist.user
        ? {
            id: pharmacist.user.id,
            email: pharmacist.user.email,
            role: pharmacist.user.role,
            isEmailVerified: pharmacist.user.isEmailVerified,
            profilePicture: pharmacist.user?.profilePicture || '',
            createdAt: pharmacist.user.createdAt,
          }
        : null,
    };
  }

  async create(createDto: CreatePharmacistDto): Promise<PharmacistResponseDto> {
    const user = await this.userRepository.findOneBy({ id: createDto.userId });
    if (!user) throw new NotFoundException('User not found');

    const existingPharmacist = await this.pharmacistRepository.findOne({
      where: [
        { licenseNumber: createDto.licenseNumber },
        { phoneNumber: createDto.phoneNumber },
      ],
    });

    if (existingPharmacist) {
      throw new NotFoundException(
        'A pharmacist with the same license number or phone number already exists',
      );
    }

    const pharmacist = this.pharmacistRepository.create({
      fullName: createDto.fullName,
      licenseNumber: createDto.licenseNumber,
      phoneNumber: createDto.phoneNumber,
      user,
    });

    const savedPharmacist = await this.pharmacistRepository.save(pharmacist);
    return this.mapToResponseDto(savedPharmacist);
  }

  async findAll(): Promise<PharmacistResponseDto[]> {
    const pharmacists = await this.pharmacistRepository.find({
      relations: ['user'],
    });
    return pharmacists.map((ph) => this.mapToResponseDto(ph));
  }

  async findOne(id: string): Promise<PharmacistResponseDto> {
    const pharmacist = await this.pharmacistRepository.findOne({
      where: { id },
      relations: ['user'],
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
