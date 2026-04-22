import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly appName = 'Peerly';
  private readonly logoCid = 'peerly-logo';
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly frontendUrl: string;
  private readonly smtpHost: string;
  private readonly smtpPort: number;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.getOrThrow<string>('SMTP_HOST');
    const port = Number(this.configService.getOrThrow<string>('SMTP_PORT'));
    const user = this.configService.getOrThrow<string>('APP_MAIL_EMAIL');
    const pass = this.configService.getOrThrow<string>('APP_MAIL_PASSWORD');

    this.from = this.configService.getOrThrow<string>('MAIL_FROM');
    this.frontendUrl = this.configService.getOrThrow<string>('FRONT_URL');
    this.smtpHost = host;
    this.smtpPort = port;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user,
        pass,
      },
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(
      `Verifying SMTP connection against ${this.smtpHost}:${this.smtpPort}`,
    );

    try {
      await this.transporter.verify();
      this.logger.log('SMTP authentication succeeded');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`SMTP verification failed: ${message}`);
      throw error;
    }
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const resetPasswordLink = `${this.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const text = this.buildResetPasswordText(resetPasswordLink);
    const html = this.buildResetPasswordHtml(resetPasswordLink);
    const attachments = this.buildResetPasswordAttachments();

    this.logger.log(`Sending reset password email to ${email}`);

    await this.transporter.sendMail({
      from: `${this.appName} <${this.from}>`,
      to: email,
      subject: `Reset your ${this.appName} password`,
      text,
      html,
      attachments,
    });

    this.logger.log(`Reset password email sent to ${email}`);
  }

  private buildResetPasswordText(resetPasswordLink: string): string {
    return [
      `You requested a password reset for your ${this.appName} account.`,
      '',
      `Reset your password: ${resetPasswordLink}`,
      '',
      'This link expires in 15 minutes.',
      'If you did not request this change, you can ignore this email.',
    ].join('\n');
  }

  private buildResetPasswordHtml(resetPasswordLink: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <body style="margin:0;padding:0;background-color:#f3e8ce;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#4b3b34;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#f3e8ce 0%,#ffffff 100%);padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border:1px solid #f1dccf;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(115,82,64,0.14);">
                  <tr>
                    <td style="padding:28px 36px 22px;background:linear-gradient(135deg,#de8067 0%,#8bd1ac 100%);color:#ffffff;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td valign="middle" style="width:88px;">
                            <img src="cid:${this.logoCid}" alt="${this.appName}" width="72" height="72" style="display:block;width:72px;height:72px;border:0;" />
                          </td>
                          <td valign="middle" style="padding-left:12px;">
                            <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${this.appName}</div>
                            <h1 style="margin:12px 0 0;font-size:30px;line-height:1.2;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Reset your password</h1>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 36px 18px;">
                      <p style="margin:0 0 16px;font-size:17px;line-height:1.7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">We received a request to reset the password for your ${this.appName} account.</p>
                      <p style="margin:0 0 28px;font-size:17px;line-height:1.7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Use the button below to choose a new password. For your security, this link expires in 15 minutes.</p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                        <tr>
                          <td align="center" bgcolor="#de8067" style="border-radius:999px;box-shadow:0 10px 24px rgba(222,128,103,0.32);">
                            <a href="${resetPasswordLink}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Reset password</a>
                          </td>
                        </tr>
                      </table>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background-color:#f3e8ce;border-radius:16px;">
                        <tr>
                          <td style="padding:16px 18px;">
                            <p style="margin:0 0 6px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#6f7f74;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Security note</p>
                            <p style="margin:0;font-size:14px;line-height:1.7;color:#4b3b34;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">If you did not request a password reset, you can safely ignore this email.</p>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#7b6b63;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Thanks for helping us keep your account secure.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 36px 30px;border-top:1px solid #f1dccf;font-size:12px;line-height:1.7;color:#9a8573;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                      This message was sent by ${this.appName} account security.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private buildResetPasswordAttachments(): nodemailer.SendMailOptions['attachments'] {
    const logoPath = join(process.cwd(), 'img', 'peerly-logo.png');

    if (!existsSync(logoPath)) {
      this.logger.warn(`Email logo not found at ${logoPath}`);
      return undefined;
    }

    return [
      {
        filename: 'peerly-logo.png',
        path: logoPath,
        cid: this.logoCid,
      },
    ];
  }
}
