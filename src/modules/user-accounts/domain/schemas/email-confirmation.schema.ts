import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String, default: null })
  confirmationCode: string | null;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  @Prop({ type: Boolean, default: false })
  isConfirmed: boolean | null;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
