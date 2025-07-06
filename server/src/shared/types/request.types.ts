import { Request } from 'express';
import { UserRole } from 'src/user/entities/user.entity';
export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: UserRole;
    refreshToken: string;
  };
}
