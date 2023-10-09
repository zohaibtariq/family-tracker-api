import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Language, LanguageDocument } from './schemas/language.schema';
import { Model } from 'mongoose';
import { EntityRepository } from '../database/entity.repository';

@Injectable()
export class LanguagesRepository extends EntityRepository<LanguageDocument> {
  constructor(
    @InjectModel(Language.name) countryModel: Model<LanguageDocument>,
  ) {
    super(countryModel);
  }
}
