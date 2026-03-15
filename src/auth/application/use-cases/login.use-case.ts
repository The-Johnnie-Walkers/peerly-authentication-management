import { Injectable } from '@nestjs/common';
import { MongoUserRepository } from '../../infrastructure/repositories/mongo-user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: MongoUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    if (user.id) {
      await this.userRepository.updateToken(user.id, token);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    };
  }
}
