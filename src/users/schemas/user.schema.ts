import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enums/user.enum';
import { UserStatus } from '../enums/users.status.enum';

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class User {
  @Prop({ required: true, unique: true, dropDupes: true })
  phoneNumber: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop()
  emergencyNumber: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
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

export { UserSchema };
