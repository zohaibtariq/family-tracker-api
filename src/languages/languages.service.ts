import { Injectable } from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { Types } from 'mongoose';
import { LanguageDocument } from './schemas/language.schema';
import { LanguagesRepository } from './languages.repository';

@Injectable()
export class LanguagesService {
  constructor(private readonly languagesRepository: LanguagesRepository) {}

  async create(
    createLanguageDto: CreateLanguageDto,
  ): Promise<LanguageDocument> {
    return await this.languagesRepository.create(createLanguageDto);
  }

  async findAll(): Promise<LanguageDocument[]> {
    return await this.languagesRepository.find(
      { isActive: true },
      { isActive: 0, __v: 0 },
    );
  }

  findOne(id: Types.ObjectId) {
    return this.languagesRepository.findById(id, { __v: 0 });
  }

  async update(
    id: Types.ObjectId,
    updateLanguageDto: UpdateLanguageDto,
    options = {},
  ): Promise<LanguageDocument> {
    return this.languagesRepository.findByIdAndUpdate(
      id,
      updateLanguageDto,
      options,
    );
  }

  async remove(id: Types.ObjectId) {
    return this.languagesRepository.findByIdAndRemove(id);
  }
}
