import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateSessionDto } from '../../dto/auth_dto/create-session.dto';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, unique: true })
  deviceId: string;

  @Prop({ type: String, default: null })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: Date, required: true })
  sessionExpiresAt: Date;

  static createInstance(
    this: SessionModelType,
    dto: CreateSessionDto,
    ttlMs: number,
  ): SessionDocument {
    const now = new Date();

    return new this({
      ...dto,
      lastActiveDate: now,
      sessionExpiresAt: new Date(now.getTime() + ttlMs),
    });
  }

  updateActivityForDevice(ttlMs: number): void {
    const now = new Date();
    this.lastActiveDate = new Date();
    this.lastActiveDate = now;
    this.sessionExpiresAt = new Date(now.getTime() + ttlMs);
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// TTL index  — Mongo will delete expires sessions by it self
SessionSchema.index({ sessionExpiresAt: 1 }, { expireAfterSeconds: 0 });

SessionSchema.loadClass(Session);

export type SessionDocument = HydratedDocument<Session>;

export type SessionModelType = Model<Session> & {
  createInstance(dto: CreateSessionDto, ttlMs: number): SessionDocument;
};
