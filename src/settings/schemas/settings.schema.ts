import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { IsString } from 'class-validator';

@Schema({
  collection: 'settings',
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class Settings {
  @Prop({ required: true })
  @IsString()
  key: string;

  @Prop({ required: true })
  @IsString()
  group: string;

  @Prop({ required: true })
  @IsString()
  module: string;

  @Prop({ required: true })
  @IsString()
  dataType: string;

  @Prop({ required: true })
  value: mongoose.Schema.Types.Mixed;
}

export type SettingsDocument = Settings & Document;

const SettingsSchema = SchemaFactory.createForClass(Settings);

SettingsSchema.index({ key: 1, group: 1, module: 1 }, { unique: true });

SettingsSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

export { SettingsSchema };
