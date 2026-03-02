import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { SessionModelType } from '../domain/session.entity';
import { Session } from '../domain/session.entity';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: SessionModelType,
  ) {}

  async save(session: Session): Promise<void> {
    await this.sessionModel.insertOne(session);
  }

  async findByUserId(userId: string) {
    return await this.sessionModel.find({ userId }).lean();
  }

  async findByDeviceId(deviceId: string) {
    return await this.sessionModel.findOne({ deviceId });
  }

  async deleteDeviceById(deviceId: string) {
    await this.sessionModel.deleteOne({ deviceId });
  }

  async deleteExpired(now: Date) {
    await this.sessionModel.deleteMany({ expirationDate: { $lt: now } });
  }
}
