import { IsNotEmpty,IsNumber,IsString } from 'class-validator';


export class CreateLoanDto {
    @IsString()
    @IsNotEmpty()
    full_name:string
    @IsNumber()
    @IsNotEmpty()
    phone:number
    @IsString()
    @IsNotEmpty()
    email:string
    @IsNumber()
    @IsNotEmpty()
    loan_amount:number
    @IsNumber()
    @IsNotEmpty()
    service_fee:number



}
