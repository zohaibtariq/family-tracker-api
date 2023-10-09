import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScreenDocument = Screen & Document;

@Schema({
  collection: 'screens',
})
export class Screen extends Document {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;
}

const ScreenSchema = SchemaFactory.createForClass(Screen);
ScreenSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

export { ScreenSchema };
