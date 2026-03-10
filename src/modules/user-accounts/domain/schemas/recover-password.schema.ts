import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class RecoverPasswordInfo {
  @Prop({ type: String, required: true, default: null })
  code: string | null;

  @Prop({ type: Date, required: true, default: null })
  expiresAt: Date | null;
}

export const RecoverPasswordInfoSchema =
  SchemaFactory.createForClass(RecoverPasswordInfo);
