import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserViewDto } from '../../modules/user-accounts/api/view-dto/users.view-dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserViewDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
