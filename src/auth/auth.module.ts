import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './infrastructure/services/auth.service';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RequestResetUseCase } from './application/use-cases/request-reset.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { MongoUserRepository } from './infrastructure/repositories/mongo-user.repository';
import { UserDocument, UserSchema } from './infrastructure/schemas/user.schema';
import { EmailService } from './infrastructure/services/email.service';
import { AuthGuard } from './guard/auth.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => {
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') ??
          '1d') as any;
        return {
          secret:
            configService.get<string>('JWT_SECRET') ?? 'default-secret-key',
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
    RequestResetUseCase,
    ResetPasswordUseCase,
    MongoUserRepository,
    EmailService,
    AuthGuard,
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
