import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LanguageDirection } from '../enums/language-directions';

export type LanguageDocument = Language & Document;

@Schema({
  collection: 'languages',
})
export class Language extends Document {
  @Prop({ required: true, unique: true })
  code: string; // Language code (e.g., "en" for English, "ar" for Arabic)

  @Prop({ required: true, enum: LanguageDirection })
  direction: LanguageDirection; // Language direction (RTL or LTR)

  @Prop({ required: true })
  name: string; // Language name (e.g., "English", "العربية")

  @Prop({ default: true })
  isActive: boolean;
}

const LanguageSchema = SchemaFactory.createForClass(Language);
LanguageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

export { LanguageSchema };
