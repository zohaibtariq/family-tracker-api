import {
  Body,
  Controller,
  Delete,
  Get,
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

@UseGuards(AccessTokenGuard, ValidUserGuard)
@Controller('groups')
export class GroupsController {
  // TODO need to add security checks of admin and user at everywhere action must be permitted or data must be fetched if you have some rights or access
  constructor(
    private readonly groupsService: GroupsService,
    private readonly groupUsersService: GroupUsersService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    // TODO need to discuss share link, deeplink mechanism via firebase
    // console.log('req.user.id');
    // console.log(req.user.id);
    const newGroup = await this.groupsService.create(
      createGroupDto,
      req.user.id,
    );
    // console.log(newGroup);
    const { id, code } = newGroup;
    await this.assignGroupWithUser(id, req.user.id);
    return this.responseService.response(res, { code }, '', HttpStatus.CREATED);
  }

  async assignGroupWithUser(groupId: Types.ObjectId, userId: Types.ObjectId) {
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

  @Get()
  async findAll(@Req() req: RequestUserInterface, @Res() res: Response) {
    // TODO need to show count of users joined in a group
    return this.responseService.response(
      res,
      await this.groupsService.findGroupsForUser(req.user.id), // TODO might need transformer just to show members count
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
    // TODO here need to fetch those users groupAdmins who are linked with that group
    return this.responseService.response(
      res,
      await this.groupsService.findOne(groupId), // TODO write transformation logic here like with members highlight owner and admin with users members
      '',
    );
  }

  @Post(':groupId/landmark')
  @UseGuards(GroupAccessGuard)
  @GroupAccess({
    isOwnerRequired: true,
    isAdminRequired: true,
    isMemberRequired: true,
  })
  async addLandmark(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Param('groupId') groupId: Types.ObjectId,
    @Body() landmarkDto: LandmarkDto,
  ) {
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

  @Patch(':groupId/circle')
  @UseGuards(GroupAccessGuard)
  @GroupAccess({
    isOwnerRequired: true,
    isAdminRequired: false,
    isMemberRequired: false,
  })
  async updateCircle(
    @Req() req: RequestUserInterface,
    @Param('groupId') groupId: Types.ObjectId,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(req.user.id, groupId, updateGroupDto, {
      new: true,
    });
  }

  // TODO > here a user want to join the group we can do it by two ways 1) join/groupId 2) groupId/userId for now for ease of use we are doing 2 but latter the group joining logic will be updated via share URL so it's just for dev testing to test the flow
  @Post(':groupId/:userId')
  async joinGroup(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Param('groupId') groupId: Types.ObjectId,
    @Param('userId') userId: Types.ObjectId,
  ) {
    // console.log(groupId);
    // console.log(userId);
    groupId = new Types.ObjectId(groupId);
    userId = new Types.ObjectId(userId);
    // console.log(groupId);
    // console.log(userId);
    await this.groupsService.createOrUpdate(
      { _id: groupId },
      { $addToSet: { members: userId } },
      { new: true, upsert: true },
    );
    const joined = await this.assignGroupWithUser(groupId, userId);
    return this.responseService.response(res, joined, '', HttpStatus.CREATED);
  }

  @Patch(':groupId/landmark/:landMarkId')
  @UseGuards(GroupAccessGuard)
  @GroupAccess({
    isOwnerRequired: true,
    isAdminRequired: true,
    isMemberRequired: true,
  })
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
  @GroupAccess({
    isOwnerRequired: true,
    isAdminRequired: true,
    isMemberRequired: true,
  })
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
  @GroupAccess({
    isOwnerRequired: true,
    isAdminRequired: false,
    isMemberRequired: false,
  })
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
  async remove(
    @Req() req: RequestUserInterface,
    @Param('groupId') groupId: Types.ObjectId,
  ) {
    await this.groupsService.checkGroupAccess(req.user.id, groupId, {
      isOwnerRequired: false,
      isAdminRequired: false,
      isMemberRequired: true,
    });
    return this.groupsService.remove(groupId);
  }

  // TODO add an endpoint which will check if user current lat long is outside the given circle boundary of a given group's circle or only userid with current lat long must be hit with some defined displacement which will be get from setting and api must check in how many group as owner admin or member this user is attached and if outside boundary will push notification to ASK (owner, admin, member)

  // TODO mark group member an admin functionality

  // TODO ASK what special feature does group owner, admin or member has ?
}
