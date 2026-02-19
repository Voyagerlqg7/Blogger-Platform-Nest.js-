import { UserViewDto } from '../api/view-dto/users.view-dto';

declare global {
  namespace Express {
    interface Request {
      user: UserViewDto | null;
      refreshToken?: string;
      deviceId?: string;
    }
  }
}
export {};
