import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Put } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) { }

  @Post()
  async create(@Body() createLoanDto: CreateLoanDto) {
    const result = await this.loansService.create(createLoanDto);

    if (!result.success) {
      throw new HttpException(
        {
          message: result.message,
          error: result.error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: result.message,
      data: result.data,
    };
  }

  @Get()
  async findAll() {
    const result = await this.loansService.findAll();

    if (!result.success) {
      throw new HttpException(
        {
          message: result.message,
          error: result.error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: result.message,
      data: result.data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.loansService.findOne(+id);

    if (!result.success) {
      throw new HttpException(
        {
          message: result.message,
          error: result.error,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: result.message,
      data: result.data,
    };
  }

  @Put(':id')
  async updateLoan(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    const result = await this.loansService.updateLoan(+id, updateLoanDto);

    if (!result.success) {
      throw new HttpException(
        {
          message: result.message,
          error: result.error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: result.message,
      data: result.data,
    };
  }

  @Delete(':id')
  async deleteLoan(@Param('id') id: string) {
    const result = await this.loansService.deleteLoan(+id);

    if (!result.success) {
      throw new HttpException(
        {
          message: result.message,
          error: result.error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: result.message,
      data: result.data,
    };
  }

  // Additional endpoint to find loans by email
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const result = await this.loansService.findByEmail(email);

    if (!result.success) {
      throw new HttpException(
        {
          message: result.message,
          error: result.error,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: result.message,
      data: result.data,
    };
  }

 

  }
