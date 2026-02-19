import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  async generatePasswordSalt() {
    return await bcrypt.genSalt(10);
  }
  async comparePassword(password: string, passwordHash: string) {
    return await bcrypt.compare(password, passwordHash);
  }
  async generateHash(password: string) {
    return await bcrypt.hash(password, process.env.JWT_SECRET);
  }
}
