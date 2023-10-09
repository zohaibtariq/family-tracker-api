import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from './schemas/country.schema';
import { Model } from 'mongoose';
import { EntityRepository } from '../database/entity.repository';

@Injectable()
export class CountriesRepository extends EntityRepository<CountryDocument> {
  constructor(@InjectModel(Country.name) countryModel: Model<CountryDocument>) {
    super(countryModel);
  }
}
