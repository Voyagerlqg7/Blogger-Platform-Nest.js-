import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class Name {
  @Prop({ required: true })
  firstName: string;

  @Prop({ type: String, required: false, default: null })
  lastName: string;
}

export const NameMongoSchema = SchemaFactory.createForClass(Name);
