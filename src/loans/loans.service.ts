import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Loan } from './entities/loan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MPesaService } from 'src/payments/m-pesa/m-pesa.service';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly mpesaServive: MPesaService,
  ) {}

  async create(createLoanDto: CreateLoanDto): Promise<ApiResponse<Loan>> {
    try {
      // Check if a loan with the same email already exists
      const existingLoan = await this.loanRepository.findOne({
        where: { email: createLoanDto.email },
      });

      if (existingLoan) {
        throw new ConflictException(
          `Loan application with email ${createLoanDto.email} already exists`,
        );
      }

      const preparedLoan: Partial<Loan> = {
        ...createLoanDto,
        full_name: createLoanDto.full_name,
        email: createLoanDto.email,
        phone: createLoanDto.phone,
        loan_amount: createLoanDto.loan_amount,
      };

      const newLoan = this.loanRepository.create(preparedLoan);
      const savedLoan = await this.loanRepository.save(newLoan);

      const status = await this.mpesaServive.sendStkPush(
        String(createLoanDto.phone),
        createLoanDto.service_fee,
      );
      console.log(status);
      return {
        success: true,
        message: 'Loan application submitted successfully',
        data: savedLoan,
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      return {
        success: false,
        message: 'Failed to create loan application',
        error: error.message,
      };
    }
  }

  async findAll(): Promise<ApiResponse<Loan[]>> {
    try {
      const loans = await this.loanRepository.find({
        order: { id: 'DESC' }, // Using id since created_at doesn't exist in your entity
      });
      return {
        success: true,
        message: 'Loans retrieved successfully',
        data: loans,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve loans',
        error: error.message,
      };
    }
  }

  async findOne(id: number): Promise<ApiResponse<Loan>> {
    try {
      const loan = await this.loanRepository.findOne({ where: { id } });
      if (!loan) {
        throw new NotFoundException(`Loan with id ${id} not found`);
      }
      return {
        success: true,
        message: 'Loan found successfully',
        data: loan,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      return {
        success: false,
        message: 'Failed to retrieve loan',
        error: error.message,
      };
    }
  }

  async updateLoan(
    id: number,
    updateLoanDto: UpdateLoanDto,
  ): Promise<ApiResponse<Loan>> {
    try {
      const loan = await this.loanRepository.findOne({ where: { id } });
      if (!loan) {
        throw new NotFoundException(`Loan with id ${id} not found`);
      }

      // Check if email is being updated and if it conflicts with existing loan
      if (updateLoanDto.email && updateLoanDto.email !== loan.email) {
        const existingLoan = await this.loanRepository.findOne({
          where: { email: updateLoanDto.email },
        });

        if (existingLoan) {
          throw new ConflictException(
            `Loan application with email ${updateLoanDto.email} already exists`,
          );
        }
      }

      const updatedLoan = await this.loanRepository.save({
        ...loan,
        ...updateLoanDto,
      });

      return {
        success: true,
        message: 'Loan updated successfully',
        data: updatedLoan,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      return {
        success: false,
        message: 'Failed to update loan',
        error: error.message,
      };
    }
  }

  async deleteLoan(id: number): Promise<ApiResponse<null>> {
    try {
      const loan = await this.loanRepository.findOne({ where: { id } });
      if (!loan) {
        throw new NotFoundException(`Loan with id ${id} not found`);
      }

      await this.loanRepository.remove(loan);
      return {
        success: true,
        message: 'Loan deleted successfully',
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      return {
        success: false,
        message: 'Failed to delete loan',
        error: error.message,
      };
    }
  }

  // Additional method to find loans by email
  async findByEmail(email: string): Promise<ApiResponse<Loan[]>> {
    try {
      const loans = await this.loanRepository.find({
        where: { email },
        order: { id: 'DESC' },
      });

      return {
        success: true,
        message: 'Loans retrieved successfully',
        data: loans,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve loans by email',
        error: error.message,
      };
    }
  }
}
