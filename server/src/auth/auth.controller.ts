import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GetUser } from './decorators/get-user.decorator';
import { JWTPayload } from 'src/shared/types/jwt-payload.types';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordInitiateDto } from './dto/reset-password.dto';
import { ResetPasswordConfirmDto } from './dto/reset-password-confirm.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Profile } from 'passport-google-oauth20';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Public } from './decorators/public.decorators';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionHelper: PermissionHelper,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User authenticated successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token refreshed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('verify-tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify access and refresh tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens are valid',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid tokens',
  })
  async verifyTokens(
    @Body() tokens: { accessToken: string; refreshToken: string },
  ) {
    const isValid = await this.authService.verifyTokens(
      tokens.accessToken,
      tokens.refreshToken,
    );
    console.log(isValid);
    if (!isValid) {
      throw new UnauthorizedException('Invalid tokens');
    }
    return { success: true, message: 'Tokens are valid', userId: isValid };
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Initiate password reset' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Password reset email sent if account exists',
  })
  @ApiBody({ type: ResetPasswordInitiateDto })
  async forgotPassword(@Body() dto: ResetPasswordInitiateDto) {
    await this.authService.initiatePasswordReset(dto);
    return { message: 'If an account exists, a reset email has been sent' };
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token',
  })
  @ApiBody({ type: ResetPasswordConfirmDto })
  async resetPassword(@Body() dto: ResetPasswordConfirmDto) {
    await this.authService.resetPassword({
      token: dto.token,
      newPassword: dto.newPassword,
    });
    return { message: 'Password has been successfully reset' };
  }

  @Post('password/update')
  @UseGuards(AuthGuard('jwt-access-token'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update password (authenticated users)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @ApiBody({ type: UpdatePasswordDto })
  updatePassword(@GetUser() user: JWTPayload, @Body() dto: UpdatePasswordDto) {
    this.authService.updatePassword(user.sub, dto.newPassword);
    return { message: 'Password updated successfully' };
  }

  @Post('email/update')
  @UseGuards(AuthGuard('jwt-access-token'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already in use',
  })
  @ApiBody({ type: UpdateEmailDto })
  async updateEmail(@GetUser() user: JWTPayload, @Body() dto: UpdateEmailDto) {
    await this.authService.updateEmail(user.sub, {
      newEmail: dto.newEmail,
    });
    return { message: 'Email updated successfully' };
  }
  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid verification token',
  })
  @ApiProperty({
    description: 'The email address to be verified.',
    example: 'user@example.com',
  })
  @ApiProperty({
    description:
      'The one-time password (OTP) sent to the email for verification.',
    example: '123456',
  })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() verifyEmailDto: { email: string; otp: string }) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('email/verify/initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate email verification' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email address',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', format: 'email' } },
    },
  })
  async initiateEmailVerification(@Body('email') email: string) {
    return this.authService.initiateEmailVerification(email);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Redirects to Google login',
  })
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as Profile;

    const tokens = await this.authService.googleLogin(profile);

    if (req.headers.accept?.includes('application/json')) {
      return res.json(tokens);
    }

    res.redirect(
      `${this.configService.get<string>('FRONTEND_URL')}auth/callback?` +
        `accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
