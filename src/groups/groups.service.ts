import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupDocument } from './schemas/group.schema';
import { GroupsRepository } from './groups.repository';
import { generateUniqueCode } from '../utils/helpers';
import { Types } from 'mongoose';
import { LandmarkDto } from './dto/landmark.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { SettingsService } from '../settings/settings.service';
import { GroupUsersService } from './group.users.service';
import { I18nContext, I18nService } from 'nestjs-i18n';

// import { SettingsService } from '../settings/settings.service';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    // private readonly settingsRepository: SettingsRepository,
    private readonly settingsService: SettingsService,
    private readonly groupUsersService: GroupUsersService,
    private readonly i18nService: I18nService, // private readonly settingsService: SettingsService,
  ) {}

  async countUserGroups(userId: Types.ObjectId) {
    return this.groupsRepository.countDocuments({
      $or: [
        { groupOwner: userId },
        { groupAdmins: userId },
        { members: userId },
      ],
    });
  }

  async create(
    createGroupDto: CreateGroupDto,
    loggedInUserId: Types.ObjectId,
  ): Promise<GroupDocument> {
    // TODO V1 group pop functionality with some timer from 1 to 6 hours and we will set end date or valid till date
    // TODO V1 BACKEND need to setup supervisor which will fire hourly and disable circle
    // TODO V1 Circle disable functionality
    // TODO V1 BACKEND need to add two settings in settings hours and in settings update time mechanism with displacement covered mechanism anyone can trigger update logic
    // TODO V1 ASK APP TEAM, R&D over which type of MAP API is required to us we will discuss this after design
    const groupNameCount = await this.groupsRepository.countDocuments({
      groupOwner: loggedInUserId,
      name: createGroupDto.name,
    });
    // console.log('groupNameCount');
    // console.log(groupNameCount);
    if (groupNameCount > 0)
      throw new HttpException(
        this.i18nService.t('language.HTTP_EXCEPTION_MULTIPLE_GROUP_SAME_NAME', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
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
      throw new HttpException(
        this.i18nService.t('language.HTTP_EXCEPTION_GROUP_NOT_FOUND', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND,
      );
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
      throw new HttpException(
        this.i18nService.t(
          'language.HTTP_EXCEPTION_ONLY_GROUP_OWNER_CAN_ACCESS',
          {
            lang: I18nContext.current().lang,
          },
        ),
        HttpStatus.FORBIDDEN,
      );
    }
    if (accessOptions.isAdmin && !isAdmin && !isOwner) {
      throw new HttpException(
        this.i18nService.t(
          'language.HTTP_EXCEPTION_ONLY_GROUP_ADMINS_CAN_ACCESS',
          {
            lang: I18nContext.current().lang,
          },
        ),
        HttpStatus.FORBIDDEN,
      );
    }
    if (accessOptions.isMember && !isAdmin && !isOwner && !isMember) {
      throw new HttpException(
        this.i18nService.t(
          'language.HTTP_EXCEPTION_ONLY_GROUP_MEMBERS_CAN_ACCESS',
          {
            lang: I18nContext.current().lang,
          },
        ),
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
      // throw new HttpException(
      //   this.i18nService.t('language.HTTP_EXCEPTION_LANDMARK_ALREADY_EXISTS', {
      //     lang: I18nContext.current().lang,
      //   }),
      //   HttpStatus.CONFLICT,
      // );
      return group;
    }

    const updatedGroup = await this.groupsRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(groupId) },
      {
        $addToSet: { landmarks: landmarkDto }, // TODO V1 if we have a requirement in future that a landmark created by a member can only be updated or deleted by that same member or adminor super admin only so we have to add markedBy userId here to cater member access separation logic QUESTION ASKED Q IS : Landmark/Places can be created by group anygroupmember ? and can be deleted by any group member ? OR only that member OR owner can delete which actually creates it ?
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

  async joinGroupByCode(
    groupUniqueCode: string,
    loggedInUserId: Types.ObjectId,
  ) {
    // console.log('joinGroupByCode');
    loggedInUserId = new Types.ObjectId(loggedInUserId);
    const group = await this.groupsRepository.findOne({
      code: groupUniqueCode,
    });
    if (!group) {
      throw new HttpException(
        this.i18nService.t('language.HTTP_EXCEPTION_GROUP_NOT_FOUND', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.NOT_FOUND,
      );
    }
    // console.log(group);
    const updatedGroup = await this.groupsRepository.findOneAndUpdate(
      { _id: group._id },
      { $addToSet: { members: loggedInUserId } },
      { new: true },
    );
    await this.assignGroupWithUser(group._id, loggedInUserId);
    return updatedGroup;
  }

  async assignGroupWithUser(groupId: Types.ObjectId, userId: Types.ObjectId) {
    // console.log('assignGroupWithUser');
    // console.log(groupId);
    // console.log(userId);
    // groupId = new Types.ObjectId(groupId);
    // userId = new mongoose.Types.ObjectId(userId);
    // console.log(groupId);
    // console.log(userId);
    return await this.groupUsersService.createOrUpdate(
      {
        groupId,
        userId,
      },
      {
        groupId,
        userId,
      },
      {
        new: true,
        upsert: true,
      },
    );
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
    // TODO V1 need to implement pagination here
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
