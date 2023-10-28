import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { FamilyRoles } from '../enums/family-roles';
import * as process from 'process';

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

  @Prop({ required: true, enum: FamilyRoles })
  groupOwnerFamilyRole: FamilyRoles;

  @Prop({
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

  @Prop({ type: Date, default: Date.now })
  circleUpdatedAt: Date;

  @Prop({ type: Date, default: Date.now })
  circleValidTill: Date;

  @Prop({ default: 0 })
  circleValidTillHours: number;

  @Prop({ default: '' })
  deepLink: string;

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

  @Prop({ required: true })
  shareUrl: string;
}

const GroupSchema = SchemaFactory.createForClass(Group);

GroupSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

GroupSchema.path('shareUrl').get(function (value) {
  return `${process.env.NODE_APP_URL}:${process.env.NODE_APP_PORT}/groups/share-${value}`;
});

export { GroupSchema };
