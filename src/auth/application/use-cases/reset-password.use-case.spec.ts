import { ResetPasswordUseCase } from './reset-password.use-case';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByResetToken: jest.fn(),
      update: jest.fn(),
    };
    useCase = new ResetPasswordUseCase(mockRepo);
  });

  it('should reset password with valid token', async () => {
    mockRepo.findByResetToken.mockResolvedValue({
      id: 'u1',
      resetToken: 'valid-token',
      resetTokenExpiry: new Date(Date.now() + 60000),
    });

    await useCase.execute({ token: 'valid-token', newPassword: 'newpass123' });

    const updateCall = mockRepo.update.mock.calls[0][1];
    expect(updateCall.password).toMatch(/^\$2[ab]\$/);
    expect(updateCall.resetToken).toBeUndefined();
    expect(updateCall.resetTokenExpiry).toBeUndefined();
  });

  it('should throw if token not found', async () => {
    mockRepo.findByResetToken.mockResolvedValue(null);

    await expect(
      useCase.execute({ token: 'bad-token', newPassword: 'pass' }),
    ).rejects.toThrow('Invalid or expired reset token');
  });

  it('should throw if token is expired', async () => {
    mockRepo.findByResetToken.mockResolvedValue({
      id: 'u1',
      resetToken: 'expired-token',
      resetTokenExpiry: new Date(Date.now() - 1000), // expired
    });

    await expect(
      useCase.execute({ token: 'expired-token', newPassword: 'pass' }),
    ).rejects.toThrow('The reset token expired');

    // Should clear the expired token
    expect(mockRepo.update).toHaveBeenCalledWith('u1', {
      resetToken: undefined,
      resetTokenExpiry: undefined,
    });
  });

  it('should throw if resetTokenExpiry is missing', async () => {
    mockRepo.findByResetToken.mockResolvedValue({
      id: 'u1',
      resetToken: 'token',
      resetTokenExpiry: null,
    });

    await expect(
      useCase.execute({ token: 'token', newPassword: 'pass' }),
    ).rejects.toThrow('The reset token expired');
  });
});
