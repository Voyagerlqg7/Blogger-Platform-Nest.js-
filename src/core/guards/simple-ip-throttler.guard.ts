import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
//TODO: change to @nestjs/throttler
@Injectable()
export class SimpleIpThrottlerGuard implements CanActivate {
  private requests = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const path = request.route?.path || request.url;
    const key = `${ip}:${path}`;

    const now = Date.now();
    const windowStart = now - 10000; // 10 секунд

    let timestamps = this.requests.get(key) || [];

    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    if (timestamps.length >= 5) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Добавляем текущий запрос
    timestamps.push(now);
    this.requests.set(key, timestamps);

    // Устанавливаем таймер для очистки через 10 секунд
    setTimeout(() => {
      const current = this.requests.get(key);
      if (current) {
        const filtered = current.filter((t) => t > Date.now() - 10000);
        if (filtered.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, filtered);
        }
      }
    }, 10000);

    return true;
  }

  private getClientIp(request: any): string {
    // Пробуем получить IP из разных мест
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.toString().split(',')[0];
    }

    return (
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }
}
