import { UserRole } from 'src/user/entities/user.entity';

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
}
