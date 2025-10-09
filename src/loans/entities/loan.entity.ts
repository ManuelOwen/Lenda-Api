import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

export enum LoanStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  full_name: string;

  @Column()
  email: string;

  @Column({ type: 'bigint' })
  phone: number;

  @Column()
  loan_amount: number;

  @Column()
  service_fee: number;

  @Column({ type: 'boolean', default: false })
  paid_service_fee: boolean;

  @Column({ nullable: false })
  external_reference: string;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;
}
