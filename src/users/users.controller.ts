import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../otp/decoraters/roles.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../otp/guards/roles.guard';
import { AccessTokenGuard } from '../otp/guards/accessToken.guard';
import { AuthenticatedRequestUser } from './interfaces/request-user-interface';
import { FileInterceptor } from '@nestjs/platform-express'; // import { imageFileFilter, imageStorage } from '../utils/helpers';
import {
  bytesToMB,
  deleteAllFromDestExcludingOne,
  identifyImageMimeType,
  imageFileFilter,
  MAX_FILE_SIZE_IN_BYTES,
  multerLocalOptionsStorage,
  VALID_IMAGE_MIME_TYPES,
} from '../utils/helpers';
import { I18n, I18nContext } from 'nestjs-i18n';
import * as fs from 'fs';
import { Types } from 'mongoose';

// import { FileContentInterceptor } from '../utils/FileContentInterceptor';

@UseGuards(AccessTokenGuard, RolesGuard) // @Roles() cannot be defined on top they are function level while RolesGuard can be defined over top and as per current logic if any function has no roles defined means it is a public route means accessible to everyone.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  @Roles('user', 'admin', 'superadmin')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: multerLocalOptionsStorage,
      fileFilter: imageFileFilter,
    }),
    // FileContentInterceptor,
  )
  update(
    // @Param('id') id: Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequestUser,
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
    console.log('PROCESSING REST OF THE CODE...');
    console.log('update');
    console.log(file);
    if (file) {
      console.log(i18n.t('auth.TOKEN_REVOKED'));
      const fileMimeType = identifyImageMimeType(file.path);
      const isValid = VALID_IMAGE_MIME_TYPES.includes(fileMimeType);
      const isFileInLimit = file.size > MAX_FILE_SIZE_IN_BYTES;
      let errorMsg = '';
      if (isFileInLimit) {
        errorMsg = `File size ${bytesToMB(
          file.size,
        )} is larger then allowed size ${bytesToMB(MAX_FILE_SIZE_IN_BYTES)}`;
      } else if (!isValid) {
        errorMsg = `This file type is not allowed to be uploaded.`;
      }
      // IMPORTANT: if any issue file must be deleted and exception should be thrown
      if (!isValid || isFileInLimit) {
        fs.unlinkSync(file.path);
        throw new HttpException(errorMsg, HttpStatus.UNPROCESSABLE_ENTITY);
      }
      // NOTE: file is valid till here hence will stay
    }
    deleteAllFromDestExcludingOne(file.destination, file.filename); // IMPORTANT:: it is deleting all files excluding the recently uploaded one
    const userId: Types.ObjectId = req.user.sub;
    updateUserDto.avatar = file.filename;
    const updatedUser = this.usersService.update(userId, updateUserDto, {
      new: true,
    });
    return updatedUser;
  }
}
