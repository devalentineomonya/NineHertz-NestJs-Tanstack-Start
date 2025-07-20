import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Patient } from '../patient/entities/patient.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { Pharmacist } from 'src/pharmacist/entities/pharmacist.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Pharmacist)
    private readonly pharmacistRepo: Repository<Pharmacist>,
  ) {}

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    const patient = await this.patientRepo.findOneBy({ id: dto.patientId });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.doctorRepo.findOneBy({ id: dto.doctorId });
    if (!doctor) throw new NotFoundException('Doctor not found');

    let pharmacist: Pharmacist | undefined = undefined;
    if (dto.pharmacistId) {
      pharmacist =
        (await this.pharmacistRepo.findOneBy({ id: dto.pharmacistId })) ||
        undefined;
      if (!pharmacist) throw new NotFoundException('Pharmacist not found');
    }

    const prescription = this.prescriptionRepo.create({
      items: dto.items,
      issueDate: new Date(dto.issueDate),
      expiryDate: new Date(dto.expiryDate),
      patient,
      prescribedBy: doctor,
      fulfilledBy: pharmacist,
      isFulfilled: !!dto.pharmacistId,
    });

    return this.prescriptionRepo.save(prescription);
  }
  async findAll(userId: string, role: string): Promise<Prescription[]> {
    const where: FindOptionsWhere<Prescription> = {};

    if (role === 'doctor') {
      where.prescribedBy = { id: userId };
    } else if (role === 'patient') {
      where.patient = { id: userId };
    } else if (role === 'pharmacist') {
      where.fulfilledBy = { id: userId };
    }

    return this.prescriptionRepo.find({
      where,
      relations: ['patient', 'prescribedBy', 'fulfilledBy'],
    });
  }

  async findOne(
    id: string,
    userId?: string,
    role?: string,
  ): Promise<Prescription> {
    const where: FindOptionsWhere<Prescription> = { id };

    if (role === 'doctor') {
      where.prescribedBy = { id: userId };
    } else if (role === 'patient') {
      where.patient = { id: userId };
    } else if (role === 'pharmacist') {
      where.fulfilledBy = { id: userId };
    }

    const prescription = await this.prescriptionRepo.findOne({
      where,
      relations: ['patient', 'prescribedBy', 'fulfilledBy'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }
  async findByPatientId(patientId: string): Promise<Prescription[]> {
    const patient = await this.patientRepo.findOneBy({ id: patientId });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prescriptionRepo.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'prescribedBy', 'fulfilledBy'],
      order: { issueDate: 'DESC' },
    });
  }

  async update(id: string, dto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);

    // Handle Pharmacist fulfillment
    if (
      dto.isFulfilled === true &&
      !dto.pharmacistId &&
      !prescription.fulfilledBy
    ) {
      throw new BadRequestException(
        'Pharmacist ID is required when fulfilling prescription',
      );
    }

    // Update relationships
    if (dto.patientId) {
      const patient = await this.patientRepo.findOneBy({ id: dto.patientId });
      if (!patient) throw new NotFoundException('Patient not found');
      prescription.patient = patient;
    }

    if (dto.doctorId) {
      const doctor = await this.doctorRepo.findOneBy({ id: dto.doctorId });
      if (!doctor) throw new NotFoundException('Doctor not found');
      prescription.prescribedBy = doctor;
    }

    if (dto.pharmacistId) {
      const pharmacist = await this.pharmacistRepo.findOneBy({
        id: dto.pharmacistId,
      });
      if (!pharmacist) throw new NotFoundException('Pharmacist not found');
      prescription.fulfilledBy = pharmacist;
      prescription.isFulfilled = true;
    }

    // Update direct fields
    if (dto.items) prescription.items = dto.items;
    if (dto.issueDate) prescription.issueDate = new Date(dto.issueDate);
    if (dto.expiryDate) prescription.expiryDate = new Date(dto.expiryDate);
    if (dto.isFulfilled === false) {
      prescription.isFulfilled = false;
      prescription.fulfilledBy = undefined;
    }

    return this.prescriptionRepo.save(prescription);
  }

  async remove(id: string): Promise<void> {
    const result = await this.prescriptionRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Prescription not found');
    }
  }
}
