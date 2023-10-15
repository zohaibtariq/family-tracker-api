import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../otp/decoraters/roles.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../otp/guards/roles.guard';
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
import * as fs from 'fs';
import { Types } from 'mongoose';
import { Response } from 'express';
import { ResponseService } from '../response/response.service';

// import { FileContentInterceptor } from '../utils/FileContentInterceptor';

@UseGuards(AccessTokenGuard, RolesGuard) // @Roles() cannot be defined on top they are function level while RolesGuard can be defined over top and as per current logic if any function has no roles defined means it is a public route means accessible to everyone.
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @Roles('user', 'admin', 'superadmin')
  async findAll(@Req() req: RequestUserInterface, @Res() res: Response) {
    return this.responseService.response(
      res,
      await this.usersService.findById(req.user.id),
    );
  }

  @Patch()
  @Roles('user', 'admin', 'superadmin')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: multerLocalOptionsStorage,
      fileFilter: imageFileFilter,
    }),
    // FileContentInterceptor,
  )
  async update(
    // @Param('id') id: Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @UploadedFile()
    // new ParseFilePipeBuilder()
    //   .addValidator(
    //     new AvatarUploadValidator({
    //       fileType: VALID_IMAGE_MIME_TYPES,
    //     }),
    //   )
    //   .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_IN_BYTES })
    //   .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    file,
    @I18n() i18n: I18nContext,
  ) {
    // TODO: add default pic to avatar means return default pic which need to be setup by super admin
    if (file) {
      // console.log(i18n.t('auth.TOKEN_REVOKED')); // TODO: CONVERT ALL MESSAGES VIA LANG
      const fileMimeType = identifyImageMimeType(file.path);
      const isValid = VALID_IMAGE_MIME_TYPES.includes(fileMimeType);
      const isFileInLimit = file.size > MAX_FILE_SIZE_IN_BYTES;
      let errorMsg = '';
      if (isFileInLimit) {
        errorMsg = replacePlaceholders(i18n.t('user.ERROR_FILE_SIZE_LARGE'), {
          FILE_SIZE_MB: bytesToMB(file.size),
          MAX_FILE_SIZE_IN_MB: bytesToMB(MAX_FILE_SIZE_IN_BYTES),
        });
      } else if (!isValid) {
        errorMsg = replacePlaceholders(
          i18n.t('user.ERROR_FILE_TYPE_NOT_ALLOWED'),
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
    updateUserDto.firstName = updateUserDto.firstName;
    updateUserDto.lastName = updateUserDto.lastName;
    if (updateUserDto?.emergencyCountryCode && updateUserDto?.emergencyNumber)
      updateUserDto.emergencyNumber =
        updateUserDto.emergencyCountryCode + updateUserDto.emergencyNumber;
    if (updateUserDto?.emergencyCountryCode)
      delete updateUserDto.emergencyCountryCode; // NOTE: because we don't want to persist country code of emergency number
    const updatedUser = await this.usersService.update(userId, updateUserDto, {
      new: true,
    });
    return this.responseService.response(res, updatedUser);
  }
}
