import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';
import { JWTPayload } from '../types/jwt-payload.types';

@Injectable()
export class PermissionHelper {
  checkPermission(targetUserId: string, user: JWTPayload) {
    const userId = user.sub;
    const userRole = user.role as unknown as Role;
    if (userId !== targetUserId) {
      const message = 'You can only access your own resources';
      if (
        userRole === Role.ADMIN ||
        userRole === Role.PATIENT ||
        userRole === Role.DOCTOR ||
        userRole === Role.PHARMACIST
      ) {
        return;
      }

      throw new ForbiddenException(message);
    }
  }
}
