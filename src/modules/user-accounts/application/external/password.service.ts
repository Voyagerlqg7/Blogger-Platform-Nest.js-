import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  generatePasswordSalt(): Promise<string> {
    return bcrypt.genSalt(10);
  }

  comparePassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  generateHash(password: string, passwordSalt: string): Promise<string> {
    return bcrypt.hash(password, passwordSalt);
  }
}