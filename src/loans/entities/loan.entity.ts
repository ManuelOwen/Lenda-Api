import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity('loans')
export class Loan {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    full_name: string
    @Column()
    email: string
    @Column({ type: "bigint" })
    phone: number
    @Column()
    loan_amount: number
    @Column()
    service_fee: number

}
