import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { MPesaService } from './m-pesa/m-pesa.service';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly mpesaService: MPesaService,
  ) {}

  @Post()
  create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<ApiResponse<Payment>> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  findAll(): Promise<ApiResponse<Payment[]>> {
    return this.paymentsService.findAll();
  }

  // Paystack (or provider) callback/verification endpoint using query params
  // MUST be before @Get(':id') to avoid route conflicts
  @Get('callback')
  verifyCallback(
    @Query('reference') reference?: string,
    @Query('trxref') trxref?: string,
    @Query('ref') ref?: string,
    @Query('provider') provider?: string,
  ): Promise<ApiResponse<{ reference: string; provider?: string }>> {
    const finalRef = reference || trxref || ref || '';
    return this.paymentsService.verifyByReference(finalRef, provider);
  }

  @Post('initialize')
  initiateSTKTransaction(
    @Body() body: { phoneNumber: string; amount: number },
  ) {
    this.mpesaService.sendStkPush(body.phoneNumber, body.amount);
  }
  @Post('callback')
  STKCallback(@Body() body: any) {
    console.dir(body, { depth: null });
    this.mpesaService.stkCallback(body);
  }
  @Post('status')
  transactionStatus(@Body() body: { transactionId: string }) {
    console.log(body);
    this.mpesaService.transactionStatus(body.transactionId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Payment>> {
    return this.paymentsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<ApiResponse<Payment>> {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<null>> {
    return this.paymentsService.remove(id);
  }
}
