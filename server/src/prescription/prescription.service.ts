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
import { NotificationService } from 'src/notification/notification.service';
import { MailService } from 'src/shared/mail/mail.service';

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
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
  ) {}
  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
      relations: ['user'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    let pharmacist: Pharmacist | null = null;
    if (dto.pharmacistId) {
      pharmacist = await this.pharmacistRepo.findOne({
        where: { id: dto.pharmacistId },
        relations: ['user'],
      });
      if (!pharmacist) throw new NotFoundException('Pharmacist not found');
    }

    const prescription = this.prescriptionRepo.create({
      items: dto.items,
      issueDate: new Date(dto.issueDate),
      expiryDate: new Date(dto.expiryDate),
      patient,
      prescribedBy: doctor,
      fulfilledBy: pharmacist ?? undefined,
      isFulfilled: !!dto.pharmacistId,
    });

    const savedPrescription = await this.prescriptionRepo.save(prescription);

    await this.sendPrescriptionNotifications(savedPrescription, 'created');

    return savedPrescription;
  }
  async findAll(id: string, role: string): Promise<Prescription[]> {
    const where: FindOptionsWhere<Prescription> = {};
    console.dir(where, { depth: null });
    console.log(id, role);

    if (role === 'doctor') {
      where.prescribedBy = { user: { id } };
    } else if (role === 'patient') {
      where.patient = { user: { id } };
    } else if (role === 'pharmacist') {
      where.fulfilledBy = { user: { id } };
    }

    return this.prescriptionRepo.find({
      where,
      relations: [
        'patient',
        'patient.user',
        'prescribedBy.user',
        'fulfilledBy.user',
        'prescribedBy',
        'fulfilledBy',
      ],
    });
  }

  async findOne(
    id: string,
    userId?: string,
    role?: string,
  ): Promise<Prescription> {
    const where: FindOptionsWhere<Prescription> = { id };

    if (role === 'doctor') {
      where.prescribedBy = { user: { id: userId } };
    } else if (role === 'patient') {
      where.patient = { user: { id: userId } };
    } else if (role === 'pharmacist') {
      where.fulfilledBy = { user: { id: userId } };
    }

    const prescription = await this.prescriptionRepo.findOne({
      where,
      relations: [
        'patient',
        'patient.user',
        'prescribedBy.user',
        'fulfilledBy.user',
        'prescribedBy',
        'fulfilledBy',
      ],
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
      relations: [
        'patient',
        'patient.user',
        'prescribedBy.user',
        'fulfilledBy.user',
        'prescribedBy',
        'fulfilledBy',
      ],
      order: { issueDate: 'DESC' },
    });
  }
  async update(id: string, dto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    const originalUserIds = [
      prescription.patient.id,
      prescription.prescribedBy.id,
      ...(prescription.fulfilledBy?.id ? [prescription.fulfilledBy.id] : []),
    ];

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

    let isFulfilled = false;
    if (dto.pharmacistId) {
      const pharmacist = await this.pharmacistRepo.findOneBy({
        id: dto.pharmacistId,
      });
      if (!pharmacist) throw new NotFoundException('Pharmacist not found');
      prescription.fulfilledBy = pharmacist;
      isFulfilled = true;
    }

    // Update direct fields
    if (dto.items) prescription.items = dto.items;
    if (dto.issueDate) prescription.issueDate = new Date(dto.issueDate);
    if (dto.expiryDate) prescription.expiryDate = new Date(dto.expiryDate);
    if (dto.isFulfilled === false) {
      prescription.isFulfilled = false;
      prescription.fulfilledBy = undefined;
    }

    const updatedPrescription = await this.prescriptionRepo.save(prescription);

    if (isFulfilled) {
      await this.sendPrescriptionNotifications(
        updatedPrescription,
        'fulfilled',
      );
    } else if (dto.items || dto.issueDate || dto.expiryDate) {
      await this.sendPrescriptionNotifications(updatedPrescription, 'updated');
    }

    // Get updated user IDs
    const updatedUserIds = [
      updatedPrescription.patient.id,
      updatedPrescription.prescribedBy.id,
      ...(updatedPrescription.fulfilledBy?.id
        ? [updatedPrescription.fulfilledBy.id]
        : []),
    ];

    // Combine old and new user IDs
    const allUserIds = [...new Set([...originalUserIds, ...updatedUserIds])];

    for (const userId of allUserIds) {
      await this.notificationService.triggerPusherEvent(
        [`${userId}`],
        'prescription:updated',
        {
          id: updatedPrescription.id,
          message: 'Prescription updated',
          type: 'prescription',
        },
      );
    }

    return updatedPrescription;
  }
  async remove(id: string): Promise<void> {
    const prescription = await this.prescriptionRepo.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'prescribedBy', 'fulfilledBy'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const userIds = [
      prescription.patient.id,
      prescription.prescribedBy.id,
      ...(prescription.fulfilledBy?.id ? [prescription.fulfilledBy.id] : []),
    ];

    await this.prescriptionRepo.delete(id);

    // Send deletion notifications
    for (const userId of userIds) {
      await this.notificationService.triggerPusherEvent(
        [`${userId}`],
        'prescription:deleted',
        {
          id: prescription.id,
          message: 'Prescription deleted',
          type: 'prescription',
        },
      );
    }
  }

  private async sendPrescriptionNotifications(
    prescription: Prescription,
    action: 'created' | 'updated' | 'fulfilled',
  ) {
    const patient = prescription.patient;
    const doctor = prescription.prescribedBy;

    // Notification message based on action
    let message = '';
    switch (action) {
      case 'created':
        message = `New prescription from Dr. ${doctor.fullName}`;
        break;
      case 'updated':
        message = `Your prescription has been updated`;
        break;
      case 'fulfilled':
        message = `Your prescription has been fulfilled`;
        break;
    }

    // Trigger push notification for patient
    await this.notificationService.triggerNotification(patient.user.id, {
      message,
      eventType: 'prescription',
      eventId: prescription.id,
      datetime: new Date().toISOString(),
    });

    // Send email to patient
    await this.mailService.sendPrescriptionEmail(patient.user.email, {
      patientName: patient.fullName,
      doctorName: doctor.fullName,
      items: prescription.items.map((item) => ({
        name: item.medicineId,
        dosage: item.dosage,
        frequency: item.frequency,
        instructions: item.note,
      })),
      issueDate: prescription.issueDate.toLocaleDateString(),
      expiryDate: prescription.expiryDate.toLocaleDateString(),
      action,
    });
  }
}
