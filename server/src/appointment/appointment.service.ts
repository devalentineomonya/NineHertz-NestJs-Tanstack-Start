import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentStatus } from 'src/enums/appointment.enum';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { StreamService } from 'src/stream/stream.service';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Doctor } from '../doctor/entities/doctor.entity';
import { Patient } from '../patient/entities/patient.entity';
import { AppointmentFilter } from './dto/appointment-filter.dto';
import { AppointmentPaginatedDto } from './dto/appointment-paginated.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, AppointmentMode } from './entities/appointment.entity';
import { NotificationService } from 'src/notification/notification.service';
import { MailService } from 'src/shared/mail/mail.service';

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
    private notificationService: NotificationService,
    private mailService: MailService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const { patientId, doctorId, ...appointmentData } = createAppointmentDto;

    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: ['user'],
    });
    if (!patient)
      throw new NotFoundException(`Patient with ID ${patientId} not found`);

    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });
    if (!doctor)
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);

    const conflict = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: doctorId },
        datetime: appointmentData.datetime,
        status: AppointmentStatus.SCHEDULED,
      },
    });
    if (conflict) {
      throw new BadRequestException(
        'Doctor already has an appointment at this time',
      );
    }

    await Promise.all([
      this.streamService.upsertUser({ id: patientId, name: patient.fullName }),
      this.streamService.upsertUser({ id: doctorId, name: doctor.fullName }),
    ]);

    let videoSessionId: string | null = null;
    if (appointmentData.mode === AppointmentMode.VIRTUAL) {
      const session = await this.streamService.createVideoSession({
        patientId,
        doctorId,
        scheduledTime: appointmentData.datetime,
      });
      videoSessionId = session.id;
    }

    const appointment = this.appointmentRepository.create({
      ...appointmentData,
      patient,
      doctor,
      status: appointmentData.status,
      videoSessionId,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    await this.mailService.sendAppointmentCreated(patient.user.email, {
      patientName: patient.fullName,
      doctorName: doctor.fullName,
      appointmentTime: appointment.datetime.toLocaleString(),
      meetingLink:
        appointment.mode === AppointmentMode.VIRTUAL
          ? `https://medic.devalentine.me/call/join/${appointment.videoSessionId}`
          : undefined,
    });

    const notification = {
      message: `New appointment scheduled with Dr. ${doctor.fullName}`,
      appointmentId: savedAppointment.id,
      datetime: savedAppointment.datetime,
    };

    await this.notificationService.triggerNotification(patient.user.id, {
      ...notification,
      eventType: 'appointment',
      eventId: savedAppointment.id,
      datatime: new Date().toISOString(),
    });

    return this.mapToResponseDto(savedAppointment);
  }

  async findAll(
    pagination: PaginationDto,
    filters: AppointmentFilter,
    id?: string,
    role?: string,
  ): Promise<AppointmentPaginatedDto> {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Appointment> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (id && role) {
      if (role === 'patient') {
        where.patient = { user: { id } };
      } else if (role === 'doctor') {
        where.doctor = { user: { id } };
      }
    } else {
      if (filters.patientId) {
        where.patient = { id: filters.patientId };
      }
      if (filters.doctorId) {
        where.doctor = { id: filters.doctorId };
      }
    }
    console.log(where);
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
  // in your AppointmentService (backend)
  async getVideoUserToken(
    callId: string,
    userId: string,
  ): Promise<{ token: string }> {
    const appointment = await this.appointmentRepository.findOne({
      where: { videoSessionId: callId },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException(`No appointment found with callId ${callId}`);
    }

    // Check if the appointment is virtual
    if (appointment.mode !== AppointmentMode.VIRTUAL) {
      throw new BadRequestException(
        'This appointment is not a virtual meeting',
      );
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('This appointment has been cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'This appointment has already been completed',
      );
    }

    // Check if the current time is within the appointment time window
    const now = new Date();
    const startTime = appointment.startTime;
    const endTime = appointment.endTime;

    if (now < startTime || now > endTime) {
      throw new BadRequestException('The appointment is not currently active');
    }

    // Check if user is a participant
    const isParticipant = [
      appointment.patient.id,
      appointment.doctor.id,
    ].includes(userId);
    if (!isParticipant) {
      throw new BadRequestException(
        'User is not a participant of this appointment',
      );
    }

    const token = this.streamService.generateUserToken(userId);
    return { token };
  }
  async sendAppointmentReminders() {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 15 * 60000); // 15 minutes from now

    const appointments = await this.appointmentRepository.find({
      where: {
        datetime: Between(now, reminderTime),
        status: AppointmentStatus.SCHEDULED,
      },
      relations: ['patient', 'patient.user', 'doctor'],
    });

    for (const appointment of appointments) {
      // Send Pusher notification
      await this.notificationService.triggerNotification(
        appointment.patient.user.id,
        {
          datatime: new Date().toLocaleDateString(),
          message: `Your appointment with Dr. ${appointment.doctor.fullName} starts in 15 minutes`,
          appointmentId: appointment.id,
          eventType: 'reminder',
          eventId: appointment.id,
        },
      );
      await this.mailService.sendAppointmentReminder(
        appointment.patient.user?.email,
        {
          patientName: appointment.patient.fullName,
          doctorName: appointment.doctor.fullName,
          appointmentTime: appointment.datetime.toLocaleString(),
          meetingLink:
            appointment.mode === AppointmentMode.VIRTUAL
              ? `https://medic.devalentine.me/call/join/${appointment.videoSessionId}`
              : undefined,
        },
      );
      await this.appointmentRepository.save(appointment);
    }
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
      type: appointment.type,
      mode: appointment.mode,
      videoSessionId: appointment.videoSessionId as string | undefined,
      notes: appointment.notes,
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
          profilePicture: appointment.patient.user?.profilePicture || '',
          createdAt: appointment.patient.user?.createdAt,
        },
      },
      doctor: {
        id: appointment.doctor.id,
        fullName: appointment.doctor.fullName,
        specialty: appointment.doctor.specialty,
        appointmentFee: appointment.doctor.appointmentFee,
        licenseNumber: appointment.doctor.licenseNumber,
        availability: appointment.doctor.availability,
        status: appointment.doctor.status,
        user: {
          id: appointment.doctor.user?.id ?? null,
          email: appointment.doctor.user?.email ?? null,
          role: appointment.doctor.user?.role ?? null,
          isEmailVerified: appointment.doctor.user?.isEmailVerified ?? false,
          profilePicture: appointment.patient.user?.profilePicture || '',
          createdAt: appointment.doctor.user?.createdAt ?? null,
        },
      },
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}
