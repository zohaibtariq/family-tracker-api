import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
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
import { FileInterceptor } from '@nestjs/platform-express'; // import { imageFileFilter, imageStorage } from '../utils/upload.utils';
import { diskStorage } from 'multer';

// import { diskStorage } from 'multer';
import { CustomUploadFileTypeValidator } from '../app.validators';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024;
const VALID_UPLOADS_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
];

@UseGuards(AccessTokenGuard, RolesGuard) // @Roles() cannot be defined on top they are function level while RolesGuard can be defined over top and as per current logic if any function has no roles defined means it is a public route means accessible to everyone.
@Controller('users')
export class UsersController {
  //
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  @Roles('user', 'admin', 'superadmin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'public/avatars',
        // filename: editFileName,
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
      // fileFilter: imageFileFilter,
    }),
  )
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: imageStorage,
  //     fileFilter: imageFileFilter,
  //   }),
  // )
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: 'public/avatars',
  //       filename: (req, file, cb) => {
  //         cb(null, file.originalname);
  //       },
  //     }),
  //   }),
  // )
  update(
    // @Param('id') id: Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequestUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileTypeValidator({
            fileType: VALID_UPLOADS_MIME_TYPES,
          }),
        )
        .addMaxSizeValidator({ maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    // if (!file) {
    //   throw new HttpException('Image upload failed', HttpStatus.BAD_REQUEST);
    // }
    // const userId: any = req.user.sub;
    console.log('REQ USER');
    console.log(req.user);
    console.log('PATCH USER');
    console.log(updateUserDto);
    console.log('UPLOADED FILE');
    console.log(file);
    console.log(file.originalname);
    console.log(file.filename);
    console.log(file.path);
    // return this.usersService.update(userId, updateUserDto, { new: true });
  }

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

  // @Delete(':id')
  // delete(@Param('id') id: Types.ObjectId) {
  //   return this.usersService.delete(id);
  // }
}
