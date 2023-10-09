import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { Model } from 'mongoose';
import { EntityRepository } from '../database/entity.repository';

@Injectable()
export class OtpRepository extends EntityRepository<OtpDocument> {
  constructor(@InjectModel(Otp.name) otpModel: Model<OtpDocument>) {
    super(otpModel);
  }
}
