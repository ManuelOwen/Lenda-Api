import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface MpesaStkCallback {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: number;
            ResultDesc: string;
            CallbackMetadata?: {
                Item: CallbackItem[];
            };
        };
    };
}

export interface CallbackItem {
    Name: 'Amount' | 'MpesaReceiptNumber' | 'TransactionDate' | 'PhoneNumber' | string;
    Value: number | string;
}

@Injectable()
export class MPesaService {
    constructor() { }

    async stkCallback(callbackData: MpesaStkCallback) {
        const resultCode = callbackData.Body.stkCallback.ResultCode;

        if (resultCode !== 0) {
            return {
                ResultCode: resultCode,
                ResultDesc: callbackData.Body.stkCallback.ResultDesc,
            };
        }

        const body = callbackData.Body.stkCallback.CallbackMetadata;
        if (!body) {
            throw new BadRequestException('Missing CallbackMetadata in successful transaction.');
        }

        const amountObj = body.Item.find((obj) => obj.Name === 'Amount');
        const codeObj = body.Item.find((obj) => obj.Name === 'MpesaReceiptNumber');
        const phoneObj = body.Item.find((obj) => obj.Name === 'PhoneNumber');

        return {
            message: 'success',
            amount: amountObj?.Value,
            mpesaCode: codeObj?.Value,
            phone: phoneObj?.Value,
        };
    }

    async sendStkPush(phoneNumber: string, amount: number) {
        if (!phoneNumber || !amount) {
            throw new BadRequestException('Phone number and amount are required.');
        }

        const token = await this.getAccessToken();
        const timestamp = this.generateTimestamp();

        const shortCode = process.env.DARAJA_SHORTCODE;
        const passkey = process.env.DARAJA_PASSKEY;
        const callbackUrl = process.env.DARAJA_CALLBACK_URL;

        if (!shortCode || !passkey || !callbackUrl) {
            throw new Error('Missing required Daraja configuration in environment variables.');
        }

        const stkPassword = Buffer.from(shortCode + passkey + timestamp).toString('base64');

        const url =
            process.env.DARAJA_ENV === 'live'
                ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
                : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        const requestBody = {
            BusinessShortCode: shortCode,
            Password: stkPassword,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: shortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: callbackUrl,
            AccountReference: 'account',
            TransactionDesc: 'Payment',
        };

        try {
            const response = await axios.post(url, requestBody, { headers });
            return response.data;
        } catch (error) {
            console.error('STK Push Error:', error.response?.data || error.message);
            throw new Error('Failed to initiate STK push request.');
        }
    }

    async transactionStatus(transactionId: string, identifierType: number = 1) {
        if (!transactionId) {
            throw new BadRequestException('Transaction ID is required.');
        }

        const token = await this.getAccessToken();
        const shortCode = process.env.DARAJA_SHORTCODE;
        const callbackUrl = process.env.DARAJA_CALLBACK_URL;
        const initiatorName = process.env.DARAJA_INITIATOR_NAME; // e.g., "testapi"
        const securityCredential = process.env.DARAJA_SECURITY_CREDENTIAL; // encrypted password

        if (!shortCode || !callbackUrl || !initiatorName || !securityCredential) {
            throw new Error('Missing required Daraja configuration in environment variables.');
        }

        const url =
            process.env.DARAJA_ENV === 'live'
                ? 'https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query'
                : 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query';

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        const requestBody = {
            Initiator: initiatorName,
            SecurityCredential: securityCredential,
            CommandID: 'TransactionStatusQuery',
            TransactionID: transactionId,
            PartyA: shortCode,
            IdentifierType: identifierType, // 1 = MSISDN, 2 = Till Number, 4 = PayBill
            ResultURL: callbackUrl,
            QueueTimeOutURL: callbackUrl,
            Remarks: 'Transaction status query',
            Occasion: 'TransactionStatus',
        };

        try {
            const response = await axios.post(url, requestBody, { headers });
            return response.data;
        } catch (error) {
            console.error('Transaction Status Error:', error.response?.data || error.message);
            throw new Error('Failed to query transaction status.');
        }
    }

    private async getAccessToken(): Promise<string> {
        const consumerKey = process.env.DARAJA_CONSUMER_KEY;
        const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

        if (!consumerKey || !consumerSecret) {
            throw new Error('Missing Daraja consumer credentials in environment variables.');
        }

        const url =
            process.env.DARAJA_ENV === 'live'
                ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
                : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

        try {
            const encodedCredentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
            const headers = {
                Authorization: `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json',
            };

            const response = await axios.get(url, { headers });
            return response.data.access_token;
        } catch (error) {
            console.error('Access Token Error:', error.response?.data || error.message);
            throw new Error('Failed to get access token.');
        }
    }

    private generateTimestamp(): string {
        const date = new Date();
        return (
            date.getFullYear().toString() +
            ('0' + (date.getMonth() + 1)).slice(-2) +
            ('0' + date.getDate()).slice(-2) +
            ('0' + date.getHours()).slice(-2) +
            ('0' + date.getMinutes()).slice(-2) +
            ('0' + date.getSeconds()).slice(-2)
        );
    }
}
