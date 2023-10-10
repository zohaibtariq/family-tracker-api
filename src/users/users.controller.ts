import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../otp/decoraters/roles.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../otp/guards/roles.guard';
import { AccessTokenGuard } from '../otp/guards/accessToken.guard';
import { AuthenticatedRequestUser } from './interfaces/request-user-interface';

@UseGuards(AccessTokenGuard, RolesGuard) // @Roles() cannot be defined on top they are function level while RolesGuard can be defined over top and as per current logic if any function has no roles defined means it is a public route means accessible to everyone.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user-admin-superadmin')
  @Roles('user', 'admin', 'superadmin') // All user types can access this route
  user() {
    return 'USER | ADMIN | SUPERADMIN';
  }

  @Get('admin-superadmin')
  @Roles('admin', 'superadmin') // Only admin and superadmin can access this route
  admin() {
    return 'ADMIN | SUPERADMIN';
  }

  @Get('superadmin')
  @Roles('superadmin') // Only superadmin can access this route
  superadmin() {
    return 'SUPERADMIN';
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll({}, { refreshToken: 0, password: 0 });
  // }

  // @Get(':id')
  // findById(@Param('id') id: Types.ObjectId) {
  //   return this.usersService.findById(id, { refreshToken: 0, password: 0 });
  // }

  @Patch()
  @Roles('user', 'admin', 'superadmin')
  update(
    // @Param('id') id: Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequestUser,
  ) {
    const userId: any = req.user.sub;
    // console.log('REQ USER');
    // console.log(req.user);
    // console.log('PATCH USER');
    // console.log(updateUserDto);
    return this.usersService.update(userId, updateUserDto, { new: true });
  }

  // @Delete(':id')
  // delete(@Param('id') id: Types.ObjectId) {
  //   return this.usersService.delete(id);
  // }
}
