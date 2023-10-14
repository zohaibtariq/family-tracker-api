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
  deleteAllFromDestExcludingOne,
  imageFileFilter,
  MAX_FILE_SIZE_IN_BYTES,
  multerLocalOptionsStorage,
  VALID_IMAGE_MIME_TYPES,
} from './utils/helpers';
import { AvatarUploadValidator } from './validators/avatar.upload.validator';
import { AccessTokenGuard } from './otp/guards/accessToken.guard';

@UseGuards(AccessTokenGuard)
@Controller()
export class AppController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: multerLocalOptionsStorage,
      fileFilter: imageFileFilter,
    }),
  )
  public async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new AvatarUploadValidator({
            fileType: VALID_IMAGE_MIME_TYPES,
          }),
        )
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_IN_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file,
  ) {
    // TODO:: move this code to user update profile once new file uploaded if its ext is other than old file then delete that old file or create separate folder with user id name and delete all files inside that folder and then upload new file. convert error messages from translation
    // console.log('UPLOADED FILE');
    // console.log(file);
    deleteAllFromDestExcludingOne(file.destination, file.filename); // IMPORTANT:: it is deleting all files excluding the recently uploaded one
    return file;
  }
}
