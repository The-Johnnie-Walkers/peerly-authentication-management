import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockRegister: any;
  let mockLogin: any;
  let mockRequestReset: any;
  let mockResetPassword: any;

  beforeEach(() => {
    mockRegister = { execute: jest.fn() };
    mockLogin = { execute: jest.fn() };
    mockRequestReset = { execute: jest.fn() };
    mockResetPassword = { execute: jest.fn() };
    service = new AuthService(mockRegister, mockLogin, mockRequestReset, mockResetPassword);
  });

  describe('register', () => {
    it('should return user on success', async () => {
      mockRegister.execute.mockResolvedValue({ id: '1', name: 'Test', email: 'test@mail.com' });
      const result = await service.register({ name: 'Test', email: 'test@mail.com', password: 'pass' });
      expect(result.email).toBe('test@mail.com');
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockRegister.execute.mockRejectedValue(new Error('User already exists'));
      await expect(service.register({ name: 'T', email: 'e@e.com', password: 'p' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should rethrow unknown errors', async () => {
      mockRegister.execute.mockRejectedValue(new Error('DB error'));
      await expect(service.register({ name: 'T', email: 'e@e.com', password: 'p' }))
        .rejects.toThrow('DB error');
    });
  });

  describe('login', () => {
    it('should return token on success', async () => {
      mockLogin.execute.mockResolvedValue({ id: '1', token: 'jwt' });
      const result = await service.login({ email: 'e@e.com', password: 'p' });
      expect(result.token).toBe('jwt');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockLogin.execute.mockRejectedValue(new Error('Invalid credentials'));
      await expect(service.login({ email: 'e@e.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestReset', () => {
    it('should call use case', async () => {
      mockRequestReset.execute.mockResolvedValue(undefined);
      await service.requestReset({ email: 'e@e.com' });
      expect(mockRequestReset.execute).toHaveBeenCalledWith({ email: 'e@e.com' });
    });

    it('should throw BadRequestException on error', async () => {
      mockRequestReset.execute.mockRejectedValue(new Error('not found'));
      await expect(service.requestReset({ email: 'e@e.com' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should call use case', async () => {
      mockResetPassword.execute.mockResolvedValue(undefined);
      await service.resetPassword({ token: 'tok', newPassword: 'newpass' });
      expect(mockResetPassword.execute).toHaveBeenCalled();
    });

    it('should throw BadRequestException on error', async () => {
      mockResetPassword.execute.mockRejectedValue(new Error('expired'));
      await expect(service.resetPassword({ token: 'tok', newPassword: 'p' }))
        .rejects.toThrow(BadRequestException);
    });
  });
});
