import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/db.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';

import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './rate limiter/throttler.guard';

import { PaymentsModule } from './payments/payments.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [
    DatabaseModule,

    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 20,
      },
    ]),

    PaymentsModule,
    LoansModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
