import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository, Between, LessThan } from 'typeorm';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { AppointmentStatus } from 'src/enums/appointment.enum';

@Injectable()
export class DoctorDashboardService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Medicine)
    private readonly medicineRepo: Repository<Medicine>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async getDashboardData(userId: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException(
        `Doctor with user id ${userId} was not found`,
      );
    }

    const doctorId = doctor.id;
    const [stats, appointments, patients, resources, notifications] =
      await Promise.all([
        this.getStats(doctorId),
        this.getTodaysAppointments(doctorId),
        this.getRecentPatients(doctorId),
        this.getMedicalResources(),
        this.getNotifications(userId),
      ]);

    return {
      doctor: {
        id: doctor.id,
        name: doctor.fullName,
        specialization: doctor.specialty,
      },
      stats,
      appointments,
      patients,
      resources,
      notifications,
    };
  }

  private async getStats(doctorId: string) {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const [
      todaysAppointments,
      waitingPatients,
      unreadMessages,
      pendingPrescriptions,
    ] = await Promise.all([
      // Today's appointments count
      this.appointmentRepo.count({
        where: {
          doctor: { id: doctorId },
          datetime: Between(startOfDay, endOfDay),
          status: AppointmentStatus.SCHEDULED,
        },
      }),
      // Waiting patients (checked-in but not completed)
      this.appointmentRepo.count({
        where: {
          doctor: { id: doctorId },
          status: AppointmentStatus.SCHEDULED,
          datetime: LessThan(now),
        },
      }),
      //   // Unread messages from patients
      this.notificationRepo.count({
        where: {
          user: { id: doctorId },
          read: false,
        },
      }),
      // Pending prescriptions (created but not fulfilled)
      this.prescriptionRepo.count({
        where: {
          prescribedBy: { id: doctorId },
          isFulfilled: false,
        },
      }),
    ]);

    return {
      todaysAppointments,
      waitingPatients,
      unreadMessages,
      pendingPrescriptions,
    };
  }

  private async getTodaysAppointments(doctorId: string) {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const appointments = await this.appointmentRepo.find({
      where: {
        doctor: { id: doctorId },
        datetime: Between(startOfDay, endOfDay),
      },
      relations: ['patient', 'patient.user'],
      order: { datetime: 'ASC' },
    });

    return appointments.map((appointment) => ({
      id: appointment.id,
      time: appointment.datetime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      patient: `${appointment.patient.fullName}`,
      status: this.getAppointmentDisplayStatus(
        appointment.status,
        appointment.datetime,
      ),
      duration: `${appointment.duration || 30} min`,
      avatar: this.generateAvatar(appointment.patient.fullName),
      patientId: appointment.patient.id,
      mode: appointment.mode,
    }));
  }

  private async getRecentPatients(doctorId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent appointments to find recent patients
    const recentAppointments = await this.appointmentRepo.find({
      where: {
        doctor: { id: doctorId },
        datetime: MoreThan(thirtyDaysAgo),
        status: AppointmentStatus.COMPLETED,
      },
      relations: ['patient', 'patient.user'],
      order: { datetime: 'DESC' },
      take: 10,
    });

    // Group by patient and get the most recent visit
    const patientMap = new Map();

    recentAppointments.forEach((appointment) => {
      const patientId = appointment.patient.id;
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          id: appointment.patient.id,
          name: `${appointment.patient.fullName}`,
          lastVisit: appointment.datetime.toISOString().split('T')[0],
          condition: appointment.notes || 'General Consultation',
          status: this.getPatientStatus(appointment.patient.id),
        });
      }
    });

    return Array.from(patientMap.values()).slice(0, 5);
  }

  private getMedicalResources() {
    // This could be from a resources table or static data
    // For now, returning static medical resources
    return [
      {
        id: 1,
        title: 'Clinical Guidelines',
        category: 'Cardiology',
        icon: 'FileText',
        url: '/resources/clinical-guidelines',
      },
      {
        id: 2,
        title: 'Drug Interactions',
        category: 'Pharmacology',
        icon: 'Pill',
        url: '/resources/drug-interactions',
      },
      {
        id: 3,
        title: 'Research Updates',
        category: 'Neurology',
        icon: 'Activity',
        url: '/resources/research-updates',
      },
      {
        id: 4,
        title: 'Treatment Protocols',
        category: 'Emergency Medicine',
        icon: 'ClipboardList',
        url: '/resources/treatment-protocols',
      },
      {
        id: 5,
        title: 'Diagnostic Tools',
        category: 'Radiology',
        icon: 'Search',
        url: '/resources/diagnostic-tools',
      },
    ];
  }

  private async getNotifications(userId: string) {
    const notifications = await this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      title: 'New ' + notification.eventType,
      description: notification.message,
      time: this.getTimeAgo(notification.createdAt),
      read: notification.read,
    }));
  }

  // Helper methods
  private getAppointmentDisplayStatus(
    status: AppointmentStatus,
    datetime: Date,
  ): string {
    const now = new Date();

    switch (status) {
      case AppointmentStatus.SCHEDULED:
        if (datetime <= now) {
          return 'Waiting';
        }
        return 'Confirmed';
      case AppointmentStatus.COMPLETED:
        return 'Completed';
      case AppointmentStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Confirmed';
    }
  }

  private generateAvatar(fullName: string): string {
    return `${fullName.charAt(0)}`.toUpperCase();
  }

  private async getPatientStatus(patientId: string): Promise<string> {
    // Logic to determine patient status based on recent prescriptions, appointments, etc.
    const recentPrescription = await this.prescriptionRepo.findOne({
      where: { patient: { id: patientId } },
      order: { createdAt: 'DESC' },
    });

    if (!recentPrescription) {
      return 'Stable';
    }

    // Simple logic - you can make this more sophisticated
    const daysSinceLastPrescription = Math.floor(
      (new Date().getTime() - recentPrescription.createdAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysSinceLastPrescription <= 7) {
      return 'Needs Follow-up';
    } else if (daysSinceLastPrescription <= 30) {
      return 'Improving';
    } else {
      return 'Stable';
    }
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      // less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  }

  // Additional methods for specific actions
  async markNotificationAsRead(notificationId: string) {
    await this.notificationRepo.update(notificationId, { read: true });
    return this.notificationRepo.findOneBy({ id: notificationId });
  }

  async markAllNotificationsAsRead(userId: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException(
        `Doctor with user id ${userId} was not found`,
      );
    }

    await this.notificationRepo.update(
      { user: { id: userId }, read: false },
      { read: true },
    );

    return this.getNotifications(userId);
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with id ${appointmentId} not found`,
      );
    }

    await this.appointmentRepo.update(appointmentId, { status });
    return this.appointmentRepo.findOneBy({ id: appointmentId });
  }

  async getAppointmentsByStatus(doctorId: string, status: AppointmentStatus) {
    return this.appointmentRepo.find({
      where: {
        doctor: { id: doctorId },
        status,
      },
      relations: ['patient', 'patient.user'],
      order: { datetime: 'ASC' },
    });
  }

  async searchPatients(doctorId: string, searchTerm: string) {
    // Get patients who have had appointments with this doctor
    const appointments = await this.appointmentRepo.find({
      where: { doctor: { id: doctorId } },
      relations: ['patient', 'patient.user'],
    });

    const patients = appointments
      .map((app) => app.patient)
      .filter(
        (patient, index, self) =>
          index === self.findIndex((p) => p.id === patient.id),
      )
      .filter((patient) =>
        `${patient.fullName}`.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    return patients.map((patient) => ({
      id: patient.id,
      name: `${patient.fullName}`,
      email: patient.user.email,
      phone: patient.phone,
    }));
  }
}
