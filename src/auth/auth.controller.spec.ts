import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      register: jest.fn(),
      login: jest.fn(),
      requestReset: jest.fn(),
      resetPassword: jest.fn(),
    };
    controller = new AuthController(mockService);
  });

  it('should call register with correct data', async () => {
    mockService.register.mockResolvedValue({ id: '1', name: 'Test', email: 'test@mail.com' });
    const result = await controller.register({ name: 'Test', email: 'test@mail.com', password: 'pass' } as any);
    expect(mockService.register).toHaveBeenCalledWith({ name: 'Test', email: 'test@mail.com', password: 'pass' });
    expect(result).toEqual({ id: '1', name: 'Test', email: 'test@mail.com' });
  });

  it('should call login with correct data', async () => {
    mockService.login.mockResolvedValue({ token: 'jwt' });
    const result = await controller.login({ email: 'e@e.com', password: 'pass' } as any);
    expect(mockService.login).toHaveBeenCalledWith({ email: 'e@e.com', password: 'pass' });
    expect(result.token).toBe('jwt');
  });

  it('should return user from request in profile', () => {
    const req = { user: { sub: 'u1', email: 'e@e.com' } } as any;
    const result = controller.profile(req);
    expect(result).toEqual({ sub: 'u1', email: 'e@e.com' });
  });

  it('should call resetRequest', async () => {
    mockService.requestReset.mockResolvedValue(undefined);
    await controller.resetRequest({ email: 'e@e.com' } as any);
    expect(mockService.requestReset).toHaveBeenCalledWith({ email: 'e@e.com' });
  });

  it('should call resetPassword', async () => {
    mockService.resetPassword.mockResolvedValue(undefined);
    await controller.resetPassword({ token: 'tok', newPassword: 'newpass' } as any);
    expect(mockService.resetPassword).toHaveBeenCalledWith({ token: 'tok', newPassword: 'newpass' });
  });
});
