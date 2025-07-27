import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Public } from 'src/auth/decorators/public.decorators';

@ApiTags('Stripe Callbacks')
@Public()
@Controller('stripe')
export class StripeVerificationController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('success')
  @ApiOperation({
    summary: 'Stripe success callback endpoint',
    description:
      'This endpoint is called by Stripe after successful payment completion',
  })
  async handleStripeSuccess(@Query('token') token: string) {
    try {
      if (!token) {
        throw new BadRequestException('Missing verification token');
      }

      // Verify the transaction using the JWT token
      const transaction =
        await this.transactionService.verifyStripePaymentWithToken(token);

      return {
        success: true,
        message: 'Payment verified successfully',
        transaction: {
          id: transaction.id,
          reference: transaction.reference,
          status: transaction.status,
          amount: transaction.amount,
          gateway: transaction.gateway,
          paidAt: transaction.paidAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Payment verification failed',
        error: true,
      };
    }
  }

  @Get('cancel')
  @ApiOperation({
    summary: 'Stripe cancel callback endpoint',
    description: 'This endpoint is called by Stripe when payment is cancelled',
  })
  handleStripeCancel(@Query('token') token?: string) {
    return {
      success: false,
      message: 'Payment was cancelled by user',
      cancelled: true,
      token,
    };
  }

  @Get('webhook')
  @ApiExcludeEndpoint()
  handleStripeWebhook() {
    // Placeholder for webhook implementation if needed in the future
    // This would require proper webhook signature verification
    throw new BadRequestException(
      'Webhook endpoint not implemented. Use JWT token verification instead.',
    );
  }
}
