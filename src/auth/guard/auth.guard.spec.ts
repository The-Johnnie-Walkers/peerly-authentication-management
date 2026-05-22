import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockJwt: any;

  const mockContext = (authHeader?: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: authHeader },
      }),
    }),
  });

  beforeEach(() => {
    mockJwt = { verifyAsync: jest.fn() };
    guard = new AuthGuard(mockJwt);
  });

  it('should allow request with valid token', async () => {
    mockJwt.verifyAsync.mockResolvedValue({ sub: 'u1', email: 'e@e.com' });
    const ctx = mockContext('Bearer valid-token') as any;
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when no token', async () => {
    const ctx = mockContext(undefined) as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    mockJwt.verifyAsync.mockRejectedValue(new Error('invalid'));
    const ctx = mockContext('Bearer bad-token') as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw when authorization header has wrong format', async () => {
    const ctx = mockContext('Basic sometoken') as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
