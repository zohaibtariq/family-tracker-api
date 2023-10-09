import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { IsBoolean, IsNumber } from 'class-validator';

@Schema({
  collection: 'otps',
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class Otp {
  @Prop({ required: true })
  @IsNumber()
  expiry: number;

  @Prop({ required: true })
  @IsBoolean()
  verified: boolean;

  @Prop({ required: true })
  @IsNumber()
  otp: number;

  @Prop()
  userId: mongoose.Types.ObjectId;
}

const OtpSchema = SchemaFactory.createForClass(Otp);

export type OtpDocument = Otp & Document;

export { OtpSchema };
