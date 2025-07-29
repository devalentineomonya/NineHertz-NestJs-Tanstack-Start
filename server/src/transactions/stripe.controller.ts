import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Redirect,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Public } from 'src/auth/decorators/public.decorators';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Stripe Callbacks')
@Public()
@Controller('stripe')
export class StripeVerificationController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /** Helper to sign redirect tokens */
  private signRedirectToken(payload: Record<string, any>): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>(
        'STRIPE_REDIRECT_JWT_SECRET',
      ),
      expiresIn: '10m',
      algorithm: 'HS256',
    });
  }

  @Get('success')
  @ApiOperation({
    summary: 'Stripe success callback endpoint',
    description:
      'This endpoint is called by Stripe after successful payment completion',
  })
  @Redirect()
  async handleStripeSuccess(@Query('token') token: string) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    try {
      if (!token) {
        throw new BadRequestException('Missing verification token');
      }

      const transaction =
        await this.transactionService.verifyStripePaymentWithToken(token);

      const responseToken = this.signRedirectToken({
        success: true,
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount,
        paidAt: transaction.paidAt,
      });

      return {
        url: `${frontendUrl}/patient/${transaction.appointment ? 'rooms' : 'orders'}?token=${responseToken}`,
        statusCode: 302,
      };
    } catch (error) {
      const errorToken = this.signRedirectToken({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Payment verification failed',
      });

      return {
        url: `${frontendUrl}/patient/rooms?error=true&token=${errorToken}`,
        statusCode: 302,
      };
    }
  }

  @Get('cancel')
  @ApiOperation({
    summary: 'Stripe cancel callback endpoint',
    description: 'This endpoint is called by Stripe when payment is cancelled',
  })
  @Redirect()
  async handleStripeCancel(@Query('token') token: string) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    // optional: verify token belongs to the same transaction, ignore result
    await this.transactionService.verifyStripePaymentWithToken(token);

    const cancelToken = this.signRedirectToken({
      success: false,
      cancelled: true,
      message: 'Payment was cancelled by user',
    });

    return {
      url: `${frontendUrl}/patient/rooms?cancelled=true&token=${cancelToken}`,
      statusCode: 302,
    };
  }

  @Get('webhook')
  @ApiExcludeEndpoint()
  handleStripeWebhook() {
    throw new BadRequestException(
      'Webhook endpoint not implemented. Use JWT token verification instead.',
    );
  }
}
