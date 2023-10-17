import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type GroupUsersDocument = GroupUsers & Document;

@Schema({
  collection: 'group_users',
  // timestamps: { createdAt: 'created', updatedAt: 'updated' },
  // toObject: { getters: true },
  // toJSON: { getters: true },
})
export class GroupUsers extends Document {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'Group',
    autoCreate: true,
  })
  groupId: Types.ObjectId;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'User',
    autoCreate: true,
  })
  userId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

const GroupUsersSchema = SchemaFactory.createForClass(GroupUsers);

GroupUsersSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

export { GroupUsersSchema };
