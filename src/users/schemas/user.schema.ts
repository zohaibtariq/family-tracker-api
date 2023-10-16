import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enums/user.enum';
import { UserStatus } from '../enums/users.status.enum';
import * as process from 'process';

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
  toObject: { getters: true },
  toJSON: { getters: true },
})
export class User {
  @Prop({ required: true, unique: true, dropDupes: true })
  phoneNumber: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ default: '' })
  emergencyNumber: string;

  @Prop({ default: '' })
  firstName: string;

  @Prop({ default: '' })
  lastName: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop()
  refreshToken: string;

  @Prop({ default: 'user' })
  role: UserRole;

  @Prop({ default: UserStatus.UNVERIFIED })
  status: UserStatus;
}

const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

UserSchema.path('avatar').get(function (value) {
  if (!value)
    return `${process.env.NODE_APP_URL}:${process.env.NODE_APP_PORT}/public/images/defaults/avatar.png`;
  else
    return `${process.env.NODE_APP_URL}:${process.env.NODE_APP_PORT}/public/avatars/${this.id}/avatar/${value}`;
});

export { UserSchema };
