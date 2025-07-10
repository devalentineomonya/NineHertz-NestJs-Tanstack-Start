import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { DoctorFilterDto } from './dto/doctor-filter.dto';
import { User } from 'src/user/entities/user.entity';
@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<DoctorResponseDto> {
    const { userId, ...rest } = createDoctorDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (user.role !== 'doctor') {
      throw new NotFoundException(
        `User with id ${userId} doesn't have the required role`,
      );
    }
    const doctor = this.doctorRepository.create({
      ...rest,
      user,
    });

    const savedDoctor = await this.doctorRepository.save(doctor);
    return this.mapToResponseDto(savedDoctor);
  }
  async findAll(
    pagination: PaginationDto,
    filters?: DoctorFilterDto,
  ): Promise<{ data: DoctorResponseDto[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const query = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('doctor.appointments', 'appointments')
      .take(limit)
      .skip(skip);

    if (filters) {
      if (filters.fullName) {
        query.andWhere('doctor.fullName ILIKE :fullName', {
          fullName: `%${filters.fullName}%`,
        });
      }

      if (filters.specialty) {
        query.andWhere('doctor.specialty = :specialty', {
          specialty: filters.specialty,
        });
      }

      if (filters.licenseNumber) {
        query.andWhere('doctor.licenseNumber = :licenseNumber', {
          licenseNumber: filters.licenseNumber,
        });
      }

      if (filters.userEmail) {
        query.andWhere('user.email = :email', { email: filters.userEmail });
      }
    }

    // Execute query and get results
    const [doctors, total] = await query.getManyAndCount();

    // Map to response DTOs
    const data = doctors.map((doctor) => this.mapToResponseDto(doctor));

    return { data, total };
  }

  async findOne(id: string): Promise<DoctorResponseDto> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user'],
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
      relations: ['user'],
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
