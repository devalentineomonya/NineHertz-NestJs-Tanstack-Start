import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User, UserRole } from 'src/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { ResetPasswordInitiateDto } from './dto/reset-password.dto';
import { UpdateEmailDto } from 'src/user/dto/update-email.dto';
import { JWTPayload } from 'src/shared/types/jwt-payload.types';
import { ResetPasswordConfirmDto } from './dto/reset-password-confirm.dto';
import { SignUpDto } from './dto/signup.dto';
import { MailService } from 'src/shared/mail/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) return null;

    const isValid = await user.comparePassword(password);
    return isValid ? user : null;
  }

  async initiateEmailVerification(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = this.generateSecureOtp(6);
    await user.setOtp(otp);
    await this.userService.save(user);

    await this.mailService.sendOTPCode(user.email, {
      companyName: 'NineHertz Medic',
      otpCode: otp,
    });
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp } = verifyEmailDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.otpHash')
      .where('user.email = :email', { email })
      .getOne();

    console.log(user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      return this.login(user);
    }

    const isValid = await this.verifyOtp(user.otpExpiry, user.otpHash, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    user.isEmailVerified = true;
    user.clearOtp();
    await this.userService.save(user);
    return this.login(user);
  }
  async signUp(createUserDto: SignUpDto): Promise<User> {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      await this.initiateEmailVerification(existingUser.email);
      delete existingUser.otpHash;
      delete existingUser.otpExpiry;
      return existingUser;
    }

    const createdUser = await this.userService.create({
      ...createUserDto,
      password: createUserDto.password,
      role: 'patient' as UserRole,
    });

    await this.initiateEmailVerification(createdUser.email);
    delete createdUser.otpHash;
    delete createdUser.otpExpiry;
    return createdUser;
  }

  async login(user: User) {
    if (!user.isEmailVerified) {
      throw new ForbiddenException(
        'Email not verified. Please verify your email first.',
      );
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role as UserRole,
    );
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JWTPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findOne(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user.id, user.email, user.role as UserRole);
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  async verifyTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<string | boolean> {
    console.log(accessToken, refreshToken);
    try {
      await this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const payload = this.jwtService.verify<JWTPayload>(accessToken, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      return payload.sub;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  async initiatePasswordReset(
    resetPassword: ResetPasswordInitiateDto,
  ): Promise<void> {
    const user = await this.userService.findByEmail(resetPassword.email);
    if (!user) return; // Don't reveal if user doesn't exist

    const resetToken = this.generateResetToken(user.id, user.email);

    // Send email with reset token (implementation omitted)
  }

  async updatePassword(userId: string, email: string) {}

  async resetPassword(
    resetPasswordDto: ResetPasswordConfirmDto,
  ): Promise<void> {
    const email = this.verifyPasswordResetToken(resetPasswordDto.token);
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) throw new NotFoundException('User not found');

    user.passwordHash = resetPasswordDto.newPassword;
    await this.userService.save(user);
  }

  async updateEmail(
    userId: string,
    updateEmailDto: UpdateEmailDto,
  ): Promise<void> {
    const existingUser = await this.userService.findByEmail(
      updateEmailDto.newEmail,
    );
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    user.email = updateEmailDto.newEmail;
    await this.userService.save(user);
  }

  async googleLogin(profile: Profile) {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new BadRequestException('Google profile missing email');

    const googleId = profile.id;

    let user = await this.userService.findByEmail(email);

    if (!user) {
      user = await this.userService.create({
        email,
        googleId,
        isEmailVerified: true,
        passwordHash: null,
      } as unknown as CreateUserDto & { isVerified: boolean });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await this.userService.save(user);
    }

    return this.login(user);
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, role),
      this.generateRefreshToken(userId, email, role),
    ]);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: UserRole,
  ): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  private generateRefreshToken(
    userId: string,
    email: string,
    role: UserRole,
  ): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }

  private generateResetToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
        expiresIn: '1h',
      },
    );
  }

  private verifyPasswordResetToken(token: string): string {
    try {
      const payload = this.jwtService.verify<JWTPayload>(token, {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
      });
      return payload.email;
    } catch {
      throw new UnauthorizedException('Invalid password reset token');
    }
  }
  private generateSecureOtp(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    let lastDigit: string | null = null;

    while (otp.length < length) {
      const randomDigit = digits[Math.floor(Math.random() * 10)];

      if (randomDigit === lastDigit) {
        continue;
      }

      otp += randomDigit;
      lastDigit = randomDigit;
    }

    // Ensure not all digits are the same
    if (otp.split('').every((digit) => digit === otp[0])) {
      return this.generateSecureOtp(length);
    }

    return otp;
  }
  async verifyOtp(
    otpExpiry: Date | undefined,
    otpHash: string | undefined,
    otp: string,
  ): Promise<boolean> {
    console.log(otpExpiry ? otpExpiry < new Date() : true, otpHash ?? null);
    if (!otpHash || !otpExpiry || otpExpiry < new Date()) {
      return false;
    }
    return bcrypt.compare(otp, otpHash);
  }
}
