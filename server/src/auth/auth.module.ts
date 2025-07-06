import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { AccessTokenStrategy } from './strategy/access-token.strategy';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { ContactHelper } from 'src/shared/helpers/contact.helper';
import { GoogleStrategy } from './strategy/google.strategy';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    PassportModule,
    TypeOrmModule.forFeature([User, Admin]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenStrategy,
    AccessTokenStrategy,
    GoogleStrategy,
    PermissionHelper,
    ContactHelper,
    UserService,
  ],
})
export class AuthModule {}
