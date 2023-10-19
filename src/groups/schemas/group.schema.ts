import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

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

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
  groupOwner: Types.ObjectId; //createdBy

  @Prop({
    required: true,
    type: Object,
    latitude: Number,
    longitude: Number,
  })
  circleCenter: {
    latitude: number;
    longitude: number;
  };

  @Prop({ default: 0 })
  circleRadius: number;

  @Prop({ default: '' })
  deepLink: string;

  @Prop({ default: '' })
  shareUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'User' }] })
  groupAdmins: Types.ObjectId[];

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'User' }] })
  members: Types.ObjectId[];

  @Prop({
    type: [
      {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    ],
    default: [],
  })
  landmarks: { latitude: number; longitude: number }[];
}

const GroupSchema = SchemaFactory.createForClass(Group);

GroupSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

export { GroupSchema };
