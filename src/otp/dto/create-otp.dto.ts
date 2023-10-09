import { IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class CreateOtpDto {
  @IsOptional()
  userId?: mongoose.Types.ObjectId;
}
