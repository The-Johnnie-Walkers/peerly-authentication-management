import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import type { RegisterInput } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import type { LoginInput } from './application/use-cases/login.use-case';
import { RequestInput, RequestResetUseCase } from './application/use-cases/request-reset.use-case';
import { ResetInput, ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly requestResetUseCase: RequestResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  async register(input: RegisterInput) {
    try {
      return await this.registerUseCase.execute(input);
    } catch (error) {
      if (error.message === 'User already exists') {
        throw new BadRequestException('User already exists');
      }
      throw error;
    }
  }

  async login(input: LoginInput) {
    try {
      return await this.loginUseCase.execute(input);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  async requestReset(input: RequestInput): Promise<void> {
    try {
      return await this.requestResetUseCase.execute(input);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async resetPassword(input: ResetInput): Promise<void> {
    try {
      return await this.resetPasswordUseCase.execute(input);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
