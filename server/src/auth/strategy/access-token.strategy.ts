import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Admin } from 'src/admin/entities/admin.entity';

type JWTPayload = {
  sub: string;
  userType: string;
  role: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(
    private readonly configServices: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configServices.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JWTPayload) {
    let entity: User | Admin | null = null;
    if (payload.userType === 'user') {
      entity = await this.userRepository.findOneBy({ id: payload.sub });
    } else if (payload.userType === 'admin') {
      entity = await this.adminRepository.findOneBy({ id: payload.sub });
    }

    if (!entity) throw new UnauthorizedException('User not found');

    return {
      ...entity,
      sub: payload.sub,
      userType: payload.userType,
      role: payload.role,
    };
  }
}
