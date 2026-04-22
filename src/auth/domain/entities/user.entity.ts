export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  token?: string;
  createdAt?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
}
