import { Injectable } from '@nestjs/common';

@Injectable()
export class ContactHelper {
  getContactInfo(role: string): string {
    const contacts: Record<string, string> = {
      SUPPORT_ADMIN: 'support@healthcare.com',
      SUPER_ADMIN: 'quotations@healthcare.com',
      DOCTOR: 'system-admin@healthcare.com',
    };

    return contacts[role] || 'contact-support@healthcare.com';
  }
}
