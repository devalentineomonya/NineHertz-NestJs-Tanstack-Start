import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { User } from '../user/entities/user.entity';
import { Appointment } from '../appointment/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Appointment])],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
