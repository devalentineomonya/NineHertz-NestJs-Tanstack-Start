import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // host: configService.get<string>('DATABASE_HOST') || 'localhost',
        // port: configService.get<number>('DATABASE_PORT') || 5432,
        // username: configService.get<string>('DATABASE_USER') || 'postgres',
        // password: configService.get<string>('DATABASE_PASSWORD') || 'password',
        // database: configService.get<string>('DATABASE_DB') || 'postgres',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        // ssl: true,
        // //  configService.get<string>('NODE_ENV') !== 'development',
        synchronize: true,
        //  configService.get<string>('NODE_ENV') !== 'production',
        logging: true,
        //  configService.get<string>('NODE_ENV') !== 'production',
        url: configService.get<string>('DATABASE_URL'),
      }),
    }),
  ],
})
export class DatabaseModule {}
