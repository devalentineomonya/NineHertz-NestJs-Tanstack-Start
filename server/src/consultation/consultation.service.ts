import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consultation } from './entities/consultation.entity';
import { Repository } from 'typeorm';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ConsultationResponseDto } from './dto/consultation-response.dto';
import { Patient } from '../patient/entities/patient.entity';
import { Doctor } from '../doctor/entities/doctor.entity';

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
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
      relations: ['user', 'institution'],
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

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
      // videoSessionId,
      duration,
      patient,
      doctor,
    });

    const savedConsultation =
      await this.consultationRepository.save(consultation);

    await this.sendConsultationNotifications(savedConsultation);

    return this.mapToResponseDto(savedConsultation);
  }

  async findOne(id: string): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'doctor',
        'doctor.user',
        'patient.user',
        'doctor.institution',
      ],
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
    await this.sendConsultationNotifications(updatedConsultation, true);

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
      // await this.streamService.deleteVideoSession(consultation.videoSessionId);
    }

    const result = await this.consultationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }
  }

  private async sendConsultationNotifications(
    consultation: Consultation,
    isUpdate: boolean = false,
  ) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(isUpdate);
    } catch (error) {
      console.error('Failed to send consultation notifications', error);
    }
  }

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
      patient: {
        id: consultation.patient.id,
        fullName: consultation.patient.fullName,
        phone: consultation.patient.phone,
        dateOfBirth: consultation.patient.dateOfBirth,
        medicalHistory: consultation.patient.medicalHistory,
        user: {
          id: consultation.patient.user.id,
          email: consultation.patient.user.email,
          role: consultation.patient.user.role,
          isEmailVerified: consultation.patient.user.isEmailVerified,
          createdAt: consultation.patient.user.createdAt,
        },
      },
      doctor: {
        availability: consultation.doctor.availability,
        id: consultation.doctor.id,
        fullName: consultation.doctor.fullName,
        specialty: consultation.doctor.specialty,
        consultationFee: consultation.doctor.consultationFee,
        licenseNumber: consultation.doctor.licenseNumber,
        user: {
          id: consultation.doctor.user.id,
          email: consultation.doctor.user.email,
          role: consultation.doctor.user.role,
          isEmailVerified: consultation.doctor.user.isEmailVerified,
          createdAt: consultation.doctor.user.createdAt,
        },
      },
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  }
}
