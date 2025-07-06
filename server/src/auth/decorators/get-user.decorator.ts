import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTPayload } from 'src/shared/types/jwt-payload.types';
import { RequestWithUser } from 'src/shared/types/request.types';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JWTPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
