// import { Injectable, Logger } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Quote, } from '../quotes/entities/quote.entity';
// import { User, Role } from '../users/entities/user.entity';
// import { Consultation, consultType } from '../consultations/entities/consultation.entity';
// import { DiasporaRequest } from '../diaspora_requests/entities/diaspora_request.entity';
// import { OutsourcingRequest } from '../outsourcing_requests/entities/outsourcing_request.entity';
// import { Payment, paymentStatus } from '../payments/entities/payment.entity';

// @Injectable()
// export class SeedService {
//   private readonly logger = new Logger(SeedService.name);

//   constructor(
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     @InjectRepository(Quote)
//     private readonly quoteRepository: Repository<Quote>,
//     @InjectRepository(Consultation)
//     private readonly consultationRepository: Repository<Consultation>,
//     @InjectRepository(DiasporaRequest)
//     private readonly diasporaRepository: Repository<DiasporaRequest>,
//     @InjectRepository(OutsourcingRequest)
//     private readonly outsourcingRepository: Repository<OutsourcingRequest>,
//     @InjectRepository(Payment)
//     private readonly paymentRepository: Repository<Payment>,
//   ) { }

//   async seedQuotes() {
//     this.logger.log('Seeding quotes...');
//     const samples: Partial<Quote>[] = [
//       {
//         customerName: 'Alice Johnson',
//         email: 'alice@example.com',
//         tel: '+254700111222',
//         productType: 'Home Insurance',
//         extra: {
//           description: 'Home insurance for 3-bedroom house'
//         },
//         status: 'pending'
//       },
//       {
//         customerName: 'Bob Smith',
//         email: 'bob@example.com',
//         tel: '+254700333444',
//         productType: 'Auto Insurance',
//         extra: {
//           description: 'Comprehensive car insurance for 2019 sedan'
//         },
//         status: 'pending'
//       },
//       {
//         customerName: 'Carol Lee',
//         email: 'carol@example.com',
//         tel: '+254700555666',
//         productType: 'Health Insurance',
//         extra: {
//           description: 'Health insurance for family of four'
//         },
//         status: 'pending'
//       }
//     ];

//     const quotesToSave = samples.map(quote => this.quoteRepository.create(quote));
//     const saved = await this.quoteRepository.save(quotesToSave);
//     this.logger.log(`Seeded ${saved.length} quotes`);
//         product: 'Health Insurance',
//         message: 'Health cover for family of four',
//         // status: quoteStatus.APPROVED,
//       },
//     ];

//     const created = this.quoteRepository.create(samples);
//     const saved = await this.quoteRepository.save(created);
//     this.logger.log(`Seeded ${saved.length} quotes`);
//     return { success: true, count: saved.length };
//   }

//   async seedUsers() {
//     this.logger.log('Seeding users...');
//     const users: Partial<User>[] = [
//       {
//         email: 'admin@example.com',
//         name: 'Admin User',
//         password: 'Password123!',
//         phoneNumber: '+254700000001',
//         role: Role.ADMIN,
//       },
//       {
//         email: 'user1@example.com',
//         name: 'User One',
//         password: 'Password123!',
//         phoneNumber: '+254700000002',
//         role: Role.USER,
//       },
//       {
//         email: 'user2@example.com',
//         name: 'User Two',
//         password: 'Password123!',
//         phoneNumber: '+254700000003',
//         role: Role.USER,
//       },
//     ];
//     const created = this.userRepository.create(users as User[]);
//     const saved = await this.userRepository.save(created as User[]);
//     this.logger.log(`Seeded ${saved.length} users`);
//     return { success: true, count: saved.length };
//   }

//   // async seedConsultations() {
//   //   this.logger.log('Seeding consultations...');
//   //   const items: Partial<Consultation>[] = [
//   //     {
//   //       user_id: 1,
//   //       name: 'Alice Johnson',
//   //       // email: 'alice@example.com',
//   //       phone: '+254700111222',
//   //       country: 'Kenya',
//   //       timezone: 'Africa/Nairobi',
//   //       service_interest: 'Cloud Migration',
//   //       consult_type: consultType.ONLINE,
//   //       date: new Date(),
//   //       // status, meeting_link, duration, notes are not in entity
//   //     },
//   //     {
//   //       user_id: 2,
//   //       name: 'Bob Smith',
//   //       // email: 'bob@example.com',
//   //       phone: '+254700333444',
//   //       country: 'Kenya',
//   //       timezone: 'Africa/Nairobi',
//   //       service_interest: 'Security Audit',
//   //       consult_type: consultType.ONLINE,
//   //       date: new Date(Date.now() + 86400000),
//   //       // status, meeting_link, duration, notes are not in entity
//   //     },
//   //   ];
//   //   const created = this.consultationRepository.create(items);
//   //   const saved = await this.consultationRepository.save(created);
//   //   this.logger.log(`Seeded ${saved.length} consultations`);
//   //   return { success: true, count: saved.length };
//   // }

