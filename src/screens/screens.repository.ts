import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Screen, ScreenDocument } from './schemas/screen.schema';
import { Model } from 'mongoose';
import { EntityRepository } from '../database/entity.repository';

@Injectable()
export class ScreensRepository extends EntityRepository<ScreenDocument> {
  constructor(@InjectModel(Screen.name) countryModel: Model<ScreenDocument>) {
    super(countryModel);
  }
}
