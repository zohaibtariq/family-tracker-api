import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../users/schemas/user.schema';
import { UserStatus } from '../../users/enums/users.status.enum';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { replacePlaceholders } from '../../utils/helpers';
import { SettingsService } from '../../settings/settings.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ValidUserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18nService: I18nService,
    private readonly settingsService: SettingsService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    let user: User = request.user; // NOTE Assuming user data is attached to the request
    const url = request.url;

    if (url === '/otp/send' || url === '/otp/verify') {
      const body = request.body;
      // NOTE because only these two apis dont have req.user bcz they are public
      const phoneNumber = body.countryCode + body.phoneNumber;
      user = await this.usersService.findByPhoneNumber(phoneNumber);
    }

    if (!user) {
      return false; // NOTE No user found, deny access
    }

    let admin_contact_number: string | undefined,
      admin_contact_email: string | undefined;

    if (
      user.status === UserStatus.BLOCKED ||
      (requiredRoles && !requiredRoles.includes(user.role))
    ) {
      const settings: any = await this.settingsService.findAll();
      admin_contact_number = settings.admin_contact_number || '';
      admin_contact_email = settings.admin_contact_email || '';
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new HttpException(
        replacePlaceholders(
          this.i18nService.t('user.USER_BLOCKED', {
            lang: I18nContext.current().lang,
          }),
          {
            ADMIN_CONTACT_NUMBER: admin_contact_number,
            ADMIN_CONTACT_EMAIL: admin_contact_email,
          },
        ),
        HttpStatus.FORBIDDEN,
      );
    }
    // console.log('requiredRoles');
    // console.log(requiredRoles);
    if (!requiredRoles) {
      // NOTE if no roles defined in decorator means allowed globally to all roles
      return true;
    }

    const isReqRoleFound = requiredRoles.includes(user.role); // NOTE Check if user has required role
    if (!isReqRoleFound) {
      // const { admin_contact_number, admin_contact_email }: any =
      //   await this.settingsService.findAll();
      throw new HttpException(
        replacePlaceholders(
          this.i18nService.t('user.USER_ROLE_NO_ACCESS', {
            lang: I18nContext.current().lang,
          }),
          {
            ADMIN_CONTACT_NUMBER: admin_contact_number,
            ADMIN_CONTACT_EMAIL: admin_contact_email,
          },
        ),
        HttpStatus.FORBIDDEN,
      );
    }

    return isReqRoleFound;
  }
}