//   async seedAll() {
//     const [users, quotes, consultations, diaspora, outsourcing,] = await Promise.all([
//       this.seedUsers(),
//       this.seedQuotes(),
//       // this.seedConsultations(),
//       this.seedDiasporaRequests(),
//       this.seedOutsourcingRequests(),
//       this.seedPayments(),
//     ]);
//     return {
//       success: true,
//       users,
//       quotes,
//       consultations,
//       diaspora,
//       outsourcing,
//       // payments,
//     };
//   }

//   async seedDiasporaRequests() {
//     this.logger.log('Seeding diaspora requests...');
//     const items: Partial<DiasporaRequest>[] = [
//       {
//         user_id: 1,
//         name: 'Grace N',
//         email: 'grace@example.com',
//         phone: '+254701001001',
//         country: 'Kenya',
//         details: 'Seeking assistance with property management while abroad.',
//         status: 'pending',
//       },
//       {
//         user_id: 2,
//         name: 'Henry O',
//         email: 'henry@example.com',
//         phone: '+254702002002',
//         country: 'Uganda',
//         details: 'Looking for investment advisory and local representation.',
//         status: 'pending',
//       },
//       {
//         user_id: 3,
//         name: 'Imani K',
//         email: 'imani@example.com',
//         phone: '+254703003003',
//         country: 'Tanzania',
//         details: 'Help with business registration and compliance.',
//         status: 'pending',
//       },
//     ];
//     const created = this.diasporaRepository.create(items);
//     const saved = await this.diasporaRepository.save(created);
//     this.logger.log(`Seeded ${saved.length} diaspora requests`);
//     return { success: true, count: saved.length };
//   }

//   async seedOutsourcingRequests() {
//     this.logger.log('Seeding outsourcing requests...');
//     const items: Partial<OutsourcingRequest>[] = [
//       {
//         // user_id: 1,
//         organization_name: 'Acme Corp',
//         core_functions: 'Manufacturing and Product Design',
//         location: 'Nairobi',
//         address: '123 Industrial Rd, Nairobi',
//         email: 'ops@acme.example',
//         services: { payroll: true, it_support: true },
//         nature_of_outsourcing: 'Business Process Outsourcing',
//         budget_range: 'USD 10,000 - 20,000',
//         status: 'pending',
//       },
//       {
//         // user_id: 2,
//         organization_name: 'Globex Ltd',
//         core_functions: 'E-commerce and Logistics',
//         location: 'Kampala',
//         address: '45 Market St, Kampala',
//         email: 'contact@globex.example',
//         services: { warehousing: true, customer_support: true },
//         nature_of_outsourcing: 'IT Outsourcing',
//         budget_range: 'USD 5,000 - 15,000',
//         status: 'pending',
//       },
//     ];
//     const created = this.outsourcingRepository.create(items);
//     const saved = await this.outsourcingRepository.save(created);
//     this.logger.log(`Seeded ${saved.length} outsourcing requests`);
//     return { success: true, count: saved.length };
//   }

//   async seedPayments() {
//     this.logger.log('Seeding payments...');
//     const items: Partial<Payment>[] = [
//       {
//         user_id: 1,
//         amount: 4999.99,
//         currency: 'KES',
//         method: 'M-Pesa',
//         status: paymentStatus.COMPLETED,
//         reference: 'MPESA-ABC123',
//         metadata: { txId: 'ABC123', channel: 'mobile' },
//       },
//       {
//         user_id: 2,
//         amount: 1200.0,
//         currency: 'KES',
//         method: 'Card',
//         status: paymentStatus.PENDING,
//         reference: 'CARD-XYZ789',
//         metadata: { authCode: '999111', gateway: 'Stripe' },
//       },
//       {
//         user_id: 3,
//         amount: 850.5,
//         currency: 'USD',
//         method: 'Bank Transfer',
//         status: paymentStatus.FAILED,
//         reference: 'BANK-TRF-777',
//         metadata: { reason: 'Insufficient funds' },
//       },
//     ];
//     const created = this.paymentRepository.create(items);
//     const saved = await this.paymentRepository.save(created);
//     this.logger.log(`Seeded ${saved.length} payments`);
//     return { success: true, count: saved.length };
//   }
// }

