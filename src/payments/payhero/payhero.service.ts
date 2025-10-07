import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import PayHero from 'payhero-wrapper';

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

  constructor() {
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
      return response;
    } catch (error: any) {
      // Handle Axios-style errors cleanly
      const errResp = error.response;

      if (errResp) {
        // 🧠 PayHero / Axios error with response data
        const { status, data } = errResp;

        // Log a clean, readable message
        this.logger.error(
          `❌ PayHero API Error [${status}]: ${JSON.stringify(data)}`,
        );

        // Check for known PayHero error shape
        if (data?.error_message || data?.error_code) {
          throw new HttpException(
            {
              success: false,
              message:
                data.error_message || 'Payment request failed on provider side',
              code: data.error_code || 'PAYHERO_ERROR',
              providerStatus: status,
            },
            status || HttpStatus.BAD_REQUEST,
          );
        }

        // Generic Axios API error
        throw new HttpException(
          {
            success: false,
            message: 'Unexpected payment provider error',
            details: data,
          },
          status || HttpStatus.BAD_REQUEST,
        );
      } else if (error.request) {
        // 🕓 No response (network issue or timeout)
        this.logger.error('❌ No response from PayHero API (network issue)');
        throw new HttpException(
          {
            success: false,
            message: 'No response from payment provider',
            hint: 'Check your network or provider uptime',
          },
          HttpStatus.GATEWAY_TIMEOUT,
        );
      } else {
        // ⚙️ Non-Axios or unexpected error
        this.logger.error(`❌ PayHero Internal Error: ${error.message}`);
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
   * Handle async callback from PayHero (Pesapal)
   */
  handleCallback(data: any) {
    this.logger.log('📞 STK Callback Data:', data);
    // Later update the loan table using externalReference
    return { received: true };
  }
}
