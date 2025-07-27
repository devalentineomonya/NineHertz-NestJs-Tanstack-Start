import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { StreamService } from 'src/stream/stream.service';
import { NotificationService } from 'src/notification/notification.service';
import { MailModule } from 'src/shared/mail/mail.module';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { ChatModule } from 'src/chat/chat.module';
import { PushSubscription } from 'src/notification/entities/push-subscription.entity';
import { Review } from './entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      Doctor,
      Patient,
      Appointment,
      Notification,
      PushSubscription,
    ]),
    MailModule,
    NotificationModule,
    ChatModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, StreamService, NotificationService],
})
export class AppointmentModule {}
