import { Controller, UseGuards } from '@nestjs/common';
import { LanguagesService } from './languages.service';
// import { DuplicateKeyExceptionFilter } from '../exceptions/duplicate-key.filter';
// import { CreateLanguageDto } from './dto/create-language.dto';
import { AccessTokenGuard } from '../otp/guards/accessToken.guard';
// import { Roles } from '../otp/decorators/roles.decorator';
// import { ValidUserGuard } from '../otp/guards/valid.user.guard';
import { ResponseService } from '../response/response.service';

// import { Response } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('languages')
export class LanguagesController {
  constructor(
    private readonly languagesService: LanguagesService,
    private readonly responseService: ResponseService,
  ) {}

  // NOTE working but explicitly commented to not modify our seeder data from API get it from settings we don't need this ATM
  // @Post()
  // @Roles('admin', 'superadmin')
  // @UseGuards(ValidUserGuard)
  // @UseFilters(DuplicateKeyExceptionFilter)
  // async create(
  //   @Res() res: Response,
  //   @Body() createLanguageDto: CreateLanguageDto,
  // ) {
  //   return this.responseService.response(
  //     res,
  //     await this.languagesService.create(createLanguageDto),
  //     '',
  //     HttpStatus.CREATED,
  //   );
  // }

  // NOTE working but explicitly commented to not modify our seeder data from API get it from settings we don't need this ATM
  // @Get()
  // // @Roles('user', 'admin', 'superadmin') // NOTE allowed globally irrespective of what role they have
  // @UseGuards(ValidUserGuard)
  // async findAll(@Res() res: Response) {
  //   return this.responseService.response(
  //     res,
  //     await this.languagesService.findAll(),
  //   );
  // }

  // @Get(':id')
  // findOne(@Param('id') id: Types.ObjectId) {
  //   return this.languagesService.findOne(id);
  // }

  // @UseGuards(AccessTokenGuard)
  // @Patch(':id')
  // update(
  //   @Param('id') id: Types.ObjectId,
  //   @Body() updateLanguageDto: UpdateScreenDto,
  // ) {
  //   return this.languagesService.update(id, updateLanguageDto, { new: true });
  // }

  // @UseGuards(AccessTokenGuard)
  // @Delete(':id')
  // remove(@Param('id') id: Types.ObjectId) {
  //   return this.languagesService.remove(id);
  // }
}
