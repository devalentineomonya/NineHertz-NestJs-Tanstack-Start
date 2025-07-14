import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { DoctorFilterDto } from './dto/doctor-filter.dto';
import { User } from 'src/user/entities/user.entity';
import * as moment from 'moment-timezone';
import {
  AvailabilitySlotDto,
  BusySlotDto,
  DoctorAvailabilityDto,
  DoctorAvailabilityQueryDto,
} from './dto/availability-slot.dto';
import { AppointmentStatus } from 'src/enums/appointment.enum';
@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<DoctorResponseDto> {
    const { userId, ...rest } = createDoctorDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (user.role !== 'doctor') {
      throw new NotFoundException(
        `User with id ${userId} doesn't have the required role`,
      );
    }
    const doctor = this.doctorRepository.create({
      ...rest,
      user,
    });

    const savedDoctor = await this.doctorRepository.save(doctor);
    return this.mapToResponseDto(savedDoctor);
  }
  async findAll(
    pagination: PaginationDto,
    filters?: DoctorFilterDto,
  ): Promise<{ data: DoctorResponseDto[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const query = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('doctor.appointments', 'appointments')
      .take(limit)
      .skip(skip);

    if (filters) {
      if (filters.fullName) {
        query.andWhere('doctor.fullName ILIKE :fullName', {
          fullName: `%${filters.fullName}%`,
        });
      }

      if (filters.specialty) {
        query.andWhere('doctor.specialty = :specialty', {
          specialty: filters.specialty,
        });
      }

      if (filters.licenseNumber) {
        query.andWhere('doctor.licenseNumber = :licenseNumber', {
          licenseNumber: filters.licenseNumber,
        });
      }

      if (filters.userEmail) {
        query.andWhere('user.email = :email', { email: filters.userEmail });
      }
    }

    // Execute query and get results
    const [doctors, total] = await query.getManyAndCount();

    // Map to response DTOs
    const data = doctors.map((doctor) => this.mapToResponseDto(doctor));

    return { data, total };
  }

  async findOne(id: string): Promise<DoctorResponseDto> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return this.mapToResponseDto(doctor);
  }

  async update(
    id: string,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<DoctorResponseDto> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    Object.assign(doctor, updateDoctorDto);
    const updatedDoctor = await this.doctorRepository.save(doctor);
    return this.mapToResponseDto(updatedDoctor);
  }

  async remove(id: string): Promise<void> {
    const result = await this.doctorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }

  async getDoctorAvailability(
    doctorId: string,
    dayOfWeek?: DoctorAvailabilityQueryDto,
  ): Promise<DoctorAvailabilityDto> {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: ['appointments', 'consultations'],
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const timezone = doctor.timezone;
    const targetDay =
      dayOfWeek?.dayOfWeek || moment().tz(timezone).format('dddd');

    const returnSingleDay = !!dayOfWeek?.dayOfWeek;

    const workingHours = doctor.availability.hours.map((slot, index) => {
      const [start, end] = slot.split('-');
      const availabilityDay = doctor.availability.days[index];
      return {
        day: availabilityDay,
        start: this.timeToMinutes(start),
        end: this.timeToMinutes(end),
      };
    });

    const busyEvents: { start: number; end: number; day: string }[] = [];

    const addBusyEvent = (
      startTime: Date,
      duration: number,
      eventTimezone: string,
    ) => {
      const start = moment(startTime).tz(eventTimezone);
      const day = start.format('dddd');

      const end = moment(start).add(duration, 'minutes');
      busyEvents.push({
        start: this.timeToMinutes(start.format('HH:mm')),
        end: this.timeToMinutes(end.format('HH:mm')),
        day,
      });
    };

    // Process appointments and consultations
    doctor.appointments
      .filter((a) => a.status !== AppointmentStatus.CANCELLED)
      .forEach((a) => addBusyEvent(a.datetime, a.duration, timezone));

    doctor.consultations
      .filter((c) => !['cancelled', 'completed'].includes(c.status))
      .forEach((c) => addBusyEvent(c.startTime, c.duration || 30, timezone));

    // Filter working hours if specific day is requested
    const relevantWorkingHours = returnSingleDay
      ? workingHours.filter((h) => h.day === targetDay)
      : workingHours;

    const relevantBusyEvents = returnSingleDay
      ? busyEvents.filter((e) => e.day === targetDay)
      : busyEvents;

    const slotDuration = 30;
    const availableSlots: AvailabilitySlotDto[] = [];
    const busySlots: BusySlotDto[] = [];

    relevantWorkingHours.forEach(({ day, start: workStart, end: workEnd }) => {
      for (
        let current = workStart;
        current + slotDuration <= workEnd;
        current += slotDuration
      ) {
        const slotStart = current;
        const slotEnd = current + slotDuration;
        const timeStart = this.minutesToTime(slotStart);
        const timeEnd = this.minutesToTime(slotEnd);

        const isBusy = relevantBusyEvents.some(
          (busy) =>
            busy.day === day && slotStart < busy.end && slotEnd > busy.start,
        );

        if (isBusy) {
          busySlots.push({
            day,
            start: timeStart,
            end: timeEnd,
            type: 'busy',
          });
        } else {
          availableSlots.push({
            day,
            start: timeStart,
            end: timeEnd,
          });
        }
      }
    });

    return {
      day: returnSingleDay ? targetDay : undefined,
      availableSlots,
      busySlots,
    };
  }

  // Helper: Convert "HH:mm" to minutes
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper: Convert minutes to "HH:mm"
  private minutesToTime(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private mapToResponseDto(doctor: Doctor): DoctorResponseDto {
    console.log(doctor);
    return {
      id: doctor.id,
      fullName: doctor.fullName,
      specialty: doctor.specialty,
      consultationFee: doctor.consultationFee,
      licenseNumber: doctor.licenseNumber,
      availability: doctor.availability,
      status: doctor.status,
      user: {
        id: doctor.user?.id,
        email: doctor.user?.email,
        role: doctor.user?.role,
        isEmailVerified: doctor.user?.isEmailVerified,
        createdAt: doctor.user?.createdAt,
      },
    };
  }
}
