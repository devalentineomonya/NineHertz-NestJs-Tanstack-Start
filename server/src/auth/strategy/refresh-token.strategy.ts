import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JWTPayload } from 'src/shared/types/jwt-payload.types';

interface JwtPayloadWithRefreshToken extends JWTPayload {
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

  validate(req: Request, payload: JWTPayload): JwtPayloadWithRefreshToken {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new Error('No refresh token provided');
    }
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    if (!refreshToken) {
      throw new Error('Invalid refresh token format');
    }
    return {
      ...payload,
      refreshToken,
    };
  }
}
