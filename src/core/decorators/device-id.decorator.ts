import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const DeviceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const deviceId = request.deviceId;

    if (!deviceId) {
      throw new UnauthorizedException('Device ID not found in request');
    }

    return deviceId;
  },
);
