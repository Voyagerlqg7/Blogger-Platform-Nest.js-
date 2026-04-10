import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { SessionModelType } from '../domain/session.entity';
import { SessionDocument } from '../domain/session.entity';
import { Session } from '../domain/session.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: SessionModelType,
  ) {}

  async save(session: Session): Promise<void> {
    await this.sessionModel.insertOne(session);
  }

  async findSessionsByUserId(userId: string): Promise<SessionDocument[]> {
    const sessions = await this.sessionModel.find({ userId }).lean();

    if (!sessions || sessions.length === 0) {
      throw DomainException.notFound('Session', 'Cannot find by userId');
    }
    return sessions as SessionDocument[];
  }

  async findByDeviceId(deviceId: string): Promise<SessionDocument> {
    const session = await this.sessionModel.findOne({ deviceId });
    if (!session) {
      throw DomainException.notFound('Session', 'Cannot find by deviceId');
    }
    return session;
  }

  async deleteDeviceById(deviceId: string) {
    await this.sessionModel.deleteOne({ deviceId });
  }

  async deleteAllDevicesExceptOne(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    const deleteResult = await this.sessionModel.deleteMany({
      userId: userId,
      deviceId: { $ne: currentDeviceId },
    });

    if (deleteResult.deletedCount === 0) {
      // если нет других сессий
      console.log(`No other sessions found for user ${userId}`);
    }
  }
}
