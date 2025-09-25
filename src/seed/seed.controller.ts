// import { Controller, Post, HttpStatus, HttpCode, Logger } from '@nestjs/common';
// // import { SeedService } from './seed.service';

// @Controller('seed')
// export class SeedController {
//   private readonly logger = new Logger(SeedController.name);

//   // constructor(private readonly seedService: SeedService) {}

//   @Post()
//   @HttpCode(HttpStatus.OK)
//   async seed() {
//     this.logger.log('Seed endpoint called');
//     return this.seedService.seedAll();
//   }

//   @Post('payments')
//   @HttpCode(HttpStatus.OK)
//   // async seedPayments() {
//   //   this.logger.log('Seed payments endpoint called');
//   //   // return this.seedService.seedPayments();
//   // }

//   @Post('orders')
//   @HttpCode(HttpStatus.OK)
//   async seedOrders() {
//     this.logger.log('Seed orders endpoint called');
//     // return this.seedService.seedOrders();
//   }

//   @Post('feedbacks')
//   @HttpCode(HttpStatus.OK)
//   async seedFeedbacks() {
//     this.logger.log('Seed feedbacks endpoint called');
//     // return this.seedService.seedFeedbacks();
//   }

//   @Post('customers-support')
//   @HttpCode(HttpStatus.OK)
//   async seedCustomersSupport() {
//     this.logger.log('Seed customer support endpoint called');
//     // return this.seedService.seedCustomersSupport();
//   }

//   // seed users
//   @Post('users')
//   @HttpCode(HttpStatus.OK)
//   async seedUsers() {
//     this.logger.log('seed endpoint called');
//     return this.seedService.seedUsers();
//   }

//   @Post('quotes')
//   @HttpCode(HttpStatus.OK)
//   async seedQuotes() {
//     this.logger.log('Seed quotes endpoint called');
//     return this.seedService.seedQuotes();
//   }

//   @Post('consultations')
//   @HttpCode(HttpStatus.OK)
//   async seedConsultations() {
//     this.logger.log('Seed consultations endpoint called');
//     // return this.seedService.seedConsultations();
//   }

//   @Post('diaspora-requests')
//   @HttpCode(HttpStatus.OK)
//   async seedDiasporaRequests() {
//     this.logger.log('Seed diaspora requests endpoint called');
//     return this.seedService.seedDiasporaRequests();
//   }

//   @Post('outsourcing-requests')
//   @HttpCode(HttpStatus.OK)
//   async seedOutsourcingRequests() {
//     this.logger.log('Seed outsourcing requests endpoint called');
//     return this.seedService.seedOutsourcingRequests();
//   }

//   @Post('payments')
//   @HttpCode(HttpStatus.OK)
//   async seedPayments() {
//     this.logger.log('Seed payments endpoint called');
//     return this.seedService.seedPayments();
//   }
// }
