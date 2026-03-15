import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository, OnModuleInit {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    this.userModel.ensureIndexes();
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) return null;
    return this.mapToUser(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) return null;
    return this.mapToUser(user);
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const created = new this.userModel(data);
    const saved = await created.save();
    return this.mapToUser(saved);
  }

  async updateToken(userId: string, token: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { token });
  }

  private mapToUser(doc: UserDocument): User {
    return {
      id: doc._id?.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      token: doc.token,
    };
  }
}
