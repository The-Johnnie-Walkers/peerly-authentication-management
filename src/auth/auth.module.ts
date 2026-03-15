import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { MongoUserRepository } from './infrastructure/repositories/mongo-user.repository';
import { UserDocument, UserSchema } from './infrastructure/schemas/user.schema';
import { AuthGuard } from './guard/auth.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => {
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') ?? '1d') as any;
        return {
          secret: configService.get<string>('JWT_SECRET') ?? 'default-secret-key',
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegisterUseCase,
    LoginUseCase,
    MongoUserRepository,
    AuthGuard,
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
