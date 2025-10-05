import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<ApiResponse<Payment>> {
    try {
      const newPayment = this.paymentRepository.create(createPaymentDto);
      const saved = await this.paymentRepository.save(newPayment);
      return {
        success: true,
        message: 'Payment created successfully',
        data: saved,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: 'Failed to create payment',
        error:
          error instanceof Error
            ? error.message
            : 'An error occured while performing this operation',
      };
    }
  }

  async findAll(): Promise<ApiResponse<Payment[]>> {
    try {
      const items = await this.paymentRepository.find({
        order: { created_at: 'DESC' },
      });
      return {
        success: true,
        message: 'Payments retrieved successfully',
        data: items,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: 'Failed to retrieve payments',
        error:
          error instanceof Error
            ? error.message
            : 'An error occured while performing this operation',
      };
    }
  }

  async findOne(id: number): Promise<ApiResponse<Payment>> {
    try {
      const item = await this.paymentRepository.findOne({ where: { id } });
      if (!item) throw new NotFoundException(`Payment with id ${id} not found`);
      return {
        success: true,
        message: 'Payment found successfully',
        data: item,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to find payment with id ${id}`,
        error:
          error instanceof Error
            ? error.message
            : 'An error occured while performing this operation',
      };
    }
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<ApiResponse<Payment>> {
    try {
      const item = await this.paymentRepository.findOne({ where: { id } });
      if (!item) throw new NotFoundException(`Payment with id ${id} not found`);
      const saved = await this.paymentRepository.save({
        ...item,
        ...updatePaymentDto,
      });
      return {
        success: true,
        message: 'Payment updated successfully',
        data: saved,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update payment with id ${id}`,
        error:
          error instanceof Error
            ? error.message
            : 'An error occured while performing this operation',
      };
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const item = await this.paymentRepository.findOne({ where: { id } });
      if (!item) throw new NotFoundException(`Payment with id ${id} not found`);
      await this.paymentRepository.remove(item);
      return {
        success: true,
        message: 'Payment deleted successfully',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete payment with id ${id}`,
        error:
          error instanceof Error
            ? error.message
            : 'An error occured while performing this operation',
      };
    }
  }
}
