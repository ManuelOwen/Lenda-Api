import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PayheroService } from './payhero/payhero.service';
import { Loan } from 'src/loans/entities/loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Loan])],
  controllers: [PaymentsController],
  providers: [PaymentsService, PayheroService],
})
export class PaymentsModule {}
