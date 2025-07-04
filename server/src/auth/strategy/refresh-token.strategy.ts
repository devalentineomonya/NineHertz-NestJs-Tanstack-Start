import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  userType: string;
  [key: string]: string;
}

interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private readonly configService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    };
    super(options);
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRefreshToken {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new Error('No refresh token provided');
    }
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    console.log(refreshToken);
    if (!refreshToken) {
      throw new Error('Invalid refresh token format');
    }
    return {
      ...payload,
      refreshToken,
    };
  }
}
