import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorators';
import { ContactHelper } from 'src/shared/helpers/contact.helper';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly contactHelper: ContactHelper,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const acceptedRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!acceptedRoles || acceptedRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: { userType: string; role?: string } }>();
    const user = request.user;

    if (!user?.role) {
      throw new ForbiddenException('Missing user role information');
    }

    const hasPermission = acceptedRoles.some(
      (role) => role.toLowerCase() === user.role?.toLowerCase(),
    );

    if (!hasPermission) {
      const contact = this.contactHelper.getContactInfo(acceptedRoles[0]);
      throw new ForbiddenException(
        `Contact ${contact} for access to this resource`,
      );
    }

    return true;
  }
}
