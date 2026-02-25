import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class RecoverPasswordInfo {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const RecoverPasswordInfoSchema =
  SchemaFactory.createForClass(RecoverPasswordInfo);
