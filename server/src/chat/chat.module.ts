import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager';
import { Keyv, createKeyv } from '@keyv/redis';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheableMemory } from 'cacheable';
import { DoctorService } from 'src/doctor/doctor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { User } from 'src/user/entities/user.entity';
import { AppointmentService } from 'src/appointment/appointment.service';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { PatientService } from 'src/patient/patient.service';
import { StreamService } from 'src/stream/stream.service';
import { NotificationService } from 'src/notification/notification.service';
import { MailModule } from 'src/shared/mail/mail.module';
import { Notification } from 'src/notification/entities/notification.entity';
import { PushSubscription } from 'src/notification/entities/push-subscription.entity';
import { PrescriptionService } from 'src/prescription/prescription.service';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { Pharmacist } from 'src/pharmacist/entities/pharmacist.entity';
import { Review } from 'src/appointment/entities/review.entity';
import { PharmacistService } from 'src/pharmacist/pharmacist.service';
import { MessagingService } from 'src/messaging/messaging.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      User,
      Appointment,
      Patient,
      Notification,
      PushSubscription,
      Prescription,
      Pharmacist,
      Review,
    ]),
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        ttl: 86400 * 1000,
        isCacheable: () => true,
        stores: [
          new Keyv({
            store: new CacheableMemory({ ttl: 30000, lruSize: 5000 }),
          }),
          createKeyv(configService.getOrThrow<string>('REDIS_URL')),
        ],
      }),
    }),
    MailModule,
  ],
  providers: [
    ChatService,
    DoctorService,
    AppointmentService,
    PatientService,
    StreamService,
    NotificationService,
    PrescriptionService,
    PharmacistService,
    MessagingService,
  ],
  exports: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
