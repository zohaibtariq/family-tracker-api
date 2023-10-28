import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as process from 'process';

export type UrlDocument = Url & Document;

@Schema({
  collection: 'urls',
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class Url extends Document {
  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true, unique: true, dropDupes: true })
  shortUrl: string;
}

const UrlSchema = SchemaFactory.createForClass(Url);

UrlSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

UrlSchema.path('originalUrl').get(function (value) {
  return `${process.env.NODE_APP_URL}:${process.env.NODE_APP_PORT}/${value}`;
});

export { UrlSchema };
