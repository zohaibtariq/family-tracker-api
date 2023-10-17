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
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupUsersService } from './group.users.service';

@UseGuards(AccessTokenGuard, ValidUserGuard)
@Controller('groups')
export class GroupsController {
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
    const { code } = await this.groupsService.create(
      createGroupDto,
      req.user.id,
    );
    return this.responseService.response(res, { code }, '', HttpStatus.CREATED);
  }

  // TODO here a user want to join the group we can do it by two ways 1) join/groupId 2) groupId/userId for now for ease of use we are doing 2 but latter the group joining logic will be updated via share URL so its just for dev testing to test the flow
  @Post(':groupId/:userId')
  async joinGroup(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Param('groupId') groupId: Types.ObjectId,
    @Param('userId') userId: Types.ObjectId,
  ) {
    console.log(groupId);
    console.log(userId);
    const joined = await this.groupUsersService.createOrUpdate(
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
    return this.responseService.response(res, joined, '', HttpStatus.CREATED);
  }

  @Get()
  async findAll(@Req() req: RequestUserInterface, @Res() res: Response) {
    // TODO need to show count of users joined in a group
    // return this.groupsService.findAll();
    return this.responseService.response(
      res,
      await this.groupsService.findAll(req.user.id),
      '',
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Param('id') id: Types.ObjectId,
  ) {
    console.log('GET id');
    console.log(id);
    // TODO here need to fetch those users who are linked with that group
    return this.responseService.response(
      res,
      await this.groupsService.findOne(id),
      '',
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: Types.ObjectId) {
    return this.groupsService.remove(id);
  }
}
