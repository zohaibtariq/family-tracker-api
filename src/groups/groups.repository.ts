import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { Model } from 'mongoose';
import { EntityRepository } from '../database/entity.repository';

@Injectable()
export class GroupsRepository extends EntityRepository<GroupDocument> {
  constructor(@InjectModel(Group.name) countryModel: Model<GroupDocument>) {
    super(countryModel);
  }
}
