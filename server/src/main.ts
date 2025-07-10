import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as basicAuth from 'express-basic-auth';
import { TimeoutInterceptor } from './timeout-intercepter';
// import { ResponseFormatInterceptor } from './response-filter.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());

  app.enableCors({
    origin: ['http://localhost:5173', 'https://react.dev.lo'],

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      // forbidNonWhitelisted: true,
      // transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  // app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalInterceptors(new TimeoutInterceptor(300000));

  // Swagger configuration
  const config = new DocumentBuilder()
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'jwt-access-token',
    })

    .setTitle('Nine Hertz Medic Health Care Management System')
    .setDescription(
      'A comprehensive Health Care Management System to manage patient records, appointments, and medical services effectively.',
    )
    .setVersion('1.0')
    .addTag('Health Care')
    .build();

  const swaggerUser = configService.get<string>('SWAGGER_USER') || 'admin';
  const swaggerPass = configService.get<string>('SWAGGER_PASS') || 'admin';

  app.use(
    ['/api/docs', '/api-json'],
    basicAuth({
      challenge: true,
      users: { [swaggerUser]: swaggerPass },
      realm: 'Swagger Documentation',
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'none',
      operationsSorter: 'none',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },

    customSiteTitle: 'CRM System API Documentation',
    customCss: '.topbar { display: none; }',
  });

  const PORT = configService.get<number>('PORT') || 8800;
  await app.listen(PORT);
}

bootstrap();
