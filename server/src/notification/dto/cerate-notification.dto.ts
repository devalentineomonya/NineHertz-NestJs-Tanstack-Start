export class CreateNotificationDto {
  message: string;
  eventType: 'appointment' | 'reminder' | 'system' | 'prescription' | 'order';
  appointmentId?: string;
  datetime: string;
  eventId: string;
  title?: string;
  url?: string;
  sendWhatsApp?: boolean;
  userPhone?: string;
}
