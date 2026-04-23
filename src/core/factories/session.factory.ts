import { Session as SessionDomain } from '../entities/user layer/session/session.entity';
import { randomUUID } from 'crypto';

export class SessionFactory {
  static createSession(params: {
    userId: string;
    deviceId: string;
    ip: string;
    title: string;
    lasActiveDate: Date;
    sessionExpiresAt: Date;
  }): SessionDomain {
    return new SessionDomain(
      randomUUID(),
      params.userId,
      params.deviceId,
      params.ip,
      params.title,
      params.lasActiveDate,
      params.sessionExpiresAt,
    );
  }
}
