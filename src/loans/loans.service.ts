import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Loan } from './entities/loan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayheroService } from 'src/payments/payhero/payhero.service';
import { randomUUID } from 'node:crypto';
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,

    @Inject(forwardRef(() => PayheroService))
    private readonly payheroService: PayheroService,
  ) {}

  async create(createLoanDto: CreateLoanDto): Promise<ApiResponse> {
    try {
      const existingLoan = await this.loanRepository.findOne({
        where: { email: createLoanDto.email },
      });
      if (existingLoan) {
        throw new ConflictException(
          `Loan application with email ${createLoanDto.email} already exists`,
        );
      }

      const externalReference = randomUUID();

      const stkResponse = await this.payheroService.sendSTKPush(
        createLoanDto.service_fee || 1,
        `0${String(createLoanDto.phone).substring(3)}`,
        externalReference,
      );

      const preparedLoan: Partial<Loan> = {
        ...createLoanDto,
        external_reference: externalReference,
        paid_service_fee: false,
      };

      const newLoan = this.loanRepository.create(preparedLoan);
      const savedLoan = await this.loanRepository.save(newLoan);

      return {
        success: true,
        message: 'Loan created and STK push initiated',
        data: {
          loan: savedLoan,
          stkResponse,
        },
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof ConflictException) throw error;

      return {
        success: false,
        message: 'Failed to create loan and initiate payment',
        error:
          error instanceof Error ? error.message : 'Unexpected error occurred',
      };
    }
  }
  async findAll(): Promise<ApiResponse<Loan[]>> {
    try {
      const loans = await this.loanRepository.find({
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
        message: 'Failed to retrieve loans',
        error:
          error instanceof Error
            ? error.message
            : ' An error occurred while performing this operation',
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
      return {
        success: false,
        message: 'Failed to retrieve loan',
        error:
          error instanceof Error
            ? error.message
            : ' An error occurred while performing this operation',
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
        error:
          error instanceof Error
            ? error.message
            : ' An error occurred while performing this operation',
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
      return {
        success: false,
        message: 'Failed to delete loan',
        error:
          error instanceof Error
            ? error.message
            : ' An error occurred while performing this operation',
      };
    }
  }

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
        error:
          error instanceof Error
            ? error.message
            : ' An error occurred while performing this operation',
      };
    }
  }
}
