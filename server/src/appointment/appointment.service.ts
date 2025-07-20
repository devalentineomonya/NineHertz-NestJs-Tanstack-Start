import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { AppointmentPaginatedDto } from './dto/appointment-paginated.dto';
import { Patient } from '../patient/entities/patient.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { AppointmentStatus } from 'src/enums/appointment.enum';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { AppointmentFilter } from './dto/appointment-filter.dto';
import { StreamService } from 'src/stream/stream.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    private streamService: StreamService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const { patientId, doctorId, ...appointmentData } = createAppointmentDto;

    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    const conflict = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: doctorId },
        datetime: appointmentData.datetime,
        status: AppointmentStatus.SCHEDULED as AppointmentStatus,
      },
    });

    if (conflict) {
      throw new BadRequestException(
        'Doctor already has an appointment at this time',
      );
    }

    await Promise.all([
      this.streamService.upsertUser(patient),
      this.streamService.upsertUser(doctor),
    ]);
    // const session = await this.streamService.createVideoSession({
    //   patientId,
    //   doctorId,
    //   scheduledTime: appointment.startTime,
    // });
    // conso

    const appointment = this.appointmentRepository.create({
      ...appointmentData,
      patient,
      doctor,
      status: appointmentData.status as AppointmentStatus,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);
    console.log(savedAppointment);
    return this.mapToResponseDto(savedAppointment);
  }

  async findAll(
    pagination: PaginationDto,
    filters: AppointmentFilter,
    id?: string,
    role?: string,
  ): Promise<AppointmentPaginatedDto> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Appointment> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (id && role) {
      if (role === 'patient') {
        where.patient = { id };
      } else if (role === 'doctor') {
        where.doctor = { id };
      }
    } else {
      if (filters.patientId) {
        where.patient = { id: filters.patientId };
      }
      if (filters.doctorId) {
        where.doctor = { id: filters.doctorId };
      }
    }

    const [appointments, total] = await this.appointmentRepository.findAndCount(
      {
        where,
        relations: ['patient', 'doctor', 'doctor.user', 'patient.user'],
        take: limit,
        skip,
        order: { datetime: 'ASC' },
      },
    );

    return {
      data: appointments.map((appointment) =>
        this.mapToResponseDto(appointment),
      ),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'doctor.user', 'patient.user'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return this.mapToResponseDto(appointment);
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (updateAppointmentDto.patientId) {
      const patient = await this.patientRepository.findOne({
        where: { id: updateAppointmentDto.patientId },
      });
      if (!patient) {
        throw new NotFoundException(
          `Patient with ID ${updateAppointmentDto.patientId} not found`,
        );
      }
      appointment.patient = patient;
    }

    if (updateAppointmentDto.doctorId) {
      const doctor = await this.doctorRepository.findOne({
        where: { id: updateAppointmentDto.doctorId },
      });
      if (!doctor) {
        throw new NotFoundException(
          `Doctor with ID ${updateAppointmentDto.doctorId} not found`,
        );
      }
      appointment.doctor = doctor;
    }

    if (updateAppointmentDto.datetime) {
      // Check for new conflicts only if datetime is changing
      if (appointment.datetime !== updateAppointmentDto.datetime) {
        const conflict = await this.appointmentRepository.findOne({
          where: {
            doctor: appointment.doctor,
            datetime: updateAppointmentDto.datetime,
            status: 'scheduled' as AppointmentStatus,
          },
        });

        if (conflict && conflict.id !== id) {
          throw new BadRequestException(
            'Doctor already has an appointment at this time',
          );
        }
      }
      appointment.datetime = updateAppointmentDto.datetime;
    }

    if (updateAppointmentDto.status) {
      appointment.status = updateAppointmentDto.status;
    }

    const updatedAppointment =
      await this.appointmentRepository.save(appointment);
    return this.mapToResponseDto(updatedAppointment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  private mapToResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      datetime: appointment.datetime,
      status: appointment.status,
      patient: {
        id: appointment.patient.id,
        fullName: appointment.patient.fullName,
        phone: appointment.patient.phone,
        dateOfBirth: appointment.patient.dateOfBirth,
        medicalHistory: appointment.patient.medicalHistory,
        user: {
          id: appointment.patient.user?.id,
          email: appointment.patient.user?.email,
          role: appointment.patient.user?.role,
          isEmailVerified: appointment.patient.user?.isEmailVerified,
          createdAt: appointment.patient.user?.createdAt,
        },
      },
      doctor: {
        id: appointment.doctor.id,
        fullName: appointment.doctor.fullName,
        specialty: appointment.doctor.specialty,
        consultationFee: appointment.doctor.consultationFee,
        licenseNumber: appointment.doctor.licenseNumber,
        availability: appointment.doctor.availability,
        status: appointment.doctor.status,
        user: {
          id: appointment.doctor.user?.id ?? null,
          email: appointment.doctor.user?.email ?? null,
          role: appointment.doctor.user?.role ?? null,
          isEmailVerified: appointment.doctor.user?.isEmailVerified ?? false,
          createdAt: appointment.doctor.user?.createdAt ?? null,
        },
      },
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}
