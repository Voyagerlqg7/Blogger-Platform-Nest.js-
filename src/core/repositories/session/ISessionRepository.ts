import { Session } from '../../entities/user layer/session/session.entity';

export interface ISessionRepository {
  save(session: Session): Promise<Session>;

  findSessionByUserId(userId: string): Promise<Session[]>;

  findByDeviceId(deviceId: string): Promise<Session>;

  deleteByDeviceId(deviceId: string): Promise<void>;

  deleteAllDevicesExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void>;
}
