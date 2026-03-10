import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String, required: true, default: null })
  confirmationCode: string | null;

  @Prop({ type: Date, required: true, default: null })
  expiresAt: Date | null;

  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: boolean | null;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
