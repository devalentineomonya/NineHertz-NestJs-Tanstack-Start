import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
  MFAEmail,
  MFAEmailProps,
  ResetPasswordEmail,
  QuotationStatusEmail,
  IssueAssignmentEmail,
  QuotationStatusEmailProps,
  IssueAssignmentEmailProps,
} from './templates/mail.templates';

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

  async sendMfaCodeEmail(
    to: string,
    props: MFAEmailProps,
  ): Promise<nodemailer.SentMessageInfo> {
    const html = MFAEmail({ ...props });
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

  async sendQuotationStatusEmail(
    to: string,
    props: QuotationStatusEmailProps,
  ): Promise<nodemailer.SentMessageInfo> {
    const html = QuotationStatusEmail({ ...props });
    console.log(html);
    const subject = `Quotation `;
    return this.sendEmail(to, subject, html);
  }

  async sendIssueAssignmentEmail(
    to: string,
    props: IssueAssignmentEmailProps,
  ): Promise<nodemailer.SentMessageInfo> {
    const html = IssueAssignmentEmail({ ...props });
    console.log(html);
    const subject = `Issue ${props.action.charAt(0).toUpperCase() + props.action.slice(1)}`;
    return this.sendEmail(to, subject, html);
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<nodemailer.SentMessageInfo> {
    return this.transporter.sendMail({
      from: `"CRM Nexus - For You" <${this.configService.get('MAIL_USER')}>`,
      to,
      subject,
      html,
    });
  }
}
