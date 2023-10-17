import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../database/entity.repository';
import { GroupUsers, GroupUsersDocument } from './schemas/group.users.schema';

@Injectable()
export class GroupUsersRepository extends EntityRepository<GroupUsersDocument> {
  constructor(
    @InjectModel(GroupUsers.name) groupUsersModel: Model<GroupUsersDocument>,
  ) {
    super(groupUsersModel);
  }
}
