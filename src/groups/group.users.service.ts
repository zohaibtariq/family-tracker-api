import { Injectable } from '@nestjs/common';
import { GroupUsersRepository } from './repositories/group.users.repository';

@Injectable()
export class GroupUsersService {
  constructor(private readonly groupUsersRepository: GroupUsersRepository) {}

  createOrUpdate(filter = {}, update = {}, options = {}) {
    return this.groupUsersRepository.findOneAndUpdate(filter, update, options);
  }
}
