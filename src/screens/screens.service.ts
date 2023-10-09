import { Injectable } from '@nestjs/common';
import { CreateScreenDto } from './dto/create-screen.dto';
import { UpdateScreenDto } from './dto/update-screen.dto';
import { Types } from 'mongoose';
import { ScreenDocument } from './schemas/screen.schema';
import { ScreensRepository } from './screens.repository';

@Injectable()
export class ScreensService {
  constructor(private readonly screensRepository: ScreensRepository) {}

  async create(createScreenDto: CreateScreenDto): Promise<ScreenDocument> {
    return await this.screensRepository.create(createScreenDto);
  }

  async findAll(): Promise<ScreenDocument[]> {
    return await this.screensRepository.find(
      { isActive: true },
      { isActive: 0, __v: 0 },
    );
  }

  findOne(id: Types.ObjectId) {
    return this.screensRepository.findById(id, { __v: 0 });
  }

  async update(
    id: Types.ObjectId,
    updateScreenDto: UpdateScreenDto,
    options = {},
  ): Promise<ScreenDocument> {
    return this.screensRepository.findByIdAndUpdate(
      id,
      updateScreenDto,
      options,
    );
  }

  async remove(id: Types.ObjectId) {
    return this.screensRepository.findByIdAndRemove(id);
  }
}
