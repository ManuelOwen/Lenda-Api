import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/db.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
// import { SeedModule } from './seed/seed.module';
// import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './rate limiter/throttler.guard';


import { PaymentsModule } from './payments/payments.module';
import { LoansModule } from './loans/loans.module';


@Module({
  imports: [
    // UsersModule,
    DatabaseModule,
    // AuthModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minute in milliseconds
        limit: 20, // 20 requests per minute
      },
    ]),
    // SeedModule,

   

    PaymentsModule,
    LoansModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },

  ],
})
export class AppModule { }
