import { LoginUseCase } from './login.use-case';
import * as bcrypt from 'bcrypt';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockRepo: any;
  let mockJwt: any;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    mockRepo = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@mail.com',
        password: hashedPassword,
      }),
      updateToken: jest.fn(),
    };
    mockJwt = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };
    useCase = new LoginUseCase(mockRepo, mockJwt);
  });

  it('should return token on valid credentials', async () => {
    const result = await useCase.execute({ email: 'test@mail.com', password: 'password123' });

    expect(result.token).toBe('mock-jwt-token');
    expect(result.email).toBe('test@mail.com');
    expect(mockRepo.updateToken).toHaveBeenCalledWith('user-1', 'mock-jwt-token');
  });

  it('should throw on user not found', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'noexist@mail.com', password: 'pass' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw on wrong password', async () => {
    await expect(
      useCase.execute({ email: 'test@mail.com', password: 'wrongpassword' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should include name in JWT payload', async () => {
    await useCase.execute({ email: 'test@mail.com', password: 'password123' });

    const payload = mockJwt.signAsync.mock.calls[0][0];
    expect(payload.name).toBe('Test User');
    expect(payload.sub).toBe('user-1');
  });
});
