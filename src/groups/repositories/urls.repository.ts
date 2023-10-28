import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Url, UrlDocument } from '../schemas/Url.schema';
// import { FilterQuery, Model, Types } from 'mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../../database/entity.repository';

@Injectable()
export class UrlsRepository extends EntityRepository<UrlDocument> {
  constructor(@InjectModel(Url.name) urlModel: Model<UrlDocument>) {
    super(urlModel);
  }

  // async findById(
  //   urlId: Types.ObjectId,
  //   projection: Record<string, unknown> = {},
  // ): Promise<UrlDocument | null> {
  //   return await this.entityModel
  //     .findById(urlId, projection)
  //     // .populate('urlOwner urlAdmins')
  //     .populate({
  //       path: 'urlOwner',
  //       select:
  //         'firstName lastName phoneNumber avatar emergencyNumber role status',
  //     })
  //     .populate({
  //       path: 'urlAdmins',
  //       select:
  //         'firstName lastName phoneNumber avatar emergencyNumber role status',
  //     })
  //     .populate({
  //       path: 'members',
  //       select:
  //         'firstName lastName phoneNumber avatar emergencyNumber role status',
  //     })
  //     .exec();
  // }

  // async findNonPopulatedById(
  //   urlId: Types.ObjectId,
  //   projection: Record<string, unknown> = {},
  // ): Promise<UrlDocument | null> {
  //   return this.entityModel.findById(urlId, projection);
  //   // .populate('urlOwner urlAdmins')
  //   // .populate({
  //   //   path: 'urlOwner',
  //   //   select:
  //   //     'firstName lastName phoneNumber avatar emergencyNumber role status',
  //   // })
  //   // .populate({
  //   //   path: 'urlAdmins',
  //   //   select:
  //   //     'firstName lastName phoneNumber avatar emergencyNumber role status',
  //   // })
  //   // .populate({
  //   //   path: 'members',
  //   //   select:
  //   //     'firstName lastName phoneNumber avatar emergencyNumber role status',
  //   // })
  //   // .exec();
  // }

  // async find(
  //   filterQuery: FilterQuery<UrlDocument> = {},
  //   projection: Record<string, unknown> = {},
  // ): Promise<UrlDocument[] | null> {
  //   return await this.entityModel
  //     .find(filterQuery, projection)
  //     // .populate('urlOwner urlAdmins')
  //     // .populate({
  //     //   path: 'urlOwner',
  //     //   select:
  //     //     'firstName lastName phoneNumber avatar emergencyNumber role status',
  //     // })
  //     // .populate({
  //     //   path: 'urlAdmins',
  //     //   select:
  //     //     'firstName lastName phoneNumber avatar emergencyNumber role status',
  //     // })
  //     // .populate({
  //     //   path: 'members',
  //     //   select:
  //     //     'firstName lastName phoneNumber avatar emergencyNumber role status',
  //     // })
  //     .exec();
  // }
}
