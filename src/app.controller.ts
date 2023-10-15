// import {
//   Controller,
//   HttpStatus,
//   ParseFilePipeBuilder,
//   Post,
//   UploadedFile,
//   UseGuards,
//   UseInterceptors,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import {
//   deleteAllFromDestExcludingOne,
//   imageFileFilter,
//   MAX_FILE_SIZE_IN_BYTES,
//   multerLocalOptionsStorage,
//   VALID_IMAGE_MIME_TYPES,
// } from './utils/helpers';
// import { AvatarUploadValidator } from './validators/avatar.upload.validator';
// import { AccessTokenGuard } from './otp/guards/accessToken.guard';

// @UseGuards(AccessTokenGuard)
import { Controller } from '@nestjs/common';

@Controller()
export class AppController {
  // @Post('upload')
  // @UseInterceptors(
  //   FileInterceptor('avatar', {
  //     storage: multerLocalOptionsStorage,
  //     fileFilter: imageFileFilter,
  //   }),
  // )
  // public async uploadFile(
  //   @UploadedFile(
  //     new ParseFilePipeBuilder()
  //       .addValidator(
  //         new AvatarUploadValidator({
  //           fileType: VALID_IMAGE_MIME_TYPES,
  //         }),
  //       )
  //       .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_IN_BYTES })
  //       .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
  //   )
  //   file,
  // ) {
  //   deleteAllFromDestExcludingOne(file.destination, file.filename); // IMPORTANT:: it is deleting all files excluding the recently uploaded one
  //   return file;
  // }
}
