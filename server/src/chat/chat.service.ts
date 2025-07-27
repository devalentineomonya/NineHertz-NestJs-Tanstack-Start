import { FunctionCall, GoogleGenAI, ToolListUnion, Type } from '@google/genai';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { AppointmentService } from 'src/appointment/appointment.service';
import {
  AppointmentMode,
  AppointmentType,
} from 'src/appointment/entities/appointment.entity';
import { DoctorService } from 'src/doctor/doctor.service';
import { DaysOfWeek } from 'src/doctor/dto/availability-slot.dto';
import { DoctorFilterDto } from 'src/doctor/dto/doctor-filter.dto';
import { AppointmentStatus } from 'src/enums/appointment.enum';
import { PatientService } from 'src/patient/patient.service';
import { PrescriptionService } from 'src/prescription/prescription.service';
import { CreateChatDto, MessageDto } from './dto/create-chat.dto';

interface PaginationDto {
  page: number;
  limit: number;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly genAI: GoogleGenAI;
  private readonly tools: ToolListUnion;
  private readonly modelName = 'gemini-1.5-flash';

  // Rate limiting constants
  private readonly RATE_LIMIT_COUNT = 10;
  private readonly RATE_LIMIT_TTL = 86400; // 24 hours in seconds
  private readonly KEEP_ALIVE_INTERVAL = 15000; // 15 seconds

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly doctorService: DoctorService,
    private readonly appointmentService: AppointmentService,
    private readonly patientService: PatientService,
    private readonly prescriptionService: PrescriptionService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenAI({ apiKey });
    this.tools = this.initializeTools();
  }

  private initializeTools(): ToolListUnion {
    return [
      {
        functionDeclarations: [
          {
            name: 'list_doctors',
            description:
              'List all available doctors, optionally filtered by specialty',
            parameters: {
              type: Type.OBJECT,
              properties: {
                specialty: {
                  type: Type.STRING,
                  description:
                    'Medical specialty to filter by (e.g., Cardiology)',
                },
              },
              required: [],
            },
          },
          {
            name: 'check_doctor_availability',
            description:
              'Check available time slots for a specific doctor on a given day of the week',
            parameters: {
              type: Type.OBJECT,
              properties: {
                doctorName: { type: Type.STRING },
                dayOfWeek: {
                  type: Type.STRING,
                  description:
                    'Day of the week (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)',
                },
              },
              required: ['doctorName', 'dayOfWeek'],
            },
          },
          {
            name: 'list_available_doctors_by_day',
            description:
              'List doctors with availability on a specific day of the week, optionally filtered by specialty',
            parameters: {
              type: Type.OBJECT,
              properties: {
                dayOfWeek: {
                  type: Type.STRING,
                  description:
                    'Day of the week (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)',
                },
                specialty: {
                  type: Type.STRING,
                  description:
                    'Medical specialty to filter by (e.g., Cardiology)',
                },
              },
              required: ['dayOfWeek'],
            },
          },
          {
            name: 'book_appointment',
            description: 'Book an appointment with a doctor at a specific time',
            parameters: {
              type: Type.OBJECT,
              properties: {
                doctorId: { type: Type.STRING },
                userId: { type: Type.STRING },
                startTime: {
                  type: Type.STRING,
                  description: 'Start time in ISO format',
                },
                endTime: {
                  type: Type.STRING,
                  description: 'End time in ISO format',
                },
                type: {
                  type: Type.STRING,
                  description:
                    'Appointment type (CONSULTATION, FOLLOW_UP, EMERGENCY)',
                },
                mode: {
                  type: Type.STRING,
                  description: 'Appointment mode (VIRTUAL, IN_PERSON)',
                },
              },
              required: ['doctorId', 'userId', 'startTime', 'endTime'],
            },
          },
          {
            name: 'get_my_appointments',
            description: 'Get all appointments for the current user',
            parameters: {
              type: Type.OBJECT,
              properties: {
                userId: { type: Type.STRING },
                status: {
                  type: Type.STRING,
                  description:
                    'Filter by appointment status (SCHEDULED, COMPLETED, CANCELLED)',
                },
              },
              required: ['userId'],
            },
          },
          {
            name: 'cancel_appointment',
            description: 'Cancel a specific appointment',
            parameters: {
              type: Type.OBJECT,
              properties: {
                appointmentId: { type: Type.STRING },
                reason: {
                  type: Type.STRING,
                  description: 'Reason for cancellation',
                },
              },
              required: ['appointmentId'],
            },
          },
          {
            name: 'get_my_prescriptions',
            description: 'Get all prescriptions for the current user',
            parameters: {
              type: Type.OBJECT,
              properties: {
                userId: { type: Type.STRING },
                role: {
                  type: Type.STRING,
                  description: 'User role (patient, doctor, pharmacist)',
                },
              },
              required: ['userId', 'role'],
            },
          },
          {
            name: 'get_prescription_details',
            description:
              'Get detailed information about a specific prescription',
            parameters: {
              type: Type.OBJECT,
              properties: {
                prescriptionId: { type: Type.STRING },
                userId: { type: Type.STRING },
                role: {
                  type: Type.STRING,
                  description: 'User role (patient, doctor, pharmacist)',
                },
              },
              required: ['prescriptionId', 'userId', 'role'],
            },
          },
        ],
      },
    ];
  }

  async handleRequest(
    ip: string,
    createChatDto: CreateChatDto,
    res: Response,
    userId: string,
  ): Promise<void> {
    // Check if IP is blocked
    const isBlocked = await this.cacheManager.get(`blocked:${ip}`);
    if (isBlocked) {
      this.sendRateLimitResponse(res);
      return;
    }

    // Rate limiting logic
    try {
      const countKey = `count:${ip}`;
      const count = (await this.cacheManager.get<number>(countKey)) ?? 0;

      if (count >= this.RATE_LIMIT_COUNT) {
        await this.cacheManager.set(`blocked:${ip}`, true, this.RATE_LIMIT_TTL);
        this.sendRateLimitResponse(res);
        return;
      }

      await this.cacheManager.set(countKey, count + 1, this.RATE_LIMIT_TTL);
    } catch (error) {
      this.logger.error('Rate limiting error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Set up keep-alive mechanism
    const keepAlive = setInterval(() => {
      try {
        if (res.headersSent || res.writableEnded) {
          clearInterval(keepAlive);
          return;
        }
        res.write(':keep-alive\n\n');
        if (typeof res.flush === 'function') {
          res.flush();
        }
      } catch (error) {
        this.logger.warn('Keep-alive write failed:', error);
        clearInterval(keepAlive);
      }
    }, this.KEEP_ALIVE_INTERVAL);

    try {
      const { messages } = createChatDto;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new Error('Invalid or empty messages array');
      }

      const stream = await this.generateMedicalResponse(messages, userId);
      res.setHeader('X-Accel-Buffering', 'no');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');

      for await (const chunk of stream) {
        if (res.writableEnded) break;

        const text = chunk.text;
        if (text) {
          res.write(text);
        }
      }

      if (!res.writableEnded) {
        res.end();
      }
    } catch (error) {
      this.logger.error('Generation error:', error);
      this.handleResponseError(res, error);
    } finally {
      clearInterval(keepAlive);
    }
  }

  private sendRateLimitResponse(res: Response): void {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message:
        'You have reached the message limit for today. Install me, use your own API key, and enjoy!',
    });
  }

  private handleResponseError(res: Response, error: unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : 'Response generation failed';

    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    } else if (!res.writableEnded) {
      res.write(`\n\n⚠️ Error: ${errorMessage}`);
      res.end();
    }
  }

  private normalizeSpecialty(specialty: string): string {
    if (!specialty || typeof specialty !== 'string') return specialty;

    const specialties: Record<string, string> = {
      cardio: 'Cardiology',
      heart: 'Cardiology',
      dermatology: 'Dermatology',
      skin: 'Dermatology',
      neuro: 'Neurology',
      brain: 'Neurology',
      ortho: 'Orthopedics',
      bone: 'Orthopedics',
    };

    return specialties[specialty.toLowerCase()] || specialty;
  }

  private normalizeDayOfWeek(day: string): string {
    if (!day || typeof day !== 'string') return day;

    const days: Record<string, string> = {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    };

    return days[day.toLowerCase()] || day;
  }

  private isValidDayOfWeek(day: string): boolean {
    const validDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return validDays.includes(day);
  }

  private async generateMedicalResponse(
    messages: MessageDto[],
    userId: string,
  ) {
    const transformedMessages = this.transformMessages(messages);
    const result = await this.genAI.models.generateContent({
      model: this.modelName,
      contents: transformedMessages,
      config: this.getModelConfig(userId),
    });

    const candidate = result.candidates?.[0];
    const functionCall = candidate?.content?.parts?.[0]?.functionCall;

    if (functionCall) {
      return this.handleFunctionCall(functionCall, userId, messages);
    }

    return this.generateResponseStream(userId, transformedMessages);
  }

  private getModelConfig(userId: string) {
    return {
      tools: this.tools,
      temperature: 0.7,
      maxOutputTokens: 1024,
      systemInstruction: this.getDefaultMedicalPrompt(userId),
    };
  }

  private transformMessages(messages: MessageDto[]) {
    return messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  private async generateResponseStream(userId: string, messages: any[]) {
    return this.genAI.models.generateContentStream({
      model: this.modelName,
      contents: messages,
      config: this.getModelConfig(userId),
    });
  }

  private createFunctionResponsePart(name: string, response: object) {
    return {
      functionResponse: {
        name,
        response: { content: JSON.stringify(response) },
      },
    };
  }

  private async handleFunctionCall(
    functionCall: FunctionCall,
    userId: string,
    history: MessageDto[],
  ) {
    try {
      let functionResponse: any;

      switch (functionCall.name) {
        case 'list_doctors':
          functionResponse = await this.listDoctors(
            functionCall.args?.specialty as string | undefined,
          );
          break;

        case 'check_doctor_availability':
          functionResponse = await this.handleDoctorAvailabilityByDay(
            functionCall.args?.doctorName as string,
            functionCall.args?.dayOfWeek as string,
          );
          break;

        case 'list_available_doctors_by_day':
          functionResponse = await this.listAvailableDoctorsByDay(
            functionCall.args?.dayOfWeek as string,
            functionCall.args?.specialty as string | undefined,
          );
          break;

        case 'book_appointment':
          functionResponse = await this.bookAppointment(
            functionCall.args?.doctorId as string,
            userId,
            functionCall.args?.startTime as string,
            functionCall.args?.endTime as string,
            functionCall.args?.type as string,
            functionCall.args?.mode as string,
          );
          break;

        case 'get_my_appointments':
          functionResponse = await this.getMyAppointments(
            userId,
            functionCall.args?.status as AppointmentStatus | undefined,
          );
          break;

        case 'cancel_appointment':
          functionResponse = await this.cancelAppointment(
            functionCall.args?.appointmentId as string,
            functionCall.args?.reason as string | undefined,
          );
          break;

        case 'get_my_prescriptions':
          functionResponse = await this.getMyPrescriptions(
            userId,
            functionCall.args?.role as string,
          );
          break;

        case 'get_prescription_details':
          functionResponse = await this.getPrescriptionDetails(
            functionCall.args?.prescriptionId as string,
            userId,
            functionCall.args?.role as string,
          );
          break;

        default:
          functionResponse = { error: 'Requested function is not available' };
      }

      const functionMessage = {
        role: 'user',
        parts: [
          this.createFunctionResponsePart(
            functionCall.name || '',
            functionResponse,
          ),
        ],
      };

      const transformedHistory = this.transformMessages(history);
      const updatedMessages = [
        ...transformedHistory,
        { role: 'model', parts: [{ functionCall }] },
        functionMessage,
      ];

      return this.generateResponseStream(userId, updatedMessages);
    } catch (error) {
      this.logger.error('Function call error:', error);
      return this.generateErrorResponse(
        error instanceof Error ? error.message : 'Function execution failed',
      );
    }
  }

  private *generateErrorResponse(message: string) {
    yield { text: `⚠️ Error: ${message}` };
  }

  private async listDoctors(specialty?: string): Promise<string> {
    try {
      const filter: DoctorFilterDto = {};
      if (specialty) {
        filter.specialty = this.normalizeSpecialty(specialty);
      }

      const pagination: PaginationDto = { page: 1, limit: 50 };
      const doctors = await this.doctorService.findAll(pagination, filter);

      if (!doctors.data?.length) {
        return JSON.stringify({
          success: false,
          message: specialty
            ? `No ${specialty} specialists found`
            : 'No doctors found',
          total: 0,
          doctors: [],
        });
      }

      return JSON.stringify({
        success: true,
        specialty,
        total: doctors.total,
        doctors: doctors.data.map((doctor) => ({
          id: doctor.id,
          name: doctor.fullName,
          specialty: doctor.specialty,
          appointmentFee: doctor.appointmentFee,
          status: doctor.status,
        })),
        summary: `Found ${doctors.total} ${specialty ? specialty + ' ' : ''}doctor${doctors.total > 1 ? 's' : ''}: ${doctors.data.map((d) => d.fullName).join(', ')}`,
      });
    } catch (error) {
      this.logger.error('Error listing doctors:', error);
      throw new Error('Failed to retrieve doctors list');
    }
  }

  private async listAvailableDoctorsByDay(
    dayOfWeek: string,
    specialty?: string,
  ): Promise<string> {
    const normalizedDay = this.normalizeDayOfWeek(dayOfWeek);

    if (!this.isValidDayOfWeek(normalizedDay)) {
      throw new Error(
        'Invalid day of week. Please use Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday.',
      );
    }

    try {
      const filter: DoctorFilterDto = {};
      if (specialty) {
        filter.specialty = this.normalizeSpecialty(specialty);
      }

      const pagination: PaginationDto = { page: 1, limit: 50 };
      const doctors = await this.doctorService.findAll(pagination, filter);

      if (!doctors.data?.length) {
        return JSON.stringify({
          success: false,
          message: specialty
            ? `No ${specialty} specialists found`
            : 'No doctors found',
          total: 0,
          doctors: [],
        });
      }

      const availableDoctors: any[] = [];

      for (const doctor of doctors.data) {
        try {
          const availability = await this.doctorService.getDoctorAvailability(
            doctor.id,
            { dayOfWeek: normalizedDay as DaysOfWeek },
          );

          if (
            availability.availableSlots &&
            availability.availableSlots.length > 0
          ) {
            availableDoctors.push({
              id: doctor.id,
              name: doctor.fullName,
              specialty: doctor.specialty,
              appointmentFee: doctor.appointmentFee,
              availableSlots: availability.availableSlots.length,
              sampleTimeSlots: availability.availableSlots
                .slice(0, 3)
                .map((slot) => `${slot.start}-${slot.end}`),
            });
          }
        } catch (error) {
          this.logger.warn(
            `Failed to get availability for doctor ${doctor.id}:`,
            error,
          );
          continue;
        }
      }

      if (!availableDoctors.length) {
        return JSON.stringify({
          success: false,
          message: specialty
            ? `No ${specialty} specialists available on ${normalizedDay}`
            : `No doctors available on ${normalizedDay}`,
          total: 0,
          doctors: [],
        });
      }

      return JSON.stringify({
        success: true,
        dayOfWeek: normalizedDay,
        specialty,
        total: availableDoctors.length,
        doctors: availableDoctors,
        summary: `Found ${availableDoctors.length} available ${specialty ? specialty + ' ' : ''}doctor${availableDoctors.length > 1 ? 's' : ''} on ${normalizedDay}: ${availableDoctors.map((d) => d.name).join(', ')}`,
      });
    } catch (error) {
      this.logger.error('Error listing available doctors by day:', error);
      throw new Error('Failed to retrieve available doctors');
    }
  }

  private async handleDoctorAvailabilityByDay(
    doctorName: string,
    dayOfWeek: string,
  ): Promise<string> {
    if (!doctorName || !dayOfWeek) {
      throw new Error('Doctor name and day of week are required');
    }

    const normalizedDay = this.normalizeDayOfWeek(dayOfWeek);

    if (!this.isValidDayOfWeek(normalizedDay)) {
      throw new Error(
        'Invalid day of week. Please use Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday.',
      );
    }

    try {
      const pagination: PaginationDto = { page: 1, limit: 1 };
      const { data: doctors } = await this.doctorService.findAll(pagination, {
        fullName: doctorName,
      } as DoctorFilterDto);

      if (!doctors.length) {
        return JSON.stringify({
          success: false,
          message: `No doctor found with name: ${doctorName}`,
        });
      }

      const doctor = doctors[0];
      const availability = await this.doctorService.getDoctorAvailability(
        doctor.id,
        { dayOfWeek: normalizedDay as DaysOfWeek },
      );

      if (!availability.availableSlots?.length) {
        return JSON.stringify({
          success: false,
          message: `Dr. ${doctor.fullName} has no available slots on ${normalizedDay}`,
          doctorId: doctor.id,
          doctorName: doctor.fullName,
          dayOfWeek: normalizedDay,
        });
      }

      const timeSlots = availability.availableSlots.map(
        (slot) => `${slot.start}-${slot.end}`,
      );

      return JSON.stringify({
        success: true,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        dayOfWeek: normalizedDay,
        availableSlots: availability.availableSlots,
        busySlots: availability.busySlots || [],
        totalAvailable: availability.availableSlots.length,
        summary: `Dr. ${doctor.fullName} has ${availability.availableSlots.length} available slot${availability.availableSlots.length > 1 ? 's' : ''} on ${normalizedDay}: ${timeSlots.slice(0, 5).join(', ')}${timeSlots.length > 5 ? '...' : ''}`,
      });
    } catch (error) {
      this.logger.error(`Error checking doctor availability:`, error);
      throw new Error(
        `Unable to check availability for Dr. ${doctorName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async bookAppointment(
    doctorId: string,
    userId: string,
    startTime: string,
    endTime: string,
    type?: string,
    mode?: string,
  ): Promise<string> {
    if (!userId) {
      throw new Error('User authentication required for booking');
    }

    if (!doctorId || !startTime || !endTime) {
      throw new Error('Doctor ID, start time, and end time are required');
    }

    try {
      const patient = await this.patientService.findByUserId(userId);
      if (!patient) {
        throw new Error('Patient profile not found for this user');
      }

      const start = new Date(startTime);
      const end = new Date(endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format provided');
      }

      const now = new Date();
      if (start < now) {
        throw new Error('Cannot book appointments in the past');
      }

      if (start >= end) {
        throw new Error('Start time must be before end time');
      }

      const appointment = await this.appointmentService.create({
        patientId: patient.id,
        doctorId,
        datetime: start,
        endTime: end,
        startTime: start,
        status: AppointmentStatus.SCHEDULED,
        type: (type as AppointmentType) || AppointmentType.CONSULTATION,
        mode: (mode as AppointmentMode) || AppointmentMode.VIRTUAL,
      });
      console.log(appointment, patient, doctorId);

      return JSON.stringify({
        success: true,
        appointmentId: appointment.id,
        message: `Appointment booked successfully for ${start.toLocaleString()}`,
        details: {
          doctorName: appointment.doctor?.fullName,
          datetime: start.toLocaleString(),
          type: appointment.type,
          mode: appointment.mode,
        },
      });
    } catch (error) {
      this.logger.error('Error booking appointment:', error);
      throw new Error(
        `Failed to book appointment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async getMyAppointments(
    userId: string,
    status?: AppointmentStatus,
  ): Promise<string> {
    if (!userId) {
      throw new Error('User authentication required');
    }

    try {
      const filter: any = {};
      if (status) {
        filter.status = status;
      }

      const pagination: PaginationDto = { page: 1, limit: 50 };
      let appointments;
      let role = 'patient';

      // Try to find as patient first
      const patient = await this.patientService.findByUserId(userId);

      if (patient) {
        appointments = await this.appointmentService.findAll(
          pagination,
          filter,
          userId,
          'patient',
        );
      } else {
        // Check if user is a doctor
        appointments = await this.appointmentService.findAll(
          pagination,
          filter,
          userId,
          'doctor',
        );
        role = 'doctor';
      }

      if (!appointments.data?.length) {
        return JSON.stringify({
          success: true,
          message: `No ${status ? status.toLowerCase() + ' ' : ''}appointments found`,
          total: 0,
          appointments: [],
          role,
        });
      }

      return JSON.stringify({
        success: true,
        total: appointments.total,
        role,
        appointments: appointments.data.map((apt) => ({
          id: apt.id,
          datetime: apt.datetime,
          status: apt.status,
          type: apt.type,
          mode: apt.mode,
          doctorName: apt.doctor?.fullName,
          patientName: apt.patient?.fullName,
        })),
        summary: `Found ${appointments.total} ${status ? status.toLowerCase() + ' ' : ''}appointment${appointments.total > 1 ? 's' : ''}`,
      });
    } catch (error) {
      this.logger.error('Error getting appointments:', error);
      throw new Error('Failed to retrieve appointments');
    }
  }

  private async cancelAppointment(
    appointmentId: string,
    reason?: string,
  ): Promise<string> {
    if (!appointmentId) {
      throw new Error('Appointment ID is required');
    }

    try {
      const cancelledAppointment =
        await this.appointmentService.cancelAppointment(appointmentId, reason);

      return JSON.stringify({
        success: true,
        message: 'Appointment cancelled successfully',
        appointmentId: cancelledAppointment.id,
        reason: reason || 'No reason provided',
      });
    } catch (error) {
      this.logger.error('Error cancelling appointment:', error);
      throw new Error(
        `Failed to cancel appointment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async getMyPrescriptions(
    userId: string,
    role: string,
  ): Promise<string> {
    if (!userId || !role) {
      throw new Error('User ID and role are required');
    }

    try {
      const prescriptions = await this.prescriptionService.findAll(
        userId,
        role,
      );

      if (!prescriptions?.length) {
        return JSON.stringify({
          success: true,
          message: 'No prescriptions found',
          total: 0,
          prescriptions: [],
          role,
        });
      }

      return JSON.stringify({
        success: true,
        total: prescriptions.length,
        role,
        prescriptions: prescriptions.map((p) => ({
          id: p.id,
          issueDate: p.issueDate,
          expiryDate: p.expiryDate,
          isFulfilled: p.isFulfilled,
          patientName: p.patient?.fullName,
          doctorName: p.prescribedBy?.fullName,
          pharmacistName: p.fulfilledBy?.fullName,
          itemsCount: p.items?.length || 0,
        })),
        summary: `Found ${prescriptions.length} prescription${prescriptions.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      this.logger.error('Error getting prescriptions:', error);
      throw new Error('Failed to retrieve prescriptions');
    }
  }

  private async getPrescriptionDetails(
    prescriptionId: string,
    userId: string,
    role: string,
  ): Promise<string> {
    if (!prescriptionId || !userId || !role) {
      throw new Error('Prescription ID, user ID, and role are required');
    }

    try {
      const prescription = await this.prescriptionService.findOne(
        prescriptionId,
        userId,
        role,
      );

      return JSON.stringify({
        success: true,
        id: prescription.id,
        issueDate: prescription.issueDate,
        expiryDate: prescription.expiryDate,
        isFulfilled: prescription.isFulfilled,
        items: prescription.items,
        patient: {
          name: prescription.patient?.fullName,
          id: prescription.patient?.id,
        },
        doctor: {
          name: prescription.prescribedBy?.fullName,
          id: prescription.prescribedBy?.id,
        },
        pharmacist: prescription.fulfilledBy
          ? {
              name: prescription.fulfilledBy.fullName,
              id: prescription.fulfilledBy.id,
            }
          : null,
      });
    } catch (error) {
      this.logger.error('Error getting prescription details:', error);
      throw new Error(
        `Failed to retrieve prescription details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private getDefaultMedicalPrompt(userId: string) {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentDay = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
    });

    return {
      text: `SYSTEM INSTRUCTIONS:
You are Krista, an AI medical assistant for NineHertz Medic Application.
Your role is to help users with medical appointment booking, prescription management, and doctor information.

IMPORTANT:
- Today's date is ${currentDate} (${currentDay})
- If at any point you need the current user's id it's ${userId}
- When users ask about doctor availability, use days of the week (Monday, Tuesday, etc.)
- You can list doctors without requiring specific availability information

AVAILABLE FUNCTIONS:
1. list_doctors - Show all doctors, optionally filtered by specialty
2. check_doctor_availability - Check doctor availability by day of week
3. list_available_doctors_by_day - List doctors available on specific days
4. book_appointment - Book appointments
5. get_my_appointments - View user's appointments
6. cancel_appointment - Cancel appointments
7. get_my_prescriptions - View user's prescriptions
8. get_prescription_details - Get detailed prescription information

RULES:
1. Use ONLY provided functions for medical queries
2. For doctor searches without day specification, use "list_doctors"
3. For day-specific searches, use "list_available_doctors_by_day"
4. Always use days of the week (Monday, Tuesday, etc.) not specific dates
5. Responses must be concise (1–3 sentences) and helpful
6. If no valid function applies, reply: "I can help with doctor listings, appointments, and prescriptions. What would you like to know?"

You are helpful, professional, and focused on medical appointment and prescription management.`,
    };
  }
}
