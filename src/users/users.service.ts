import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
// import { I18nService } from 'nestjs-i18n';

// import { SettingsService } from '../settings/settings.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository, // private readonly i18n: I18nService, // private readonly settingsService: SettingsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.usersRepository.create(createUserDto);
  }

  // async findAll(filter = {}, projection = {}): Promise<UserDocument[]> {
  //   return this.usersRepository.find(filter, projection);
  // }

  async findById(id: Types.ObjectId, projection = {}): Promise<UserDocument> {
    return this.usersRepository.findById(id, projection);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserDocument> {
    return this.usersRepository.findOne({ phoneNumber });
  }

  async update(
    id: Types.ObjectId,
    updateUserDto: object,
    options = {},
  ): Promise<UserDocument> {
    return this.usersRepository.findByIdAndUpdate(id, updateUserDto, options);
  }

  // async delete(id: Types.ObjectId): Promise<UserDocument> {
  //   return this.usersRepository.findByIdAndDelete(id);
  // }

  createOrUpdate(filter = {}, update = {}, options = {}) {
    return this.usersRepository.findOneAndUpdate(filter, update, options);
  }

  // async updateUserCurrentLocationAndCheckIfUserIsOutsideCircleBoundary(
  //   userId,
  //   updateUserLocationDto,
  // ) {
  //   const updatedUser = await this.update(userId, updateUserLocationDto, {
  //     new: true,
  //   });
  //   if (
  //     updatedUser?.currentLocation?.latitude &&
  //     updatedUser?.currentLocation?.longitude
  //   ) {
  //     const userCurrentLocation = updatedUser.currentLocation;
  //     // console.log('groups found of  a user...');
  //     const userGroups = await this.groupsService.find(
  //       {
  //         circleValidTill: { $gt: new Date() },
  //         isActive: true,
  //         $or: [
  //           { groupOwner: userId },
  //           { groupAdmins: userId },
  //           { members: userId },
  //         ],
  //       },
  //       {},
  //     );
  //     if (userGroups) {
  //       userGroups.forEach((userGroup) => {
  //         // console.log(userGroup);
  //         if (
  //           userGroup.circleCenter.longitude &&
  //           userGroup.circleCenter.latitude &&
  //           userGroup.circleRadius
  //         ) {
  //           const circleCenter = userGroup.circleCenter;
  //           const circleRadius = userGroup.circleRadius;
  //           const distance = this.haversine(
  //             userCurrentLocation.latitude,
  //             userCurrentLocation.longitude,
  //             circleCenter.latitude,
  //             circleCenter.longitude,
  //           );
  //           console.log('circleRadius: ' + circleRadius);
  //           console.log('distance: ' + distance);
  //           if (distance > circleRadius) {
  //             console.log('You are outside the circle boundary!');
  //             // TODO V1 need to trigger notification to group owner and to user who is outside the boundary
  //           } else {
  //             console.log('You are inside the circle boundary.');
  //           }
  //         }
  //       });
  //     } else {
  //       console.log('groups not found of  a user...');
  //     }
  //   } else {
  //     console.log('user location is not found...');
  //   }
  // }
}
