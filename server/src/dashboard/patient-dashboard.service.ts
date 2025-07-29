import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import {
  Appointment,
  AppointmentMode,
} from 'src/appointment/entities/appointment.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { AppointmentStatus } from 'src/enums/appointment.enum';

@Injectable()
export class PatientDashboardService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Medicine)
    private readonly medicineRepo: Repository<Medicine>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async getDashboardData(userId: string) {
    const patient = await this.patientRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient with user id ${userId} was not found`,
      );
    }
    const patientId = patient.id;
    const [stats, appointments, prescriptions, medicines, notifications] =
      await Promise.all([
        this.getStats(patientId),
        this.getUpcomingAppointments(patientId),
        this.getPrescriptions(patientId),
        this.getMedicines(),
        this.getNotifications(userId),
      ]);

    return {
      stats,
      appointments,
      prescriptions,
      medicines,
      notifications,
    };
  }

  private async getStats(patientId: string) {
    const now = new Date();

    const [
      upcomingAppointments,
      pendingPrescriptions,
      unreadNotifications,
      virtualAppointments,
    ] = await Promise.all([
      this.appointmentRepo.count({
        where: {
          patient: { id: patientId },
          status: AppointmentStatus.SCHEDULED,
          datetime: MoreThan(now),
        },
      }),
      this.prescriptionRepo.count({
        where: {
          patient: { id: patientId },
          isFulfilled: false,
        },
      }),
      // Unread notifications count
      this.notificationRepo.count({
        where: {
          user: { id: patientId },
          read: false,
        },
      }),
      // Virtual appointments count
      this.appointmentRepo.count({
        where: {
          patient: { id: patientId },
          status: AppointmentStatus.SCHEDULED,
          mode: 'virtual' as AppointmentMode,
        },
      }),
    ]);

    return {
      upcomingAppointments,
      pendingPrescriptions,
      unreadNotifications,
      virtualAppointments,
    };
  }

  private async getUpcomingAppointments(patientId: string) {
    const now = new Date();
    return this.appointmentRepo.find({
      where: {
        patient: { id: patientId },
        status: AppointmentStatus.SCHEDULED,
        datetime: MoreThan(now),
      },
      relations: ['doctor'],
      order: { datetime: 'ASC' },
      take: 5,
    });
  }

  private async getPrescriptions(patientId: string) {
    return this.prescriptionRepo.find({
      where: { patient: { id: patientId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }

  private async getMedicines() {
    return this.medicineRepo.find({
      order: { name: 'ASC' },
      take: 5,
    });
  }

  private async getNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async markNotificationAsRead(notificationId: string) {
    await this.notificationRepo.update(notificationId, { read: true });
    return this.notificationRepo.findOneBy({ id: notificationId });
  }

  async markAllNotificationsAsRead(userId: string) {
    const patient = await this.patientRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient with user id ${userId} was not found`,
      );
    }
    await this.notificationRepo.update(
      { user: { id: patient.id }, read: false },
      { read: true },
    );
    return this.getNotifications(patient.id);
  }
}
