import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
  otpEmail,
  otpEmailProps,
  ResetPasswordEmail,
} from './templates/mail.templates';
import {
  appointmentCancelledEmail,
  appointmentCreatedEmail,
  appointmentReminderEmail,
} from './templates/appointment.templates';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow('MAIL_HOST'),
      port: this.configService.getOrThrow<number>('MAIL_PORT'),
      secure: this.configService.getOrThrow<boolean>('MAIL_SECURE'),
      requireTLS: true,

      auth: {
        user: this.configService.getOrThrow('MAIL_USER'),
        pass: this.configService.getOrThrow('MAIL_PASS'),
      },
    });
  }

  async sendOTPCode(
    to: string,
    props: otpEmailProps,
  ): Promise<nodemailer.SentMessageInfo> {
    const html = otpEmail({ ...props });
    console.log(html);
    return this.sendEmail(to, 'Your MFA Code', html);
  }

  async sendResetPasswordEmail(
    to: string,
    resetLink: string,
  ): Promise<nodemailer.SentMessageInfo> {
    const html = ResetPasswordEmail({ resetLink });
    console.log(html);
    return this.sendEmail(to, 'Reset Your Password', html);
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<nodemailer.SentMessageInfo> {
    return this.transporter.sendMail({
      from: `"NineHertz Medic - Your Health Our Pride" <${this.configService.get('MAIL_USER')}>`,
      to,
      subject,
      html,
    });
  }
  async sendAppointmentCreated(
    to: string,
    props: {
      patientName: string;
      doctorName: string;
      appointmentTime: string;
      meetingLink?: string;
    },
  ): Promise<nodemailer.SentMessageInfo> {
    const html = appointmentCreatedEmail(props);
    return this.sendEmail(to, 'Your Appointment is Confirmed', html);
  }

  async sendAppointmentReminder(
    to: string,
    props: {
      patientName: string;
      doctorName: string;
      appointmentTime: string;
      meetingLink?: string;
    },
  ): Promise<nodemailer.SentMessageInfo> {
    const html = appointmentReminderEmail(props);
    return this.sendEmail(to, 'Appointment Reminder', html);
  }

  async sendAppointmentCancelled(
    email: string,
    data: {
      patientName: string;
      doctorName: string;
      appointmentTime: string;
      reason: string;
      refundMessage?: string;
      isDoctor?: boolean;
    },
  ): Promise<void> {
    const html = appointmentCancelledEmail({
      ...data,
      companyName: 'NineHertz Medic',
    });

    await this.sendEmail(
      email,
      data.isDoctor
        ? 'Appointment Cancellation Notification'
        : 'Your Appointment Has Been Cancelled',
      html,
    );
  }
}
