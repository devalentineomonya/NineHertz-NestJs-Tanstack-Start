import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppointmentService } from 'src/appointment/appointment.service';

@Injectable()
export class SchedulerService {
  constructor(private appointmentService: AppointmentService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleAppointmentReminders() {
    await this.appointmentService.sendAppointmentReminders();
  }
}
