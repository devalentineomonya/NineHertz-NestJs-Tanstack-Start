import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    userId: string,
  ): Promise<PatientResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (user.role !== 'patient') {
      throw new NotFoundException(
        `User with id ${userId} doesn't have the required role`,
      );
    }

    const patient = this.patientRepository.create({
      ...createPatientDto,
      user,
    });

    const savedPatient = await this.patientRepository.save(patient);
    return {
      id: savedPatient.id,
      status: patient.status,
      fullName: savedPatient.fullName,
      phone: savedPatient.phone,
      dateOfBirth: savedPatient.dateOfBirth,
      medicalHistory: savedPatient.medicalHistory,
      user: {
        id: savedPatient.user.id,
        email: savedPatient.user.email,
        role: savedPatient.user.role,
        isEmailVerified: savedPatient.user.isEmailVerified,
        profilePicture: patient.user?.profilePicture || '',
        createdAt: savedPatient.user.createdAt,
      },
    };
  }

  async findAll(id?: string, role?: string): Promise<PatientResponseDto[]> {
    const query = this.patientRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user')
      .leftJoinAndSelect('patient.appointments', 'appointments');

    if (id && role === 'patient') {
      query.where('user.id = :id', { id });
      query.andWhere('user.role = :role', { role: 'patient' });
    }

    const patients = await query.getMany();
    return patients.map((patient) => ({
      id: patient.id,
      status: patient.status,
      fullName: patient.fullName,
      email: patient.user.email,
      role: patient.user.role,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      medicalHistory: patient.medicalHistory,
      user: {
        id: patient.user.id,
        email: patient.user.email,
        role: patient.user.role,
        isEmailVerified: patient.user.isEmailVerified,
        profilePicture: patient.user?.profilePicture || '',
        createdAt: patient.user.createdAt,
      },
    }));
  }

  async findOne(id: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['user', 'appointments', 'prescriptions', 'orders'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return {
      id: patient.id,
      fullName: patient.fullName,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      medicalHistory: patient.medicalHistory,
      status: patient.status,
      user: {
        id: patient.user.id,
        email: patient.user.email,
        role: patient.user.role,
        isEmailVerified: patient.user.isEmailVerified,
        profilePicture: patient.user?.profilePicture || '',
        createdAt: patient.user.createdAt,
      },
      orders: patient.orders.map((order) => ({
        id: order.id,
        status: order.status,
        orderDate: order.orderDate,
        totalAmount: order.totalAmount,
      })),
      appointments: patient.appointments.map((appointment) => ({
        id: appointment.id,
        datetime: appointment.datetime,
        status: appointment.status,
      })),
      prescriptions: patient.prescriptions.map((prescription) => ({
        id: prescription.id,
        issueDate: prescription.issueDate,
        expiryDate: prescription.expiryDate,
      })),
    };
  }

  async findByUserId(userId: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient for user ID ${userId} not found`);
    }
    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    Object.assign(patient, updatePatientDto);
    return await this.patientRepository.save(patient);
  }

  // Remove Patient
  async remove(id: string): Promise<void> {
    const patient = await this.patientRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    await this.patientRepository.remove(patient);
  }
}
