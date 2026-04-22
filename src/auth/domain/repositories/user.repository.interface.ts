import { User } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
  updateToken(userId: string, token: string): Promise<void>;
  update(id: string, data: Partial<User>): Promise<void>;
}
