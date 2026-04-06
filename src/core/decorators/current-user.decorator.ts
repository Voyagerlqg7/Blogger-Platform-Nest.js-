import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserViewDto } from '../../modules/user-accounts/api/view-dto/users.view-dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserViewDto | null => {
    const request = ctx.switchToHttp().getRequest();
    // OptionalJwtAuthGuard возвращает null если пользователь не аутентифицирован
    // JwtAuthGuard всегда возвращает пользователя
    return request.user || null;
  },
);
