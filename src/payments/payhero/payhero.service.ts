/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PayHero from 'payhero-wrapper';
import { Loan, LoanStatus } from 'src/loans/entities/loan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PayheroService {
  private readonly logger = new Logger(PayheroService.name);

  private payHeroConfig = {
    Authorization: process.env.AUTHORIZATION,
    pesapalConsumerKey: process.env.PESAPAL_CONSUMER_KEY,
    pesapalConsumerSecret: process.env.PESAPAL_CONSUMER_SECRET,
    pesapalApiUrl: process.env.PESAPAL_API_URL,
    pesapalCallbackUrl: process.env.PESAPAL_CALLBACK_URL,
    pesapalIpnId: process.env.PESAPAL_IPN_ID,
  };

  private payHeroService: PayHero;

  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {
    this.logger.log('🔐 PayHero Config loaded');
    this.payHeroService = new PayHero(this.payHeroConfig);
  }

  /**
   * Trigger an STK Push for M-Pesa payment
   */
  async sendSTKPush(amount: number, phone: string, externalReference: string) {
    const paymentDetails = {
      amount,
      phone_number: phone,
      channel_id: process.env.CHANNEL_ID,
      provider: 'm-pesa',
      callback_url: process.env.PESAPAL_CALLBACK_URL,
      external_reference: externalReference,
    };

    try {
      const response = await this.payHeroService.makeStkPush(paymentDetails);
      this.logger.log(`✅ STK Response: ${JSON.stringify(response)}`);

      // Update loan status to "pending"
      await this.loanRepository.update(
        { external_reference: externalReference },
        { status: LoanStatus.PENDING },
      );

      return response;
    } catch (error: any) {
      const errResp = error.response;

      if (errResp) {
        const { status, data } = errResp;

        this.logger.error(
          `❌ PayHero API Error [${status}]: ${JSON.stringify(data)}`,
        );

        // Update loan status to "failed"
        await this.loanRepository.update(
          { external_reference: externalReference },
          { status: LoanStatus.FAILED },
        );

        throw new HttpException(
          {
            success: false,
            message:
              data?.error_message || 'Payment request failed on provider side',
            code: data?.error_code || 'PAYHERO_ERROR',
            providerStatus: status,
          },
          status || HttpStatus.BAD_REQUEST,
        );
      } else if (error.request) {
        this.logger.error('❌ No response from PayHero API (network issue)');

        await this.loanRepository.update(
          { external_reference: externalReference },
          { status: LoanStatus.FAILED },
        );

        throw new HttpException(
          {
            success: false,
            message: 'No response from payment provider',
            hint: 'Check your network or provider uptime',
          },
          HttpStatus.GATEWAY_TIMEOUT,
        );
      } else {
        this.logger.error(`❌ PayHero Internal Error: ${error.message}`);

        await this.loanRepository.update(
          { external_reference: externalReference },
          { status: LoanStatus.FAILED },
        );

        throw new HttpException(
          {
            success: false,
            message: 'Internal payment error',
            details: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Handle payment callback from PayHero
   */
  async handleCallback(data: any) {
    const extRef = data?.response?.ExternalReference;
    const failureReason = data?.response?.ResultDesc;
    const paymentStatus = data?.response?.Status?.toLowerCase();
    this.logger.log('CallbackData', data);

    if (!extRef) {
      throw new HttpException(
        { success: false, message: 'Missing external reference' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingLoan = await this.loanRepository.findOne({
      where: { external_reference: extRef },
    });

    if (!existingLoan) {
      throw new NotFoundException(
        `Loan application with reference ${extRef} does not exist`,
      );
    }

    // Map PayHero status → LoanStatus
    const statusMap: Record<string, LoanStatus> = {
      completed: LoanStatus.SUCCESS,
      success: LoanStatus.SUCCESS,
      failed: LoanStatus.FAILED,
      cancelled: LoanStatus.FAILED,
      pending: LoanStatus.PENDING,
    };

    const newStatus = statusMap[paymentStatus] || LoanStatus.PENDING;

    await this.loanRepository.update(
      { external_reference: extRef },
      {
        status: newStatus,
        failure_reason:
          newStatus === LoanStatus.FAILED ? failureReason : 'An error occurred',
      },
    );

    this.logger.log(`💰 Payment status updated: ${extRef} → ${newStatus}`);

    return { received: true, status: newStatus };
  }

  async getStatus(externalRef: string) {
    const existingLoan = await this.loanRepository.findOne({
      where: { external_reference: externalRef },
    });
    if (!existingLoan) {
      throw new NotFoundException(
        `Loan application with reference ${externalRef} does not exist`,
      );
    }

    return existingLoan;
  }
}
