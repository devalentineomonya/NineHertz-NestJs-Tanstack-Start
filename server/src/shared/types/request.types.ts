import { Request } from 'express';
export interface RequestWithUser extends Request {
  user: {
    sub: string;
    userType: string;
    role: string;
    refreshToken: string;

    user_id?: string;
    admin_id?: string;
  };
}
