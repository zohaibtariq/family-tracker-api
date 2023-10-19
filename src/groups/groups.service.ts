import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupDocument } from './schemas/group.schema';
import { GroupsRepository } from './groups.repository';
import { generateUniqueCode } from '../utils/helpers';
import { Types } from 'mongoose';
import { LandmarkDto } from './dto/landmark.dto';
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
      groupOwner: userId,
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
    return this.groupsRepository.create({
      ...createGroupDto,
      code,
      groupOwner: userId,
      members: [userId],
    });
  }

  createOrUpdate(filter = {}, update = {}, options = {}) {
    return this.groupsRepository.findOneAndUpdate(filter, update, options);
  }

  findOne(groupId: Types.ObjectId) {
    // TODO here when getting group detail also get members/users of a group
    return this.groupsRepository.findById(groupId, {
      isActive: 0,
      __v: 0,
    });
  }

  async checkIfGroupAdmin(
    loggedInUserId: Types.ObjectId,
    groupId: Types.ObjectId,
  ) {
    // Check if the landmark already exists in the group
    const group = await this.groupsRepository.findNonPopulatedById(
      new Types.ObjectId(groupId),
    );
    if (!group) {
      throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
    }
    // Check if the user is an admin or the owner
    // TODO need to check if landmarks only allowed to be add update delete by admin or all ? current code is only allowed to admin
    loggedInUserId = new Types.ObjectId(loggedInUserId); // NOTE can work without this too
    const isUserAdmin = group.groupAdmins.includes(loggedInUserId);
    const isUserOwner = group.groupOwner.equals(loggedInUserId);

    if (!isUserAdmin && !isUserOwner) {
      throw new HttpException(
        'Land Mark can only be changed by an group admin',
        HttpStatus.FORBIDDEN,
      );
    }
    return group;
  }

  async addLandmark(
    loggedInUserId: Types.ObjectId,
    groupId: Types.ObjectId,
    landmarkDto: LandmarkDto,
  ) {
    const group = await this.checkIfGroupAdmin(loggedInUserId, groupId);
    // NOTE: remove this check if all group users are allowed to add landmark
    const existingLandmark = group.landmarks.find(
      (landmark) =>
        landmark.latitude === landmarkDto.latitude &&
        landmark.longitude === landmarkDto.longitude,
    );

    if (existingLandmark) {
      // throw new HttpException('Landmark already exists', HttpStatus.CONFLICT);
      return group;
    }

    const updatedGroup = await this.groupsRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(groupId) },
      {
        $addToSet: { landmarks: landmarkDto },
      },
      { new: true },
    );
    return updatedGroup;
  }

  async updateLandmark(
    loggedInUserId: Types.ObjectId,
    groupId: Types.ObjectId,
    landmarkId: Types.ObjectId,
    landmarkDto: LandmarkDto,
  ) {
    await this.checkIfGroupAdmin(loggedInUserId, groupId);
    const updatedGroup = await this.groupsRepository.findOneAndUpdate(
      {
        _id: new Types.ObjectId(groupId),
        'landmarks._id': new Types.ObjectId(landmarkId),
      },
      {
        $set: {
          'landmarks.$.latitude': landmarkDto.latitude,
          'landmarks.$.longitude': landmarkDto.longitude,
        },
      },
      { new: true },
    );

    return updatedGroup;
  }

  async deleteLandmark(
    loggedInUserId: Types.ObjectId,
    groupId: Types.ObjectId,
    landmarkId: Types.ObjectId,
  ) {
    await this.checkIfGroupAdmin(loggedInUserId, groupId);
    const updatedGroup = await this.groupsRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(groupId) },
      { $pull: { landmarks: { _id: new Types.ObjectId(landmarkId) } } },
      { new: true },
    );

    return updatedGroup;
  }

  // async findById(id: Types.ObjectId, projection = {}): Promise<GroupDocument> {
  //   return this.groupsRepository.findById(id, projection);
  // }

  async findAll(loggedInUserId: Types.ObjectId): Promise<GroupDocument[]> {
    // NOTE fetch loggedInUser created groups
    return await this.groupsRepository.find(
      { groupOwner: loggedInUserId, isActive: true },
      {
        isActive: 0,
        __v: 0,
        created: 0,
        updated: 0,
        radius: 0,
        zoom: 0,
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

  async findGroupsForUser(userId: Types.ObjectId): Promise<GroupDocument[]> {
    // TODO need to implement pagination here
    return await this.groupsRepository.find({
      isActive: true,
      $or: [
        { groupOwner: userId },
        { groupAdmins: userId },
        { members: userId },
      ],
    });
    // userId = new Types.ObjectId(userId);
    // const groups = await this.groupsRepository.aggregate([
    //   {
    //     $match: {
    //       $or: [{ groupOwner: userId }, { 'groupAdmins.userId': userId }],
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'group_users', // Name of the other collection
    //       localField: 'groupOwner', // Field from the 'groups' collection
    //       foreignField: 'userId', // Field from the 'group_users' collection
    //       as: 'groupUsers',
    //     },
    //   },
    // {
    //   $unwind: '$groupUsers',
    // },
    // {
    //   $match: {
    //     $or: [{ 'groupUsers.userId': userId }, { groupOwner: userId }],
    //   },
    // },
    // ]);
    //
    // return groups;
  }
}
