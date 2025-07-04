import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<DoctorResponseDto> {
    const doctor = this.doctorRepository.create({
      ...createDoctorDto,
    });

    const savedDoctor = await this.doctorRepository.save(doctor);
    return this.mapToResponseDto(savedDoctor);
  }

  async findOne(id: string): Promise<DoctorResponseDto> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['institution', 'user'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return this.mapToResponseDto(doctor);
  }

  async update(
    id: string,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<DoctorResponseDto> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['institution', 'user'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    Object.assign(doctor, updateDoctorDto);
    const updatedDoctor = await this.doctorRepository.save(doctor);
    return this.mapToResponseDto(updatedDoctor);
  }

  async remove(id: string): Promise<void> {
    const result = await this.doctorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }

  async getAvailability(id: string): Promise<any> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      select: ['availability'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor.availability;
  }

  private mapToResponseDto(doctor: Doctor): DoctorResponseDto {
    console.log(doctor);
    return {
      id: doctor.id,
      fullName: doctor.fullName,
      specialty: doctor.specialty,
      consultationFee: doctor.consultationFee,
      licenseNumber: doctor.licenseNumber,
      availability: doctor.availability,
      user: {
        id: doctor.user?.id,
        email: doctor.user?.email,
        role: doctor.user?.role,
        isEmailVerified: doctor.user?.isEmailVerified,
        createdAt: doctor.user?.createdAt,
      },
    };
  }
}
