import { Injectable } from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class ContactHelper {
  getContactInfo(role: string): string {
    const contacts: Record<string, string> = {
      [Role.SUPPORT_ADMIN]: 'support@example.com',
      [Role.QUOTATIONS_ADMIN]: 'quotations@example.com',
      [Role.SYSTEM_ADMIN]: 'system-admin@example.com',
      [Role.SUPER_ADMIN]: 'super-admin@example.com',
    };

    return contacts[role] || 'contact-support@example.com';
  }
}
