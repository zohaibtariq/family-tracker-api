import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { I18nService } from 'nestjs-i18n';
import { SettingsService } from '../../settings/settings.service';
// import { UsersService } from '../../users/users.service';
import { GroupsService } from '../groups.service';

@Injectable()
export class GroupAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    // private readonly i18nService: I18nService,
    private readonly settingsService: SettingsService,
    // private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // TODO need to think this requiredGroupAccess how frontend will be aware of it so it cannot show such action item ui element like update group name to show for admin or members as it is only allowed for admin
    const requiredGroupAccess = this.reflector.get(
      'groupAccess',
      context.getHandler(),
    );
    // console.log('requiredGroupAccess');
    // console.log(requiredGroupAccess);
    const settingsGroupAccess =
      await this.settingsService.get(requiredGroupAccess);
    // console.log('settingsGroupAccess');
    // console.log(settingsGroupAccess);
    if (!requiredGroupAccess || !settingsGroupAccess) {
      // NOTE access must be strictly pass from meta data and defined in db as well
      return false; // access allowed for all
    }
    const request = context.switchToHttp().getRequest();
    const groupId = request.params.groupId;
    const loggedInUserId = request.user.id;
    // console.log('groupId');
    // console.log(groupId);
    // console.log('loggedInUserId');
    // console.log(loggedInUserId);
    try {
      const group = await this.groupsService.checkGroupAccess(
        loggedInUserId,
        groupId,
        settingsGroupAccess,
      );
      request.group = group;
      return true;
    } catch (error) {
      throw error;
    }
    // return false;
  }
}
