import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({
  collection: 'groups',
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
  toObject: { getters: true },
  toJSON: { getters: true },
})
export class Group extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, dropDupes: true })
  code: string;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  zoom: number;

  @Prop({ default: 0 })
  radius: number;

  @Prop({ default: '' })
  deepLink: string;

  @Prop({ default: '' })
  shareUrl: string;

  @Prop({ default: true })
  isActive: boolean;
}

const GroupSchema = SchemaFactory.createForClass(Group);

GroupSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

export { GroupSchema };
