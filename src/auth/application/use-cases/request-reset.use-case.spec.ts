import { RequestResetUseCase } from './request-reset.use-case';

describe('RequestResetUseCase', () => {
  let useCase: RequestResetUseCase;
  let mockRepo: any;
  let mockEmail: any;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      update: jest.fn(),
    };
    mockEmail = {
      sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new RequestResetUseCase(mockRepo, mockEmail);
  });

  it('should send reset email when user exists', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'test@mail.com' });

    await useCase.execute({ email: 'test@mail.com' });

    expect(mockRepo.update).toHaveBeenCalledTimes(1);
    expect(mockEmail.sendResetPasswordEmail).toHaveBeenCalledWith('test@mail.com', expect.any(String));
  });

  it('should throw if user not found', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'noexist@mail.com' })).rejects.toThrow(
      'User with email noexist@mail.com was not found',
    );
  });

  it('should rollback token if email sending fails', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'test@mail.com' });
    mockEmail.sendResetPasswordEmail.mockRejectedValue(new Error('SMTP error'));

    await expect(useCase.execute({ email: 'test@mail.com' })).rejects.toThrow(
      'Could not send reset password email',
    );
    // update called twice: once to set token, once to clear it
    expect(mockRepo.update).toHaveBeenCalledTimes(2);
  });
});
