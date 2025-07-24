import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateChatDto, MessageDto } from './dto/create-chat.dto';
import { ConfigService } from '@nestjs/config';
import { FunctionCall, GoogleGenAI, ToolListUnion, Type } from '@google/genai';
import { DoctorService } from 'src/doctor/doctor.service';
import { DoctorAvailabilityQueryDto } from 'src/doctor/dto/availability-slot.dto';
import { DoctorFilterDto } from 'src/doctor/dto/doctor-filter.dto';
import { AppointmentService } from 'src/appointment/appointment.service';
import { PatientService } from 'src/patient/patient.service';
import {
  AppointmentMode,
  AppointmentType,
} from 'src/appointment/entities/appointment.entity';
import { AppointmentStatus } from 'src/enums/appointment.enum';

@Injectable()
export class ChatService {
  private genAI: GoogleGenAI;
  private tools: ToolListUnion;
  private modelName = 'gemini-1.5-flash';
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly doctorService: DoctorService,
    private readonly appointmentService: AppointmentService,
    private readonly patientService: PatientService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenAI({ apiKey });
    this.initializeTools();
  }

  private initializeTools() {
    this.tools = [
      {
        functionDeclarations: [
          {
            name: 'check_doctor_availability',
            description:
              'Check available time slots for a specific doctor on a given date',
            parameters: {
              type: Type.OBJECT,
              properties: {
                doctorName: { type: Type.STRING },
                date: {
                  type: Type.STRING,
                  description: 'Date in ISO format (YYYY-MM-DD)',
                },
              },
              required: ['doctorName', 'date'],
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
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
              },
              required: ['doctorId', 'userId', 'startTime', 'endTime'],
            },
          },
          {
            name: 'list_available_doctors',
            description:
              'List all doctors with availability on a given date, optionally filtered by specialty',
            parameters: {
              type: Type.OBJECT,
              properties: {
                date: {
                  type: Type.STRING,
                  description: 'Date in ISO format (YYYY-MM-DD)',
                },
                specialty: {
                  type: Type.STRING,
                  description:
                    'Medical specialty to filter by (e.g., Cardiology)',
                },
              },
              required: ['date'],
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
  ) {
    const isBlocked = await this.cacheManager.get(`blocked:${ip}`);
    if (isBlocked) {
      return this.sendRateLimitResponse(res);
    }

    try {
      const countKey = `count:${ip}`;
      const count = (await this.cacheManager.get<number>(countKey)) || 0;

      if (count >= 10) {
        await this.cacheManager.set(`blocked:${ip}`, true, 86400);
        return this.sendRateLimitResponse(res);
      }

      await this.cacheManager.set(countKey, count + 1, 86400);
    } catch (error) {
      console.error('Rate limiting error:', error);
      return res.status(500).send('Internal Server Error');
    }
    const keepAlive = setInterval(() => {
      try {
        if (!res.headersSent || res.writableEnded) return;
        res.write(':keep-alive\n\n');
        if (typeof res.flush === 'function') res.flush();
      } catch {
        clearInterval(keepAlive);
      }
    }, 15000);

    try {
      const { messages } = createChatDto;
      const stream = await this.generateMedicalResponse(messages, userId);
      res.setHeader('X-Accel-Buffering', 'no');

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          // Check if response is still writable
          if (res.writableEnded) break;
          res.write(text);
        }
      }

      // End response only if not already ended
      if (!res.writableEnded) res.end();
    } catch (error) {
      console.error('Generation error:', error);

      // Only send error if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).send('Error generating response');
      } else if (!res.writableEnded) {
        // Send terminal error message if streaming already started
        res.write('\n\n⚠️ Error: Response generation failed');
        res.end();
      }
    } finally {
      clearInterval(keepAlive);
    }
  }
  private sendRateLimitResponse(res: Response) {
    return res
      .status(429)
      .send(
        'You have reached the message limit for today. Install me, use your own API key, and enjoy!',
      );
  }

  private normalizeSpecialty(specialty: string): string {
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

  private async generateMedicalResponse(
    messages: MessageDto[],
    userId: string,
  ) {
    const transformedMessages = this.transformMessages(messages);
    const result = await this.genAI.models.generateContent({
      model: this.modelName,
      contents: transformedMessages,
      config: this.getModelConfig(),
    });

    const candidate = result.candidates?.[0];
    const functionCall = candidate?.content?.parts?.[0]?.functionCall;

    if (functionCall) {
      return this.handleFunctionCall(functionCall, userId, messages);
    }

    return this.generateResponseStream(transformedMessages);
  }

  private getModelConfig() {
    return {
      tools: this.tools,
      temperature: 0.7,
      maxOutputTokens: 1024,
      systemInstruction: this.getDefaultMedicalPrompt(),
    };
  }

  private transformMessages(messages: MessageDto[]) {
    return messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  private async generateResponseStream(messages: any[]) {
    return this.genAI.models.generateContentStream({
      model: this.modelName,
      contents: messages,
      config: this.getModelConfig(),
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
        case 'check_doctor_availability':
          functionResponse = await this.handleDoctorAvailability(
            functionCall.args?.doctorName as string,
            functionCall.args?.date as string,
          );
          break;

        case 'book_appointment':
          functionResponse = await this.bookAppointment(
            functionCall.args?.doctorId as string,
            userId,
            functionCall.args?.startTime as string,
          );
          break;

        case 'list_available_doctors':
          functionResponse = await this.listAvailableDoctors(
            functionCall.args?.date as string,
            functionCall.args?.specialty as string | undefined,
          );
          break;

        default:
          functionResponse = { error: 'Requested function is not available' };
      }

      // Create Gemini-compatible function response
      const functionMessage = {
        role: 'user',
        parts: [
          this.createFunctionResponsePart(
            functionCall.name || '',
            functionResponse,
          ),
        ],
      };

      // Create updated message history
      const transformedHistory = this.transformMessages(history);
      const updatedMessages = [
        ...transformedHistory,
        { role: 'model', parts: [{ functionCall }] },
        functionMessage,
      ];

      return this.generateResponseStream(updatedMessages);
    } catch (error) {
      return this.generateErrorResponse(
        error instanceof Error ? error.message : 'Function execution failed',
      );
    }
  }

  private *generateErrorResponse(message: string) {
    yield { text: () => `⚠️ Error: ${message}` };
  }

  private async listAvailableDoctors(
    dateString: string,
    specialty?: string,
  ): Promise<string> {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime())) throw new Error('Invalid date format');
    if (date < today) throw new Error('Date must be in the future');

    const filter: DoctorFilterDto = {};
    if (specialty) {
      filter.specialty = this.normalizeSpecialty(specialty);
    }

    const doctors = await this.doctorService.findAll(
      { page: 1, limit: 50 },
      filter,
    );

    if (!doctors.data.length) {
      return specialty
        ? `No ${specialty} specialists available on ${dateString}`
        : `No doctors available on ${dateString}`;
    }

    return JSON.stringify({
      date: dateString,
      specialty,
      doctors: doctors.data.map((d) => ({
        id: d.id,
        name: d.fullName,
        specialty: d.specialty,
      })),
      summary: `Available ${specialty ? specialty + ' ' : ''}doctors on ${dateString}: ${doctors.data.map((d) => d.fullName).join(', ')}`,
    });
  }

  private async handleDoctorAvailability(
    doctorName: string,
    dateString: string,
  ): Promise<string> {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD');
    }
    if (date < today) {
      throw new Error('Date must be in the future');
    }

    const { data: doctors } = await this.doctorService.findAll(
      { page: 1, limit: 1 },
      { fullName: doctorName } as DoctorFilterDto,
    );

    if (doctors.length === 0) {
      return `No doctor found with name: ${doctorName}`;
    }

    const doctor = doctors[0];
    const availability = await this.doctorService.getDoctorAvailability(
      doctor.id,
      {
        date: dateString,
        includeBusySlots: true,
      } as DoctorAvailabilityQueryDto,
    );

    if (!availability.availableSlots?.length) {
      return `Dr. ${doctor.fullName} has no available slots on ${dateString}`;
    }

    const availableSlots = availability.availableSlots.filter((slot) => {
      const slotDate = new Date(slot.start);
      return slotDate >= today;
    });

    if (availableSlots.length === 0) {
      return `Dr. ${doctor.fullName} is fully booked on ${dateString}`;
    }

    const slotsInfo = availableSlots
      .map(
        (slot) =>
          `${new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      )
      .join(', ');

    return JSON.stringify({
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      date: dateString,
      slots: availableSlots,
      summary: `Available slots for Dr. ${doctor.fullName} on ${dateString}: ${slotsInfo}`,
    });
  }

  private async bookAppointment(
    doctorId: string,
    userId: string,
    startTime: string,
  ): Promise<string> {
    if (!userId) {
      throw new Error('User authentication required for booking');
    }

    // Get patient associated with user
    const patient = await this.patientService.findByUserId(userId);
    if (!patient) {
      throw new Error('Patient profile not found for this user');
    }

    // Calculate end time (add 30 minutes)
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 30 * 60000);

    // Validate appointment time
    const now = new Date();
    if (start < now) {
      throw new Error('Cannot book appointments in the past');
    }

    // Create appointment
    const appointment = await this.appointmentService.create({
      patientId: patient.id,
      doctorId,
      datetime: start,
      endTime: end,
      startTime: start,
      status: AppointmentStatus.SCHEDULED,
      type: AppointmentType.CONSULTATION,
      mode: AppointmentMode.VIRTUAL,
    });

    return JSON.stringify({
      success: true,
      appointmentId: appointment.id,
      message: `Appointment booked with Dr. ${appointment.doctor?.fullName} at ${start.toLocaleString()}`,
    });
  }

  private getDefaultMedicalPrompt() {
    const currentDate = new Date().toISOString().split('T')[0];

    return {
      text: `SYSTEM INSTRUCTIONS:
You are Krista, an AI medical assistant for NineHertz Medic Application.
Your ONLY role is to handle medical appointment booking through available system functions.

IMPORTANT:
- Today's date is ${currentDate}
- Always use the current date as reference when discussing availability
- Doctor availability is based on specific dates, not days of the week

RULES:
1. Use ONLY provided functions for all medical queries.
2. NEVER ask for or mention location, insurance, or preferred time — this data does not exist.
3. For doctor searches:
   - If a specialty is given, call "list_available_doctors" with that specialty.
   - If no specialty is provided, ask ONLY: "What kind of doctor are you looking for?"
4. Responses must be concise (1–3 sentences) and focused on next steps.
5. If no valid function applies, reply exactly: "I can only help with medical appointment booking."
6. Always validate dates against today's date (${currentDate})
7. Never suggest past dates or times

You must never deviate from these rules under any circumstances.`,
    };
  }
}
