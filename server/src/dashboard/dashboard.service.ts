import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { AppointmentStatus } from 'src/enums/appointment.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async getAdminDashboard() {
    const [stats, departments, appointments] = await Promise.all([
      this.getStats(),
      this.getDepartmentDistribution(),
      this.getTodaysAppointments(),
    ]);

    return { stats, departments, appointments };
  }

  private async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      totalDoctors,
      todaysAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      this.patientRepository.count(),
      this.doctorRepository.count(),
      this.appointmentRepository.count({
        where: {
          datetime: Between(today, tomorrow),
        },
      }),
      this.appointmentRepository.count({
        where: {
          status: AppointmentStatus.SCHEDULED,
          datetime: Between(today, tomorrow),
        },
      }),
      this.appointmentRepository.count({
        where: {
          status: AppointmentStatus.COMPLETED,
          datetime: Between(today, tomorrow),
        },
      }),
      this.appointmentRepository.count({
        where: {
          status: AppointmentStatus.CANCELLED,
          datetime: Between(today, tomorrow),
        },
      }),
    ]);

    return [
      {
        title: 'Total Patients',
        value: totalPatients,
        change: '+5% from last month',
        color: 'bg-blue-100',
        icon: 'Users',
      },
      {
        title: 'Total Doctors',
        value: totalDoctors,
        change: '+2 new this month',
        color: 'bg-green-100',
        icon: 'Stethoscope',
      },
      {
        title: "Today's Appointments",
        value: todaysAppointments,
        change: `${completedAppointments} completed`,
        color: 'bg-amber-100',
        icon: 'CalendarCheck',
      },
      {
        title: 'Pending Appointments',
        value: pendingAppointments,
        change: `${cancelledAppointments} cancelled`,
        color: 'bg-red-100',
        icon: 'Clock',
      },
    ];
  }

  private async getDepartmentDistribution() {
    const doctorSpecialtyCounts = await this.doctorRepository
      .createQueryBuilder('doctor')
      .select('doctor.specialty', 'specialty')
      .addSelect('COUNT(doctor.id)', 'count')
      .groupBy('doctor.specialty')
      .getRawMany();

    return {
      departments: doctorSpecialtyCounts,
    };
  }

  private async getTodaysAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.appointmentRepository.find({
      where: {
        datetime: Between(today, tomorrow),
      },
      relations: ['patient', 'doctor'],
      order: {
        startTime: 'ASC',
      },
    });
  }
}
