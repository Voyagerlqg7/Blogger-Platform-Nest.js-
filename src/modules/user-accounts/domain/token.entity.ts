import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Token {
  @Prop({ type: String, unique: true, required: true })
  token: string;
  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
TokenSchema.loadClass(Token);
export type TokenDocument = HydratedDocument<Token>;
export type TokenModelType = Model<TokenDocument> & typeof Token;
