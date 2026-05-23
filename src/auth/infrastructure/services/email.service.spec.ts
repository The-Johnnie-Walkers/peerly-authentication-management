import { EmailService } from './email.service';

// Mock nodemailer before importing EmailService
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

// Mock fs
jest.mock('node:fs', () => ({ existsSync: jest.fn().mockReturnValue(false) }));

const mockConfig = {
  getOrThrow: jest.fn((key: string) => {
    const values: Record<string, string> = {
      SMTP_HOST: 'smtp.test.com',
      SMTP_PORT: '587',
      APP_MAIL_EMAIL: 'test@mail.com',
      APP_MAIL_PASSWORD: 'pass',
      MAIL_FROM: 'noreply@peerly.com',
      FRONT_URL: 'http://localhost:8080',
    };
    return values[key] ?? '';
  }),
  get: jest.fn().mockReturnValue('false'),
};

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    service = new EmailService(mockConfig as any);
  });

  it('should initialize without errors', () => {
    expect(service).toBeDefined();
  });

  it('should verify SMTP on module init', async () => {
    await expect(service.onModuleInit()).resolves.not.toThrow();
  });

  it('should send reset password email', async () => {
    await expect(
      service.sendResetPasswordEmail('user@mail.com', 'reset-token-123'),
    ).resolves.not.toThrow();
  });

  it('should throw if SMTP verify fails on init', async () => {
    const nodemailer = require('nodemailer');
    nodemailer.createTransport.mockReturnValueOnce({
      verify: jest.fn().mockRejectedValue(new Error('SMTP error')),
      sendMail: jest.fn(),
    });
    const failService = new EmailService(mockConfig as any);
    await expect(failService.onModuleInit()).rejects.toThrow('SMTP error');
  });
});
