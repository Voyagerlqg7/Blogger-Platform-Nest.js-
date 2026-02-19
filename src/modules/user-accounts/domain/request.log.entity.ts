import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class RequestLog {
  @Prop({ type: String, required: true })
  _id: string;
  @Prop({ type: String, required: true })
  ip: string;
  @Prop({ type: String, required: true })
  url: string;
  @Prop({ type: Date, required: true, default: Date.now, expires: 60 })
  date: Date;
}

export const RequestLogSchema = SchemaFactory.createForClass(RequestLog);
RequestLogSchema.loadClass(RequestLog);
export type RequestLogDocument = HydratedDocument<RequestLog>;
export type RequestLogModelType = Model<RequestLogDocument> & typeof RequestLog;
