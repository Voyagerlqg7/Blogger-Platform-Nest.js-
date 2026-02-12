import jwt from 'jsonwebtoken';
import { UserViewDto } from '../api/view-dto/users.view-dto';
import * as process from 'node:process';

export class JWTService {
  async createAccessToken(user: UserViewDto): Promise<string> {
    const asscessToken: string = await jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '300s' },
    );
    return asscessToken;
  }

  async createRefreshToken(user: UserViewDto): Promise<string> {
    const refreshToken: string = await jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '20s' },
    );
    return refreshToken;
  }
}
