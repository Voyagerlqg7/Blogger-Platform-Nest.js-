import { UserViewDto } from '../../modules/user-accounts/api/view-dto/users.view-dto';

declare global {
  namespace Express {
    interface Request {
      user: UserViewDto;
      refreshToken?: string;
      deviceId?: string;
    }
  }
}

export {};
