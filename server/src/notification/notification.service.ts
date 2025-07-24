import { Injectable, NotFoundException } from '@nestjs/common';
import * as Pusher from 'pusher';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';

interface CreateNotificationDto {
  message: string;
  eventType: 'appointment' | 'reminder' | 'system';
  appointmentId?: string;
  datatime: string;
  eventId: string;
}

@Injectable()
export class NotificationService {
  private pusher: Pusher;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private configService: ConfigService,
  ) {
    this.pusher = new Pusher({
      appId: this.configService.getOrThrow('PUSHER_APP_ID'),
      key: this.configService.getOrThrow('PUSHER_KEY'),
      secret: this.configService.getOrThrow('PUSHER_SECRET'),
      cluster: this.configService.getOrThrow('PUSHER_CLUSTER'),
      useTLS: true,
    });
  }

  /**
   * Save notification to DB and trigger a Pusher event
   */
  async triggerNotification(userId: string, dto: CreateNotificationDto) {
    // Save notification in DB
    const notification = this.notificationRepository.create({
      user: { id: userId },
      message: dto.message,
      eventType: dto.eventType,
      eventId: dto.appointmentId,
      createdAt: dto.datatime ?? new Date().toISOString(),
      read: false,
    });

    const saved = await this.notificationRepository.save(notification);

    // Push to Pusher
    await this.pusher.trigger(`user-${userId}`, 'new-notification', saved);

    return saved;
  }

  /**
   * Trigger events for multiple users and save in DB for each
   */
  async triggerPusherEvents(
    userIds: string[],
    dto: CreateNotificationDto,
  ): Promise<void> {
    await Promise.all(
      userIds.map((userId) => this.triggerNotification(userId, dto)),
    );
  }

  /**
   * Direct low-level Pusher event trigger (no DB save)
   */
  async triggerPusherEvent(
    channelIds: string[],
    event: string,
    data: any,
  ): Promise<void> {
    try {
      const uniqueChannels = [...new Set(channelIds)];
      await Promise.all(
        uniqueChannels.map((channelId) =>
          this.pusher.trigger(`user-${channelId}`, event, data),
        ),
      );
    } catch (error) {
      console.error('Pusher error:', error);
    }
  }

  async getUserNotifications(userId: string, page: number, limit: number) {
    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      data: notifications,
      total,
      page,
      limit,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user: { id: userId }, read: false },
      { read: true },
    );
    return { success: true };
  }
  async deleteNotification(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);
    return { success: true };
  }
}
