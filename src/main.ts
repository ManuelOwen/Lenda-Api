import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    cors: false,
  });

  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
          'Access-Control-Allow-Methods',
          'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        );
        res.header(
          'Access-Control-Allow-Headers',
          'Content-Type, Accept, Authorization',
        );
        res.header('Access-Control-Max-Age', '86400');
        return res.status(200).end();
      }
      next();
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.tailwindcss.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
          fontSrc: ["'self'", 'cdnjs.cloudflare.com'],
          imgSrc: ["'self'", 'data:', '*.postgresql.org', 'nestjs.com'],
        },
      },
    }),
  );

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Authorization',
    );
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // api versioning
  app.setGlobalPrefix('api/v1');
  // swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Gallo API')

    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:8000', 'Local Development Server')
    .addServer('https://gallo-api.com', 'Production Server')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [ ],
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      operationsSorter: 'alpha',
      showRequestDuration: true,
      tryItOutEnabled: true,
      filter: true,
      showTags: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin-bottom: 20px; }
    `,
    customSiteTitle: 'Olive Groceries API Documentation',
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 8000;
  await app.listen(PORT);
  console.log(`Server is running on port ${PORT}`);
}
bootstrap();
