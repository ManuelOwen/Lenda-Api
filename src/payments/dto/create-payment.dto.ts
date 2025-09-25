import { IsNumber, IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { paymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsOptional()
  status?: paymentStatus;

  // @IsString()
  // @IsNotEmpty()
  // reference: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
