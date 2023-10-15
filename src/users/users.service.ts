import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { I18nService } from 'nestjs-i18n';
import { UserStatus } from './enums/users.status.enum';
import { replacePlaceholders } from '../utils/helpers';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly i18n: I18nService,
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

  async checkUserStatusByPhoneNumber(phoneNumber) {
    this.checkUserStatus(await this.findByPhoneNumber(phoneNumber));
  }

  async checkUserStatusByUserId(userId) {
    this.checkUserStatus(await this.findById(userId));
  }

  checkUserStatus(user) {
    if (user !== null && user.status === UserStatus.BLOCKED)
      throw new HttpException(
        replacePlaceholders(this.i18n.t('otp.USER_BLOCKED'), {
          ADMIN_CONTACT: 'TODO03132523242', // TODO: Need to add this in super admin so one user can contact to admin.
        }),
        HttpStatus.FORBIDDEN,
      );
  }
}
