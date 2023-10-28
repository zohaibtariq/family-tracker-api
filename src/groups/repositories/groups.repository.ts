import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from '../schemas/group.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { EntityRepository } from '../../database/entity.repository';

@Injectable()
export class GroupsRepository extends EntityRepository<GroupDocument> {
  constructor(@InjectModel(Group.name) groupModel: Model<GroupDocument>) {
    super(groupModel);
  }

  async findById(
    groupId: Types.ObjectId,
    projection: Record<string, unknown> = {},
  ): Promise<GroupDocument | null> {
    return await this.entityModel
      .findById(groupId, projection)
      // .populate('groupOwner groupAdmins')
      .populate({
        path: 'groupOwner',
        select:
          'firstName lastName phoneNumber avatar emergencyNumber role status',
      })
      .populate({
        path: 'groupAdmins',
        select:
          'firstName lastName phoneNumber avatar emergencyNumber role status',
      })
      .populate({
        path: 'members',
        select:
          'firstName lastName phoneNumber avatar emergencyNumber role status',
      })
      .exec();
  }

  async findNonPopulatedById(
    groupId: Types.ObjectId,
    projection: Record<string, unknown> = {},
  ): Promise<GroupDocument | null> {
    return await this.entityModel.findById(groupId, projection);
    // .populate('groupOwner groupAdmins')
    // .populate({
    //   path: 'groupOwner',
    //   select:
    //     'firstName lastName phoneNumber avatar emergencyNumber role status',
    // })
    // .populate({
    //   path: 'groupAdmins',
    //   select:
    //     'firstName lastName phoneNumber avatar emergencyNumber role status',
    // })
    // .populate({
    //   path: 'members',
    //   select:
    //     'firstName lastName phoneNumber avatar emergencyNumber role status',
    // })
    // .exec();
  }

  async find(
    filterQuery: FilterQuery<GroupDocument> = {},
    projection: Record<string, unknown> = {},
  ): Promise<GroupDocument[] | null> {
    return await this.entityModel
      .find(filterQuery, projection)
      // .populate('groupOwner groupAdmins')
      // .populate({
      //   path: 'groupOwner',
      //   select:
      //     'firstName lastName phoneNumber avatar emergencyNumber role status',
      // })
      // .populate({
      //   path: 'groupAdmins',
      //   select:
      //     'firstName lastName phoneNumber avatar emergencyNumber role status',
      // })
      // .populate({
      //   path: 'members',
      //   select:
      //     'firstName lastName phoneNumber avatar emergencyNumber role status',
      // })
      .exec();
  }
}
