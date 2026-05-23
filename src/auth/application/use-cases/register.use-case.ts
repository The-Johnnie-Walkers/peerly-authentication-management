import { Injectable } from '@nestjs/common';
import { MongoUserRepository } from '../../infrastructure/repositories/mongo-user.repository';
import * as bcrypt from 'bcrypt';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(private readonly userRepository: MongoUserRepository) {}

  async execute(input: RegisterInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
