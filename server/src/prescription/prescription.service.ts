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
import { Pharmacy } from '../pharmacy/entity/pharmacy.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Pharmacy)
    private readonly pharmacyRepo: Repository<Pharmacy>,
  ) {}

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    const patient = await this.patientRepo.findOneBy({ id: dto.patientId });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.doctorRepo.findOneBy({ id: dto.doctorId });
    if (!doctor) throw new NotFoundException('Doctor not found');

    let pharmacy: Pharmacy | undefined = undefined;
    if (dto.pharmacyId) {
      pharmacy =
        (await this.pharmacyRepo.findOneBy({ id: dto.pharmacyId })) ||
        undefined;
      if (!pharmacy) throw new NotFoundException('Pharmacy not found');
    }

    const prescription = this.prescriptionRepo.create({
      medicationDetails: dto.medicationDetails,
      issueDate: new Date(dto.issueDate),
      expiryDate: new Date(dto.expiryDate),
      patient,
      prescribedBy: doctor,
      fulfilledBy: pharmacy,
      isFulfilled: !!dto.pharmacyId,
    });

    return this.prescriptionRepo.save(prescription);
  }
  async findAll(userId: string, role: string): Promise<Prescription[]> {
    const where: FindOptionsWhere<Prescription> = {};

    if (role === 'docotor') {
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

  async update(id: string, dto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);

    // Handle pharmacy fulfillment
    if (
      dto.isFulfilled === true &&
      !dto.pharmacyId &&
      !prescription.fulfilledBy
    ) {
      throw new BadRequestException(
        'Pharmacy ID is required when fulfilling prescription',
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

    if (dto.pharmacyId) {
      const pharmacy = await this.pharmacyRepo.findOneBy({
        id: dto.pharmacyId,
      });
      if (!pharmacy) throw new NotFoundException('Pharmacy not found');
      prescription.fulfilledBy = pharmacy;
      prescription.isFulfilled = true;
    }

    // Update direct fields
    if (dto.medicationDetails)
      prescription.medicationDetails = dto.medicationDetails;
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
