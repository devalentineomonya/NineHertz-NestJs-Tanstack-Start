import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThan, Repository } from 'typeorm';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { AppointmentStatus } from 'src/enums/appointment.enum';
import { Notification } from 'src/notification/entities/notification.entity';
import { Order } from 'src/order/entities/order.entity';
import {
  Transaction,
  TransactionStatus,
} from 'src/transactions/entities/transaction.entity';
import { Review } from 'src/appointment/entities/review.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getAdminDashboard() {
    const [
      stats,
      departments,
      appointments,
      recentActivities,
      topDoctors,
      patientSatisfaction,
      upcomingAppointments,
      footerStats,
    ] = await Promise.all([
      this.getStats(),
      this.getDepartmentDistribution(),
      this.getTodaysAppointments(),
      this.getRecentActivities(3),
      this.getTopDoctors(3),
      this.getPatientSatisfaction(6),
      this.getUpcomingAppointments(3),
      this.getFooterStats(),
    ]);

    return {
      stats,
      departments,
      appointments,
      recentActivities,
      topDoctors,
      patientSatisfaction,
      upcomingAppointments,
      footerStats,
    };
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
      .getRawMany<{ specialty: string; count: number }>();

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

  private async getRecentActivities(limit: number = 3) {
    return this.notificationRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async getTopDoctors(limit: number = 3) {
    return this.doctorRepository
      .createQueryBuilder('doctor')
      .select([
        'doctor.id',
        'doctor.fullName',
        'doctor.specialty',
        'AVG(review.rating) as rating',
        'COUNT(DISTINCT appointment.id) as patients',
      ])
      .leftJoin('doctor.reviews', 'review')
      .leftJoin('doctor.appointments', 'appointment')
      .groupBy('doctor.id')
      .orderBy('rating', 'DESC', 'NULLS LAST')
      .addOrderBy('patients', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  private getPatientSatisfaction(months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    return this.reviewRepository
      .createQueryBuilder('review')
      .select(`TO_CHAR(review.createdAt, 'Mon') AS month`)
      .addSelect('AVG(review.rating)', 'score')
      .where('review.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy(`TO_CHAR(review.createdAt, 'Mon')`)
      .orderBy(`MIN(review.createdAt)`, 'ASC')
      .getRawMany();
  }

  private async getUpcomingAppointments(limit: number = 3) {
    const now = new Date();
    return this.appointmentRepository.find({
      where: {
        status: AppointmentStatus.SCHEDULED,
        datetime: MoreThan(now),
      },
      relations: ['patient', 'doctor'],
      order: { datetime: 'ASC' },
      take: limit,
    });
  }

  private async getFooterStats() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalRevenue, patientGrowth, avgWaitTime, staffUtilization] =
      await Promise.all([
        this.getTotalRevenue(),
        this.getPatientGrowth(currentMonthStart, lastMonthStart, lastMonthEnd),
        this.getAvgWaitTime(),
        this.getStaffUtilization(),
      ]);

    return [
      { label: 'Total Revenue', ...totalRevenue },
      { label: 'Patient Growth', ...patientGrowth },
      { label: 'Avg. Wait Time', ...avgWaitTime },
      { label: 'Staff Utilization', ...staffUtilization },
    ];
  }

  private async getTotalRevenue() {
    const rawResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'sum')
      .where('transaction.status = :status', {
        status: TransactionStatus.SUCCESS,
      })
      .getRawOne<unknown>();

    const sum = (rawResult as { sum: string | null })?.sum || null;

    return {
      value: sum ? parseFloat(sum) : 0,
      change: '+12.5%', // Placeholder, would need historical data
    };
  }

  private async getPatientGrowth(
    currentMonthStart: Date,
    lastMonthStart: Date,
    lastMonthEnd: Date,
  ) {
    const [currentMonthPatients, lastMonthPatients] = await Promise.all([
      this.patientRepository.count({
        where: { createdAt: MoreThan(currentMonthStart) },
      }),
      this.patientRepository.count({
        where: { createdAt: Between(lastMonthStart, lastMonthEnd) },
      }),
    ]);

    const growth = lastMonthPatients
      ? ((currentMonthPatients - lastMonthPatients) / lastMonthPatients) * 100
      : 100;

    return {
      value: currentMonthPatients,
      change: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
    };
  }

  private getAvgWaitTime() {
    // Placeholder - would require appointment timestamps
    return {
      value: 12,
      change: '-2.1%',
    };
  }

  private getStaffUtilization() {
    // Placeholder - would require scheduling data
    return {
      value: 94,
      change: '+3.4%',
    };
  }
}
