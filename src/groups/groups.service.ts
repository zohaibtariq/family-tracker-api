import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupDocument } from './schemas/group.schema';
import { GroupsRepository } from './groups.repository';
import { generateUniqueCode } from '../utils/helpers';
import { Types } from 'mongoose';
import { LandmarkDto } from './dto/landmark.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { SettingsService } from '../settings/settings.service';
// import { I18nService } from 'nestjs-i18n';

// import { SettingsService } from '../settings/settings.service';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    // private readonly settingsRepository: SettingsRepository,
    private readonly settingsService: SettingsService, // private readonly i18n: I18nService, // private readonly settingsService: SettingsService,
  ) {}

  async create(
    createGroupDto: CreateGroupDto,
    loggedInUserId: Types.ObjectId,
  ): Promise<GroupDocument> {
    // TODO define how many groups can a user create in setting
    const groupNameCount = await this.groupsRepository.countDocuments({
      groupOwner: loggedInUserId,
      name: createGroupDto.name,
    });
    // console.log('groupNameCount');
    // console.log(groupNameCount);
    if (groupNameCount > 0)
      throw new HttpException(
        'You cannot create multiple group with same name.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      ); // TODO do translation of message
    const codeLength = await this.settingsService.get(
      'group_share_code_length',
      {
        module: 'group',
        group: 'group',
      },
    );
    // console.log('codeLength');
    // console.log(codeLength);
    const code = await generateUniqueCode(
      this.groupsRepository,
      'code',
      codeLength,
    );
    // console.log('CREATE GROUP');
    // console.log(createGroupDto);
    // console.log(code);
    // console.log(userId);
    return this.groupsRepository.create({
      ...createGroupDto,
      code,
      groupOwner: loggedInUserId,
      members: [loggedInUserId],
      groupAdmins: [loggedInUserId],
    });
  }

  createOrUpdate(filter = {}, update = {}, options = {}) {
    return this.groupsRepository.findOneAndUpdate(filter, update, options);
  }

  findOne(groupId: Types.ObjectId) {
    return this.groupsRepository.findById(groupId, {
      isActive: 0,
      __v: 0,
    });
  }

  async checkGroupAccess(
    loggedInUserId: Types.ObjectId,
    groupId: Types.ObjectId,
    accessOptions: any = {
      isOwner: true,
      isAdmin: true,
      isMember: true,
    },
  ) {
    groupId = new Types.ObjectId(groupId);
    loggedInUserId = new Types.ObjectId(loggedInUserId);
    const group = await this.groupsRepository.findNonPopulatedById(groupId);
    if (!group) {
      throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
    }
    const isOwner = group.groupOwner.equals(loggedInUserId);
    const isAdmin = group.groupAdmins.includes(loggedInUserId);
    const isMember = group.members.includes(loggedInUserId);
    // console.log('isOwner');
    // console.log(isOwner);
    // console.log('isAdmin');
    // console.log(isAdmin);
    // console.log('isMember');
    // console.log(isMember);
    if (accessOptions.isOwner && !isOwner) {
      // console.log('HttpException owner');
      throw new HttpException(
        'Only group owner can access!',
        HttpStatus.FORBIDDEN,
      );
    }
    if (accessOptions.isAdmin && !isAdmin && !isOwner) {
      // console.log('HttpException admin');
      throw new HttpException(
        'Only group admins can access!',
        HttpStatus.FORBIDDEN,
      );
    }
    if (accessOptions.isMember && !isAdmin && !isOwner && !isMember) {
      // console.log('HttpException members');
      throw new HttpException(
        'Only group members can access!',
        HttpStatus.FORBIDDEN,
      );
    }
    return group;
  }

  buildUserGroupAccess(loggedInUserId: Types.ObjectId, group: any) {
    // loggedInUserId = new Types.ObjectId(loggedInUserId);
    const groupOwnerId = group.groupOwner._id.toString();
    const groupAdmins = group.groupAdmins.map((obj) => obj._id.toString());
    const members = group.members.map((obj) => obj._id.toString());
    // console.log(loggedInUserId);
    // console.log(groupOwnerId);
    // console.log(groupAdmins);
    // console.log(members);
    return {
      isOwner: Boolean(groupOwnerId === loggedInUserId),
      isAdmin: Boolean(groupAdmins.includes(loggedInUserId)),
      isMember: Boolean(members.includes(loggedInUserId)),
    };
  }

  async addLandmark(
    loggedInUserId: Types.ObjectId,
    groupId: Types.ObjectId,
    landmarkDto: LandmarkDto,
    group: any,
  ) {
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
        $addToSet: { landmarks: landmarkDto }, // TODO if we have a requirement in future that a landmark created by a member can only be updated or deleted by that same member or admin or super admin only so we have to add markedBy userId here to cater member access separation logic
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
        circleRadius: 0,
        circleCenter: 0,
      },
    );
  }

  async findByPhoneNumber(phoneNumber: string): Promise<GroupDocument> {
    return this.groupsRepository.findOne({ phoneNumber });
  }

  async update(
    userId: Types.ObjectId,
    groupId: Types.ObjectId,
    updateGroupDto: UpdateGroupDto,
    options = {},
  ): Promise<GroupDocument> {
    if (updateGroupDto.name) {
      return this.groupsRepository.findByIdAndUpdate(
        groupId,
        updateGroupDto,
        options,
      );
    } else {
      return this.groupsRepository.findByIdAndUpdate(
        groupId,
        {
          $set: updateGroupDto,
        },
        options,
      );
    }
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
