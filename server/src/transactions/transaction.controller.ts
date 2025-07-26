import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { InitiatePaymentDto } from './dto/initiate-transaction.dto';
import { RefundTransactionDto } from './dto/refund-transaction.dto';
import { TransactionPaginatedDto } from './dto/transaction-paginated.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { Gateway } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { RequestWithUser } from 'src/shared/types/request.types';

@ApiTags('Transactions')
@Controller('transactions')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.PATIENT, Role.PHARMACIST)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a new transaction' })
  async initiate(
    @Body() processPayment: InitiatePaymentDto,
    @Req() req: RequestWithUser,
  ): Promise<{
    transaction: TransactionResponseDto;
    checkoutUrl?: string;
    clientSecret?: string;
  }> {
    return this.transactionService.initiateTransaction(
      req.user.sub,
      processPayment,
    );
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a transaction by reference' })
  async verify(
    @Body() data: { reference: string; gateway: Gateway },
  ): Promise<TransactionResponseDto> {
    return this.transactionService.verifyPayment(data.reference, data.gateway);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  async findAll(
    @Query() query: TransactionQueryDto,
    @Query() pagination: PaginationDto,
  ): Promise<TransactionPaginatedDto> {
    return this.transactionService.findAllTransactions(query, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    return this.transactionService.findTransactionById(id);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Refund a transaction' })
  async refund(
    @Body() refundDto: RefundTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.refundTransaction(refundDto);
  }
}
