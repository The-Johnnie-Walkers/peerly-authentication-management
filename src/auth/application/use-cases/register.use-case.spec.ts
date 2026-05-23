import { RegisterUseCase } from './register.use-case';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    useCase = new RegisterUseCase(mockRepo);
  });

  it('should register a new user successfully', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: '1', name: 'Test', email: 'test@mail.com' });

    const result = await useCase.execute({ name: 'Test', email: 'test@mail.com', password: 'pass123' });

    expect(result).toEqual({ id: '1', name: 'Test', email: 'test@mail.com' });
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
  });

  it('should throw if user already exists', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: '1', email: 'test@mail.com' });

    await expect(
      useCase.execute({ name: 'Test', email: 'test@mail.com', password: 'pass123' }),
    ).rejects.toThrow('User already exists');
  });

  it('should hash the password before saving', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.create.mockImplementation(async (data: any) => ({ id: '1', ...data }));

    await useCase.execute({ name: 'Test', email: 'test@mail.com', password: 'plaintext' });

    const savedData = mockRepo.create.mock.calls[0][0];
    expect(savedData.password).not.toBe('plaintext');
    expect(savedData.password).toMatch(/^\$2[ab]\$/);
  });
});
