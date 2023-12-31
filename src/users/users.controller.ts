import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidUserGuard } from '../otp/guards/valid.user.guard';
import { AccessTokenGuard } from '../otp/guards/accessToken.guard';
import { RequestUserInterface } from './interfaces/request-user-interface';
import { FileInterceptor } from '@nestjs/platform-express'; // import { imageFileFilter, imageStorage } from '../utils/helpers';
import {
  bytesToMB,
  deleteAllFromDestExcludingOne,
  identifyImageMimeType,
  imageFileFilter,
  MAX_FILE_SIZE_IN_BYTES,
  multerLocalOptionsStorage,
  replacePlaceholders,
  VALID_IMAGE_MIME_TYPES,
} from '../utils/helpers';
import { I18n, I18nContext } from 'nestjs-i18n';
// import { I18nService } from 'nestjs-i18n';
import * as fs from 'fs';
import { Types } from 'mongoose';
import { Response } from 'express';
import { ResponseService } from '../response/response.service';
import { UpdateUserLocationDto } from './dto/update-user-location.dto';
import { GroupsService } from '../groups/groups.service';

// import { FileContentInterceptor } from '../utils/FileContentInterceptor';

@UseGuards(AccessTokenGuard, ValidUserGuard) // @Roles() cannot be defined on top they are function level while ValidUserGuard can be defined over top and as per current logic if any function has no roles defined means it is a public route means accessible to everyone.
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
    private readonly responseService: ResponseService, // private readonly i18nService: I18nService,
  ) {}

  @Get()
  // @Roles('user', 'admin', 'superadmin') // NOTE allowed globally irrespective of what role they have
  async currentLoggedInUser(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
  ) {
    return this.responseService.response(
      res,
      await this.usersService.findById(req.user.id),
    );
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: multerLocalOptionsStorage,
      fileFilter: imageFileFilter,
    }),
  )
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @UploadedFile()
    file,
    @I18n() i18n: I18nContext,
  ) {
    if (file) {
      const fileMimeType = identifyImageMimeType(file.path);
      const isValid = VALID_IMAGE_MIME_TYPES.includes(fileMimeType);
      const isFileInLimit = file.size > MAX_FILE_SIZE_IN_BYTES;
      let errorMsg = '';
      if (isFileInLimit) {
        errorMsg = replacePlaceholders(
          i18n.t('language.ERROR_FILE_SIZE_LARGE'),
          {
            FILE_SIZE_MB: bytesToMB(file.size),
            MAX_FILE_SIZE_IN_MB: bytesToMB(MAX_FILE_SIZE_IN_BYTES),
          },
        );
      } else if (!isValid) {
        errorMsg = replacePlaceholders(
          i18n.t('language.ERROR_FILE_TYPE_NOT_ALLOWED'),
          {
            FILE_MIME_TYPE: fileMimeType,
          },
        );
      }
      // IMPORTANT: if any issue file must be deleted and exception should be thrown
      if (!isValid || isFileInLimit) {
        fs.unlinkSync(file.path);
        throw new HttpException(errorMsg, HttpStatus.UNPROCESSABLE_ENTITY);
      }
      // NOTE: file is valid till here hence will stay
      deleteAllFromDestExcludingOne(file.destination, file.filename); // IMPORTANT:: it is deleting all files excluding the recently uploaded one
      updateUserDto.avatar = file.filename;
    }
    const userId: Types.ObjectId = req.user.id;
    if (updateUserDto?.emergencyCountryCode && updateUserDto?.emergencyNumber)
      updateUserDto.emergencyNumber =
        updateUserDto.emergencyCountryCode + updateUserDto.emergencyNumber;
    if (updateUserDto?.emergencyCountryCode)
      delete updateUserDto.emergencyCountryCode; // NOTE: because we don't want to persist country code of emergency number
    // const loggedInUser = await this.usersService.findById(req.user.id);
    // const updateUserObj: any = {
    //   ...updateUserDto,
    //   currentLocation: loggedInUser.currentLocation,
    // };
    // if (updateUserObj?.currentLocationLatitude) {
    //   updateUserObj.currentLocation['latitude'] = parseFloat(
    //     updateUserObj?.currentLocationLatitude,
    //   );
    //   delete updateUserObj?.currentLocationLatitude;
    // }
    // if (updateUserObj?.currentLocationLongitude) {
    //   updateUserObj.currentLocation['longitude'] = parseFloat(
    //     updateUserObj?.currentLocationLongitude,
    //   );
    //   delete updateUserObj?.currentLocationLongitude;
    // }
    // console.log('updateUserObj');
    // console.log(updateUserObj);
    const updatedUser = await this.usersService.update(userId, updateUserDto, {
      new: true,
    });
    return this.responseService.response(res, updatedUser);
  }

  @Post('location')
  async updateUserLocation(
    @Body() updateUserLocationDto: UpdateUserLocationDto,
    @Req() req: RequestUserInterface,
    @Res() res: Response,
  ) {
    const userId: Types.ObjectId = req.user.id;
    const updatedUser = await this.usersService.update(
      userId,
      updateUserLocationDto,
      {
        new: true,
      },
    );
    await this.groupsService.checkAndNotifyUserOwnerIfUserIsOutsideCircle(
      userId,
      updatedUser,
    );
    return this.responseService.response(res, updatedUser);
  }

  // getUserLocation() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(this.showUserPosition);
  //   } else {
  //     alert('Geolocation is not supported by your browser.');
  //   }
  // }
  //
  // showUserPosition(position) {
  //   const userLocation = {
  //     lat: position.coords.latitude,
  //     lng: position.coords.longitude,
  //   };
  //   // Check if the user's location is outside the circle boundary
  //   this.checkLocation(userLocation);
  // }
  //
  // checkLocation(userLocation) {
  //   const circleCenter = { lat: 1, lng: 2 }; // circle.getCenter(); // Get the circle's center
  //   const circleRadius = 2; // circle.getRadius(); // Get the circle's radius in meters
  //
  //   // Use the Haversine formula to calculate the distance between two lat/lng points
  //   const distance = this.haversine(
  //     userLocation.lat,
  //     userLocation.lng,
  //     circleCenter.lat,
  //     circleCenter.lng,
  //   );
  //
  //   if (distance > circleRadius) {
  //     // The user is outside the circle boundary
  //     alert('You are outside the circle boundary!');
  //   } else {
  //     // The user is inside the circle boundary
  //     alert('You are inside the circle boundary.');
  //   }
  // }

  // @Get('user-admin-superadmin')
  // async userAdminSuperGuard(
  //   @Req() req: RequestUserInterface,
  //   @Res() res: Response,
  // ) {
  //   return this.responseService.response(res, 'USER | ADMIN | SUPER ADMIN');
  // }
  //
  // @Get('admin-superadmin')
  // @Roles('admin', 'superadmin')
  // async adminSuperGuard(
  //   @Req() req: RequestUserInterface,
  //   @Res() res: Response,
  // ) {
  //   return this.responseService.response(res, 'ADMIN | SUPER ADMIN');
  // }
  //
  // @Get('superadmin')
  // @Roles('superadmin')
  // async superGuard(@Req() req: RequestUserInterface, @Res() res: Response) {
  //   return this.responseService.response(res, 'SUPER ADMIN');
  // }
}
