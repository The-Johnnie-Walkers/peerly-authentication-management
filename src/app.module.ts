import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forRoot({envFilePath: '.env', isGlobal: true})],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI') ?? 'mongodb://localhost:27017/peerly-auth',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
