import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CountryDocument = Country & Document;

@Schema({
  collection: 'countries',
})
export class Country extends Document {
  @Prop({ required: true, unique: true, dropDupes: true })
  name: string;

  @Prop({ required: true, unique: true, dropDupes: true })
  iso: string;

  @Prop({ required: true, unique: true, dropDupes: true })
  code: string;

  @Prop({ required: true })
  numberLength: number;

  @Prop({ required: true })
  timeZone: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  flag: string;

  @Prop({ required: true })
  isActive: boolean;
}

const CountrySchema = SchemaFactory.createForClass(Country);
CountrySchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};
export { CountrySchema };
