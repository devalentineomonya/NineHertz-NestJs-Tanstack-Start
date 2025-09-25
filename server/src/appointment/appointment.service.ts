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
import { TransactionStatus } from 'src/transactions/entities/transaction.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { ReviewResponseDto } from './dto/review-response.dto';
import { MessagingService } from 'src/messaging/messaging.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private streamService: StreamService,
    private notificationService: NotificationService,
    private mailService: MailService,
    private readonly messagingService: MessagingService,
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
      relations: ['user'],
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

    // Create chat for the appointment
    try {
      const { chatId } = await this.messagingService.createChatForAppointment(
        savedAppointment.id,
      );
      console.log(
        `Chat created for appointment ${savedAppointment.id}: ${chatId}`,
      );
    } catch (error) {
      console.error('Failed to create chat for appointment:', error);
      // Don't fail the appointment creation if chat creation fails
    }

    await this.mailService.sendAppointmentCreated(patient.user.email, {
      patientName: patient.fullName,
      doctorName: doctor.fullName,
      appointmentTime: appointment.datetime.toLocaleString(),
      meetingLink:
        appointment.mode === AppointmentMode.VIRTUAL
          ? `https://medic.valentinee.dev/call/join/${appointment.videoSessionId}`
          : undefined,
    });

    const notification = {
      message: `New appointment scheduled with Dr. ${doctor.fullName}`,
      appointmentId: savedAppointment.id,
      datetime: savedAppointment.datetime,
    };

    await Promise.all([
      this.notificationService.triggerNotification(patient.user.id, {
        ...notification,
        eventType: 'appointment',
        eventId: savedAppointment.id,
        datetime: new Date().toISOString(),
      }),
      this.notificationService.triggerNotification(doctor.user.id, {
        ...notification,
        message: `New appointment scheduled with Patient ${patient.fullName}`,
        eventType: 'appointment',
        eventId: savedAppointment.id,
        datetime: new Date().toISOString(),
      }),
    ]);

    return this.mapToResponseDto(savedAppointment);
  }

  async findAll(
    pagination: PaginationDto,
    filters: AppointmentFilter,
    id?: string,
    role?: string,
    includeReviews = false,
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

    const relations = [
      'patient',
      'doctor',
      'doctor.user',
      'patient.user',
      'transactions',
    ];

    if (includeReviews) {
      relations.push('reviews', 'reviews.patient', 'reviews.doctor');
    }

    const [appointments, total] = await this.appointmentRepository.findAndCount(
      {
        where,
        relations,
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
      relations: [
        'patient',
        'doctor',
        'doctor.user',
        'patient.user',
        'transactions',
        'reviews',
        'reviews.patient',
        'reviews.patient.user',
        'reviews.doctor',
        'reviews.doctor.user',
      ],
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
  // Add this method to the AppointmentService class
  async cancelAppointment(
    id: string,
    reason?: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'patient.user',
        'doctor',
        'doctor.user',
        'transactions',
      ],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Check if appointment can be cancelled
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException(
        'Only scheduled appointments can be cancelled',
      );
    }

    // Check for successful transaction to refund
    let refundMessage = '';
    const successfulTransaction = appointment.transactions?.find(
      (t) => t.status === TransactionStatus.SUCCESS,
    );

    if (successfulTransaction) {
      refundMessage =
        ' A refund for your payment is being processed and will be credited within 3-5 business days.';
    }

    // Update appointment status
    appointment.status = AppointmentStatus.CANCELLED;
    const updatedAppointment =
      await this.appointmentRepository.save(appointment);

    // Send notifications and emails
    const patient = appointment.patient;
    const doctor = appointment.doctor;

    // Patient notification and email
    await Promise.all([
      this.notificationService.triggerNotification(patient.user.id, {
        message: `Your appointment with Dr. ${doctor.fullName} has been cancelled`,
        appointmentId: appointment.id,
        eventType: 'appointment',
        eventId: appointment.id,
        datetime: new Date().toISOString(),
      }),
      this.mailService.sendAppointmentCancelled(patient.user.email, {
        patientName: patient.fullName,
        doctorName: doctor.fullName,
        appointmentTime: appointment.datetime.toLocaleString(),
        reason: reason || 'No reason provided',
        refundMessage,
      }),
    ]);

    // Doctor notification and email
    await Promise.all([
      this.notificationService.triggerNotification(doctor.user.id, {
        message: `Your appointment with ${patient.fullName} has been cancelled`,
        appointmentId: appointment.id,
        eventType: 'appointment',
        eventId: appointment.id,
        datetime: new Date().toISOString(),
      }),
      this.mailService.sendAppointmentCancelled(doctor.user.email, {
        patientName: patient.fullName,
        doctorName: doctor.fullName,
        appointmentTime: appointment.datetime.toLocaleString(),
        reason: reason || 'No reason provided',
        isDoctor: true, // Flag for doctor-specific message
      }),
    ]);

    return this.mapToResponseDto(updatedAppointment);
  }

  async createReview(
    createReviewDto: CreateReviewDto,
    patientId: string,
  ): Promise<Review> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: createReviewDto.appointmentId },
      relations: ['patient', 'doctor', 'patient.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.patient.user.id !== patientId) {
      throw new BadRequestException(
        'You can only review your own appointments',
      );
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'You can only review completed appointments',
      );
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findOne({
      where: { appointment: { id: createReviewDto.appointmentId } },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this appointment',
      );
    }

    const review = this.reviewRepository.create({
      comment: createReviewDto.comment,
      rating: createReviewDto.rating,
      appointment,
      patient: appointment.patient,
      doctor: appointment.doctor,
    });

    return this.reviewRepository.save(review);
  }

  async getAppointmentReviews(
    appointmentId: string,
  ): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.find({
      where: { appointment: { id: appointmentId } },
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
    });

    if (!reviews || reviews.length === 0) {
      return [];
    }

    return reviews.map((review) => this.mapReviewToDto(review));
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

    // // Check if the appointment is virtual
    // if (appointment.mode !== AppointmentMode.VIRTUAL) {
    //   throw new BadRequestException(
    //     'This appointment is not a virtual meeting',
    //   );
    // }

    // if (appointment.status === AppointmentStatus.CANCELLED) {
    //   throw new BadRequestException('This appointment has been cancelled');
    // }

    // if (appointment.status === AppointmentStatus.COMPLETED) {
    //   throw new BadRequestException(
    //     'This appointment has already been completed',
    //   );
    // }

    // Check if the current time is within the appointment time window
    // const now = new Date();
    // const startTime = appointment.startTime;
    // const endTime = appointment.endTime;

    // if (now < startTime || now > endTime) {
    //   throw new BadRequestException('The appointment is not currently active');
    // }

    // // Check if user is a participant
    // const isParticipant = [
    //   appointment.patient.id,
    //   appointment.doctor.id,
    // ].includes(userId);
    // if (!isParticipant) {
    //   throw new BadRequestException(
    //     'User is not a participant of this appointment',
    //   );
    // }

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
          datetime: new Date().toLocaleDateString(),
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
              ? `https://medic.valentinee.dev/call/join/${appointment.videoSessionId}`
              : undefined,
        },
      );
      await this.appointmentRepository.save(appointment);
    }
  }

  async sendAppointmentReminder(id: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, status: AppointmentStatus.SCHEDULED },
      relations: ['patient', 'patient.user', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException(
        `Scheduled appointment with ID ${id} not found`,
      );
    }

    const now = new Date();
    const reminderTime = new Date(appointment.datetime.getTime() - 15 * 60000);

    if (now > reminderTime) {
      throw new BadRequestException('Reminder time has already passed');
    }

    // Send Pusher notification
    await this.notificationService.triggerNotification(
      appointment.patient.user.id,
      {
        datetime: new Date().toLocaleDateString(),
        message: `Your appointment with Dr. ${appointment.doctor.fullName} starts in 15 minutes`,
        appointmentId: appointment.id,
        eventType: 'reminder',
        eventId: appointment.id,
      },
    );

    // Send email reminder
    await this.mailService.sendAppointmentReminder(
      appointment.patient.user?.email,
      {
        patientName: appointment.patient.fullName,
        doctorName: appointment.doctor.fullName,
        appointmentTime: appointment.datetime.toLocaleString(),
        meetingLink:
          appointment.mode === AppointmentMode.VIRTUAL
            ? `https://medic.valentinee.dev/call/join/${appointment.videoSessionId}`
            : undefined,
      },
    );
  }

  // Add this method to AppointmentService
  async markAppointmentComplete(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'patient.user',
        'doctor',
        'doctor.user',
        'transactions',
      ],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Verify appointment type
    if (appointment.mode !== AppointmentMode.PHYSICAL) {
      throw new BadRequestException(
        'Only physical appointments can be marked complete',
      );
    }

    // Check current status
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException(
        'Only scheduled appointments can be marked complete',
      );
    }

    // Verify payment
    const hasSuccessfulPayment = appointment.transactions?.some(
      (transaction) => transaction.status === TransactionStatus.SUCCESS,
    );

    if (!hasSuccessfulPayment) {
      throw new BadRequestException(
        'Cannot complete appointment without successful payment',
      );
    }

    // Update status
    appointment.status = AppointmentStatus.COMPLETED;
    const updatedAppointment =
      await this.appointmentRepository.save(appointment);

    // Send notifications
    const patientNotification = {
      message: `Your appointment with Dr. ${appointment.doctor.fullName} has been marked complete`,
      appointmentId: appointment.id,
      eventType: 'appointment' as unknown as 'appointment',
      eventId: appointment.id,
      datetime: new Date().toISOString(),
    };

    const doctorNotification = {
      message: `Your appointment with ${appointment.patient.fullName} has been marked complete`,
      appointmentId: appointment.id,
      eventType: 'appointment' as unknown as 'appointment',
      eventId: appointment.id,
      datetime: new Date().toISOString(),
    };

    await Promise.all([
      this.notificationService.triggerNotification(
        appointment.patient.user.id,
        patientNotification,
      ),
      this.notificationService.triggerNotification(
        appointment.doctor.user.id,
        doctorNotification,
      ),
    ]);

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
      transactions: appointment.transactions?.map((transaction) => ({
        id: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        description: transaction.description,
        gatewayReference: transaction.gatewayReference,
        checkoutUrl: transaction.checkoutUrl,
        gateway: transaction.gateway,
      })),
      reviews: appointment.reviews?.map((review) =>
        this.mapReviewToDto(review),
      ),
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
  private mapReviewToDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      comment: review.comment,
      rating: review.rating,
      patient: {
        id: review.patient.id,
        fullName: review.patient.fullName,
        phone: review.patient.phone,
        dateOfBirth: review.patient.dateOfBirth,
        medicalHistory: review.patient.medicalHistory,
        user: {
          id: review.patient.user?.id,
          email: review.patient.user?.email,
          role: review.patient.user?.role,
          isEmailVerified: review.patient.user?.isEmailVerified,
          profilePicture: review.patient.user?.profilePicture || '',
          createdAt: review.patient.user?.createdAt,
        },
      },
      doctor: {
        id: review.doctor.id,
        fullName: review.doctor.fullName,
        specialty: review.doctor.specialty,
        appointmentFee: review.doctor.appointmentFee,
        licenseNumber: review.doctor.licenseNumber,
        availability: review.doctor.availability,
        status: review.doctor.status,
        user: {
          id: review.doctor.user?.id ?? null,
          email: review.doctor.user?.email ?? null,
          role: review.doctor.user?.role ?? null,
          isEmailVerified: review.doctor.user?.isEmailVerified ?? false,
          profilePicture: review.doctor.user?.profilePicture || '',
          createdAt: review.doctor.user?.createdAt ?? null,
        },
      },
      createdAt: review.createdAt,
    };
  }
}
