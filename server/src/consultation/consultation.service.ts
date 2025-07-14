import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consultation } from './entities/consultation.entity';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ConsultationResponseDto } from './dto/consultation-response.dto';
import { ConsultationPaginatedDto } from './dto/consultation-paginated.dto';
import { Patient } from '../patient/entities/patient.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { ConsultationFilter } from './dto/consultation-filter.dto';
import { StreamService } from '../stream/stream.service';

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    private streamService: StreamService,
  ) {}

  async create(
    createConsultationDto: CreateConsultationDto,
  ): Promise<ConsultationResponseDto> {
    const { patientId, doctorId, ...consultationData } = createConsultationDto;

    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: ['user'],
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: ['user'],
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Create video session if not provided
    let videoSessionId = consultationData.videoSessionId;
    if (!videoSessionId) {
      await Promise.all([
        this.streamService.upsertUser(patient),
        this.streamService.upsertUser(doctor),
      ]);
      const session = await this.streamService.createVideoSession({
        patientId,
        doctorId,
        scheduledTime: consultationData.startTime,
      });
      console.log(session);
      videoSessionId = session.id;
    }

    // Calculate duration if not provided
    let duration = consultationData.duration;
    if (!duration && consultationData.endTime) {
      duration = Math.round(
        (new Date(consultationData.endTime).getTime() -
          new Date(consultationData.startTime).getTime()) /
          60000,
      );
    }

    const consultation = this.consultationRepository.create({
      ...consultationData,
      videoSessionId,
      duration,
      patient,
      doctor,
    });

    const savedConsultation =
      await this.consultationRepository.save(consultation);

    // Send notifications
    // await this.sendConsultationNotifications(savedConsultation);

    return this.mapToResponseDto(savedConsultation);
  }

  async findAll(
    pagination: PaginationDto,
    filters: ConsultationFilter,
  ): Promise<ConsultationPaginatedDto> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Consultation> = {};

    if (filters.patientId) {
      where.patient = { id: filters.patientId };
    }
    if (filters.doctorId) {
      where.doctor = { id: filters.doctorId };
    }
    if (filters.date) {
      const startDate = new Date(filters.date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(filters.date);
      endDate.setHours(23, 59, 59, 999);

      where.startTime = Between(startDate, endDate);
    }

    const [consultations, total] =
      await this.consultationRepository.findAndCount({
        where,
        relations: ['patient', 'doctor', 'doctor.user', 'patient.user'],
        take: limit,
        skip,
        order: { startTime: 'ASC' },
      });
    return {
      data: consultations.map((consultation) =>
        this.mapToResponseDto(consultation),
      ),

      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'doctor.user', 'patient.user'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    return this.mapToResponseDto(consultation);
  }

  async update(
    id: string,
    updateConsultationDto: UpdateConsultationDto,
  ): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Update patient if changed
    if (updateConsultationDto.patientId) {
      const patient = await this.patientRepository.findOne({
        where: { id: updateConsultationDto.patientId },
        relations: ['user'],
      });
      if (!patient) {
        throw new NotFoundException(
          `Patient with ID ${updateConsultationDto.patientId} not found`,
        );
      }
      consultation.patient = patient;
    }

    // Update doctor if changed
    if (updateConsultationDto.doctorId) {
      const doctor = await this.doctorRepository.findOne({
        where: { id: updateConsultationDto.doctorId },
        relations: ['user', 'institution'],
      });
      if (!doctor) {
        throw new NotFoundException(
          `Doctor with ID ${updateConsultationDto.doctorId} not found`,
        );
      }
      consultation.doctor = doctor;
    }

    // Update duration if endTime changed
    if (updateConsultationDto.endTime) {
      consultation.endTime = new Date(updateConsultationDto.endTime);
      consultation.duration = Math.round(
        (consultation.endTime.getTime() - consultation.startTime.getTime()) /
          60000,
      );
    } else if (updateConsultationDto.duration) {
      consultation.duration = updateConsultationDto.duration;
      consultation.endTime = new Date(
        consultation.startTime.getTime() + consultation.duration * 60000,
      );
    }

    // Update other fields
    if (updateConsultationDto.startTime) {
      consultation.startTime = new Date(updateConsultationDto.startTime);
    }
    if (updateConsultationDto.videoSessionId) {
      consultation.videoSessionId = updateConsultationDto.videoSessionId;
    }
    if (updateConsultationDto.notes) {
      consultation.notes = updateConsultationDto.notes;
    }

    const updatedConsultation =
      await this.consultationRepository.save(consultation);

    // Send update notifications
    // await this.sendConsultationNotifications(updatedConsultation, true);

    return this.mapToResponseDto(updatedConsultation);
  }

  async remove(id: string): Promise<void> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Delete video session
    if (consultation.videoSessionId) {
      await this.streamService.deleteVideoSession(consultation.videoSessionId);
    }

    const result = await this.consultationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }
  }

  // private async sendConsultationNotifications(
  //   consultation: Consultation,
  //   isUpdate: boolean = false,
  // ) {
  //   try {
  //     const message = isUpdate
  //       ? `Your consultation with Dr. ${consultation.doctor.fullName} has been updated`
  //       : `Your consultation with Dr. ${consultation.doctor.fullName} has been scheduled`;

  //     // Send notification to patient
  //     // await this.notificationService.sendNotification({
  //     //   userId: consultation.patient.user.id,
  //     //   type: 'consultation',
  //     //   title: 'Consultation Update',
  //     //   message,
  //     //   data: {
  //     //     consultationId: consultation.id,
  //     //     startTime: consultation.startTime.toISOString(),
  //     //     doctorId: consultation.doctor.id,
  //     //   },
  //     // });

  //     // Send notification to doctor
  //     // await this.notificationService.sendNotification({
  //     //   userId: consultation.doctor.user.id,
  //     //   type: 'consultation',
  //     //   title: 'Consultation Update',
  //     //   message: isUpdate
  //     //     ? `Your consultation with ${consultation.patient.fullName} has been updated`
  //     //     : `New consultation scheduled with ${consultation.patient.fullName}`,
  //     //   data: {
  //     //     consultationId: consultation.id,
  //     //     startTime: consultation.startTime.toISOString(),
  //     //     patientId: consultation.patient.id,
  //     //   },
  //     // });
  //   } catch (error) {
  //     console.error('Failed to send consultation notifications', error);
  //   }
  // }

  private mapToResponseDto(
    consultation: Consultation,
  ): ConsultationResponseDto {
    return {
      id: consultation.id,
      startTime: consultation.startTime,
      endTime: consultation.endTime,
      videoSessionId: consultation.videoSessionId,
      duration: consultation.duration,
      notes: consultation.notes,
      status: consultation.status,
      patient: {
        id: consultation.patient.id,
        fullName: consultation.patient.fullName,
        phone: consultation.patient.phone,
        dateOfBirth: consultation.patient.dateOfBirth,
        medicalHistory: consultation.patient.medicalHistory,
        user: {
          id: consultation.patient?.id,
          email: consultation.patient.user?.email,
          role: consultation.patient.user?.role,
          isEmailVerified: consultation.patient.user?.isEmailVerified,
          createdAt: consultation.patient.user?.createdAt,
        },
      },
      doctor: {
        id: consultation.doctor.id,
        fullName: consultation.doctor.fullName,
        specialty: consultation.doctor.specialty,
        consultationFee: consultation.doctor.consultationFee,
        licenseNumber: consultation.doctor.licenseNumber,
        availability: consultation.doctor.availability,
        status: consultation.doctor.status,
        user: {
          id: consultation.doctor.user?.id,
          email: consultation.doctor.user?.email,
          role: consultation.doctor.user?.role,
          isEmailVerified: consultation.doctor.user?.isEmailVerified,
          createdAt: consultation.doctor.user?.createdAt,
        },
      },
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  }
}
