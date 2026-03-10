import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('GMAIL'),
        pass: this.configService.get('GMAIL_PASSWORD'),
      },
    });
  }

  private async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('GMAIL'),
        to,
        subject,
        html,
      });
      return true;
    } catch (err) {
      console.error('Email sending error:', err);
      return false;
    }
  }

  async sendMassage(email: string, code: string) {
    const html = `<h1>Thanks for your registration</h1>
                  <p>To finish registration please follow the link below:
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
                  </p>`;
    return this.send(email, 'Verification Code Confirmation', html);
  }

  async sendPasswordReset(email: string, code: string) {
    const html = `<h1>Password recovery</h1>
                  <p>To finish password recovery please follow the link below:
                  <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
                  </p>`;
    return this.send(email, 'Password recovery code', html);
  }
}
