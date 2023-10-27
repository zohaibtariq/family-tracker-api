import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AccessTokenGuard } from '../otp/guards/accessToken.guard';
import { ValidUserGuard } from '../otp/guards/valid.user.guard';
import { RequestUserInterface } from '../users/interfaces/request-user-interface';
import { ResponseService } from '../response/response.service';
import { Response } from 'express';
import { Types } from 'mongoose';
import { GroupUsersService } from './group.users.service';
import { LandmarkDto } from './dto/landmark.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupAccessGuard } from './guards/group.access.guard';
import { GroupAccess } from './decoraters/group.access.decorator';
import { SettingsService } from '../settings/settings.service';
import { JoinGroupCodeDto } from './dto/join-group-code.dto';
import { replacePlaceholders } from '../utils/helpers';
import { RedisService } from '../redis.service';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { addHours } from 'date-fns';

@UseGuards(AccessTokenGuard, ValidUserGuard)
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly groupUsersService: GroupUsersService,
    private readonly settingsService: SettingsService,
    private readonly responseService: ResponseService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  async create(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    const userGroupCount = await this.groupsService.countUserGroups(
      req.user.id,
    );
    const userGroupCreationLimit: any = await this.settingsService.get(
      'group_creation_limit_of_user',
      {
        module: 'group',
        group: 'group',
      },
    );
    if (userGroupCount >= userGroupCreationLimit)
      throw new HttpException(
        replacePlaceholders(
          req.i18nService.t('language.HTTP_EXCEPTION_USER_GROUP_COUNT_LIMIT', {
            lang: req.i18nLang,
          }),
          {
            GROUP_USERS_COUNT: userGroupCount,
            GROUP_CREATION_LIMIT_OF_USER: userGroupCreationLimit,
          },
        ),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    // console.log('userGroupCreationLimit');
    // console.log(userGroupCreationLimit);
    // console.log('userGroupCount');
    // console.log(userGroupCount);
    const newGroup = await this.groupsService.create(
      createGroupDto,
      req.user.id,
    );
    // console.log(newGroup);
    const { id, code } = newGroup;
    await this.groupsService.assignGroupWithUser(id, req.user.id);
    return this.responseService.response(res, { code }, '', HttpStatus.CREATED);
  }

  @Post('join')
  async joinGroupByCode(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Body() joinGroupCodeDto: JoinGroupCodeDto,
  ) {
    const joinedGroup = await this.groupsService.joinGroupByCode(
      joinGroupCodeDto.code,
      req.user.id,
    );
    return this.responseService.response(
      res,
      joinedGroup,
      '',
      HttpStatus.CREATED,
    );
  }

  @Get()
  async findAll(@Req() req: RequestUserInterface, @Res() res: Response) {
    // TODO V2 need to show count of users joined in a group
    return this.responseService.response(
      res,
      await this.groupsService.findGroupsForUser(req.user.id), // TODO V1 IF REQUIRED - might need transformer just to show members count, it can be done via length of members
      '',
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Param('id') groupId: Types.ObjectId,
  ) {
    // console.log('GET id');
    // console.log(id);
    const group = await this.groupsService.findOne(groupId); // TODO V1 IF REQUIRED - write transformation logic here like with members highlight owner and admin with users members
    return this.responseService.response(
      res,
      {
        group,
        userGroupAccess: this.groupsService.buildUserGroupAccess(
          req.user.id,
          group,
        ),
        requiredGroupAccess: await this.settingsService.findByGroup(
          'group',
          'group_access',
        ),
      },
      '',
    );
  }

  @Post(':groupId/landmark')
  @UseGuards(GroupAccessGuard)
  @GroupAccess('group_add_landmark')
  async addLandmark(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Param('groupId') groupId: Types.ObjectId,
    @Body() landmarkDto: LandmarkDto,
  ) {
    // TODO V1 landmark add label, any group member can add place including all admins owner while only owner admins and member (that created that place) can be able to edit delete that created place, need some limit per group of places
    // console.log(groupId);
    // console.log(landmarkDto);
    return this.responseService.response(
      res,
      await this.groupsService.addLandmark(
        req.user.id,
        groupId,
        landmarkDto,
        req.group,
      ),
      '',
    );
  }

  // @Patch(':groupId/circle')
  // @UseGuards(GroupAccessGuard)
  // @GroupAccess('group_circle_create_update')
  // async updateCircle(
  //   @Req() req: RequestUserInterface,
  //   @Param('groupId') groupId: Types.ObjectId,
  //   @Body() updateGroupDto: UpdateGroupDto,
  // ) {
  //   return this.groupsService.update(req.user.id, groupId, updateGroupDto, {
  //     new: true,
  //   });
  // }

  @Patch(':groupId/circle')
  @UseGuards(GroupAccessGuard)
  @GroupAccess('group_circle_create_update')
  async updateCircle(
    @Req() req: RequestUserInterface,
    @Param('groupId') groupId: Types.ObjectId,
    @Body() updateCircleDto: UpdateCircleDto,
  ) {
    updateCircleDto.circleUpdatedAt = new Date();
    updateCircleDto.circleValidTill = addHours(
      new Date(),
      updateCircleDto.circleValidTillHours,
    );
    // console.log('updateCircleDto');
    // console.log(updateCircleDto);
    // console.log('circleValidTill');
    // console.log(updateCircleDto.circleValidTill);
    return this.groupsService.updateCircle(
      req.user.id,
      groupId,
      updateCircleDto,
      {
        new: true,
      },
    );
  }

  // REMOVED only join by code is allowed > here a user want to join the group we can do it by two ways 1) join/groupId 2) groupId/userId for now for ease of use we are doing 2 but
  //  latter the group joining logic will be updated via share URL so it's just for dev testing to test the flow
  // @Post(':groupId/:userId')
  // async joinGroup(
  //   @Req() req: RequestUserInterface,
  //   @Res() res: Response,
  //   @Param('groupId') groupId: Types.ObjectId,
  //   @Param('userId') userId: Types.ObjectId,
  // ) {
  //   // console.log(groupId);
  //   // console.log(userId);
  //   groupId = new Types.ObjectId(groupId);
  //   userId = new Types.ObjectId(userId);
  //   // console.log(groupId);
  //   // console.log(userId);
  //   await this.groupsService.createOrUpdate(
  //     { _id: groupId },
  //     { $addToSet: { members: userId } },
  //     { new: true, upsert: true },
  //   );
  //   const joined = await this.groupsService.assignGroupWithUser(
  //     groupId,
  //     userId,
  //   );
  //   return this.responseService.response(res, joined, '', HttpStatus.CREATED);
  // }

  @Patch(':groupId/landmark/:landMarkId')
  @UseGuards(GroupAccessGuard)
  @GroupAccess('group_update_landmark')
  async updateLandmark(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Param('groupId') groupId: Types.ObjectId,
    @Param('landMarkId') landMarkId: Types.ObjectId,
    @Body() landmarkDto: LandmarkDto,
  ) {
    return this.responseService.response(
      res,
      await this.groupsService.updateLandmark(
        req.user.id,
        groupId,
        landMarkId,
        landmarkDto,
      ),
      '',
    );
  }

  @Delete(':groupId/landmark/:landMarkId')
  @UseGuards(GroupAccessGuard)
  @GroupAccess('group_delete_landmark')
  async deleteLandmark(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Param('groupId') groupId: Types.ObjectId,
    @Param('landMarkId') landMarkId: Types.ObjectId,
  ) {
    return this.responseService.response(
      res,
      await this.groupsService.deleteLandmark(req.user.id, groupId, landMarkId),
      '',
    );
  }

  @Patch(':groupId')
  @UseGuards(GroupAccessGuard)
  @GroupAccess('group_name_update')
  async update(
    @Req() req: RequestUserInterface,
    @Param('groupId') groupId: Types.ObjectId,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(req.user.id, groupId, updateGroupDto, {
      new: true,
    });
  }

  @Delete(':groupId')
  @UseGuards(GroupAccessGuard)
  @GroupAccess('group_delete')
  async remove(
    @Req() req: RequestUserInterface,
    @Param('groupId') groupId: Types.ObjectId,
  ) {
    return this.groupsService.remove(groupId);
  }

  @Post('redis/cache/clear')
  async redisCacheClear(@Req() req, @Res() res: Response) {
    await this.redisService.clearCacheKeysWithPrefix('CACHE_GROUPS');
    return this.responseService.response(
      res,
      {},
      'All redis keys are cleared of groups.',
    );
  }

  // TODO V1 add an endpoint which will check if user current lat long is outside the given circle boundary of a given group's circle or only userid with current lat long must be hit with some defined displacement which will be get from setting and api must check in how many group as owner admin or member this user is attached and if outside boundary will push notification to owner and the user who is outside the defined boundary

  // TODO V2 mark group member an admin functionality and remove admin

  // TODO V2 ASK what special feature does group owner, admin or member has ?

  // TODO V1 ASK APP TEAM code auto copy over app
  // TODO V1 account delete 15 days limit
  // TODO V1 medication list
  // TODO V1 emergency content list
  // TODO V1 static content
  // TODO V1 ASK APP TEAM navigate me will take user to group owner always, and this is not visible to owner create an api which on passing any user id will return its current lat long value which will help in draw path plus add validation that logged in user and that user both must be part of that group so we might need to take user id and group id in param
  // TODO V1 ASK APP TEAM create bubble will only be visible to group owner
  // TODO V1 ASK APP TEAM need to discuss share link, deeplink mechanism via firebase (bcz firebase will disable this link generation...) R&D
}
