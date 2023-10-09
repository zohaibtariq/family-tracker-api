import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Types } from 'mongoose';
import { CountryDocument } from './schemas/country.schema';
import { CountriesRepository } from './countries.repository';

@Injectable()
export class CountriesService {
  constructor(private readonly countriesRepository: CountriesRepository) {}

  async create(createCountryDto: CreateCountryDto): Promise<CountryDocument> {
    return this.countriesRepository.create(createCountryDto);
  }

  findAll(): Promise<CountryDocument[]> {
    return this.countriesRepository.find(
      { isActive: true },
      { currency: 0, isActive: 0, timeZone: 0, __v: 0 },
    );
  }

  findOne(id: Types.ObjectId) {
    return this.countriesRepository.findById(id, { __v: 0 });
  }

  async update(
    id: Types.ObjectId,
    updateCountryDto: UpdateCountryDto,
    options = {},
  ): Promise<CountryDocument> {
    return this.countriesRepository.findByIdAndUpdate(
      id,
      updateCountryDto,
      options,
    );
  }

  async remove(id: Types.ObjectId) {
    return this.countriesRepository.findByIdAndRemove(id);
  }
}
