import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';
import { Model } from 'mongoose';
import { EntityRepository } from '../database/entity.repository';

@Injectable()
export class SettingsRepository extends EntityRepository<SettingsDocument> {
  constructor(
    @InjectModel(Settings.name) countryModel: Model<SettingsDocument>,
  ) {
    super(countryModel);
  }
}
