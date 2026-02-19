import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  deviceId: string;
  @Prop({ type: String, required: true })
  ip: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: Date, required: true })
  lastActiveDate: Date;
  @Prop({ type: Date, required: true })
  expirationDate: Date;
  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  makeDeleted() {
    this.deletedAt = new Date();
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);
export type SessionDocument = HydratedDocument<Session>;
export type SessionModelType = Model<SessionDocument> & typeof Session;
