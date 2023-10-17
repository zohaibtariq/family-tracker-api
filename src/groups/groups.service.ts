import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupDocument } from './schemas/group.schema';
import { GroupsRepository } from './groups.repository';
import { generateUniqueCode } from '../utils/helpers';
import { Types } from 'mongoose';
// import { I18nService } from 'nestjs-i18n';

// import { SettingsService } from '../settings/settings.service';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository, // private readonly i18n: I18nService, // private readonly settingsService: SettingsService,
  ) {}

  async create(
    createGroupDto: CreateGroupDto,
    userId: Types.ObjectId,
  ): Promise<GroupDocument> {
    // TODO define how many groups can a user create in setting
    const groupNameCount = await this.groupsRepository.countDocuments({
      userId,
      name: createGroupDto.name,
    });
    // console.log('groupNameCount');
    // console.log(groupNameCount);
    if (groupNameCount > 0)
      throw new HttpException(
        'You cannot create multiple group with same name.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      ); // TODO do translation of message
    const code = await generateUniqueCode(this.groupsRepository, 'code', 6); // TODO set this length from admin settings
    // console.log('CREATE GROUP');
    // console.log(createGroupDto);
    // console.log(code);
    // console.log(userId);
    // TODO once a group is created its own user will be auto linked with group_users
    return this.groupsRepository.create({ ...createGroupDto, code, userId });
  }

  createOrUpdate(filter = {}, update = {}, options = {}) {
    return this.groupsRepository.findOneAndUpdate(filter, update, options);
  }

  findOne(id: Types.ObjectId) {
    // TODO here when getting group detail also get members/users of a group
    return this.groupsRepository.findById(id, {
      isActive: 0,
      __v: 0,
      userId: 0,
    });
  }

  // async findById(id: Types.ObjectId, projection = {}): Promise<GroupDocument> {
  //   return this.groupsRepository.findById(id, projection);
  // }

  findAll(id: Types.ObjectId): Promise<GroupDocument[]> {
    return this.groupsRepository.find(
      { userId: id, isActive: true },
      {
        isActive: 0,
        __v: 0,
        created: 0,
        updated: 0,
        radius: 0,
        zoom: 0,
        userId: 0,
      },
    );
  }

  async findByPhoneNumber(phoneNumber: string): Promise<GroupDocument> {
    return this.groupsRepository.findOne({ phoneNumber });
  }

  async update(
    id: Types.ObjectId,
    updateGroupDto: object,
    options = {},
  ): Promise<GroupDocument> {
    return this.groupsRepository.findByIdAndUpdate(id, updateGroupDto, options);
  }

  // async delete(id: Types.ObjectId): Promise<GroupDocument> {
  //   return this.groupsRepository.findByIdAndDelete(id);
  // }

  // createOrUpdate(filter = {}, update = {}, options = {}) {
  //   return this.groupsRepository.findOneAndUpdate(filter, update, options);
  // }

  async remove(id: Types.ObjectId) {
    return this.groupsRepository.findByIdAndRemove(id);
  }
}
