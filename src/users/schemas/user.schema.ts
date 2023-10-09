import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enums/user.enum';

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class User {
  @Prop({ required: true, unique: true, dropDupes: true })
  phoneNumber: string;

  @Prop()
  refreshToken: string;

  @Prop({ default: 'user' })
  role: UserRole;
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
