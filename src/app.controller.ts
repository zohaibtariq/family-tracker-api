// // import { Controller, Get } from '@nestjs/common';
// // import { AppService } from './app.service';
// // import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
// import { Controller } from '@nestjs/common';
//
// @Controller()
// export class AppController {
//   // constructor(
//   //   private readonly appService: AppService,
//   //   private readonly i18n: I18nService,
//   // ) {}
//   // @Get()
//   // // async getHello() {
//   // async getHello(@I18n() i18n: I18nContext) {
//   //   // return await i18n.translate('otp.OTP_SENT_MSG');
//   //   // return await i18n.t('otp.OTP_SENT_MSG');
//   //   return i18n.t('otp.OTP_SENT_MSG', { lang: I18nContext.current().lang });
//   //   return this.i18n.t('otp.OTP_SENT_MSG', { lang: I18nContext.current().lang });
//   //   // return this.appService.getHello();
//   // }
// }
import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  MAX_FILE_SIZE_IN_BYTES,
  multerLocalOptionsStorage,
  VALID_IMAGE_MIME_TYPES,
} from './utils/upload.utils';
import { CustomUploadFileTypeValidator } from './app.validators';
import { AccessTokenGuard } from './otp/guards/accessToken.guard';

// const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024;
// const VALID_UPLOADS_MIME_TYPES = [
//   'image/jpeg',
//   'image/jpg',
//   'image/png',
//   'image/gif',
//   'image/bmp',
//   'image/webp',
//   'image/svg+xml',
// ];

@UseGuards(AccessTokenGuard)
@Controller()
export class AppController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage: multerLocalOptionsStorage,
        // fileFilter: imageFileFilter,
      },
      // multerLocalOptions,
      // {
      // storage: diskStorage({
      // as soon as I enable this diskStorage file.buffer not populated
      // destination: 'public/avatars',
      // filename: editFileName(),
      // filename: (req, file, cb) => {
      //   cb(null, file.originalname);
      // },
      // }),
      // fileFilter: imageFileFilter,
      // }
    ),
  )
  public async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileTypeValidator({
            fileType: VALID_IMAGE_MIME_TYPES,
          }),
        )
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_IN_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file,
  ) {
    // TODO:: move this code to user update profile
    // once new file uploaded if its ext is other than old file then delete that old file or create separate folder with user id name and delete all files inside that folder and then upload new file.
    // convert error msgs from translation
    return file;
  }
}
