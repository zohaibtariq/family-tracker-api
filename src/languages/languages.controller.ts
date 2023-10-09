import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { DuplicateKeyExceptionFilter } from '../exceptions/duplicate-key.filter';
import { CreateLanguageDto } from './dto/create-language.dto';
import { AccessTokenGuard } from '../otp/guards/accessToken.guard';
import { Roles } from '../otp/decoraters/roles.decorator';
import { RolesGuard } from '../otp/guards/roles.guard';
import { ResponseService } from '../response/response.service';
import { Response } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('languages')
export class LanguagesController {
  constructor(
    private readonly languagesService: LanguagesService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @Roles('admin', 'superadmin')
  @UseGuards(RolesGuard)
  @UseFilters(DuplicateKeyExceptionFilter)
  async create(
    @Res() res: Response,
    @Body() createLanguageDto: CreateLanguageDto,
  ) {
    return this.responseService.response(
      res,
      await this.languagesService.create(createLanguageDto),
      '',
      HttpStatus.CREATED,
    );
  }

  @Get()
  @Roles('user', 'admin', 'superadmin')
  @UseGuards(RolesGuard)
  async findAll(@Res() res: Response) {
    return this.responseService.response(
      res,
      await this.languagesService.findAll(),
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: Types.ObjectId) {
  //   return this.languagesService.findOne(id);
  // }
  //
  // @UseGuards(AccessTokenGuard)
  // @Patch(':id')
  // update(
  //   @Param('id') id: Types.ObjectId,
  //   @Body() updateLanguageDto: UpdateScreenDto,
  // ) {
  //   return this.languagesService.update(id, updateLanguageDto, { new: true });
  // }
  //
  // @UseGuards(AccessTokenGuard)
  // @Delete(':id')
  // remove(@Param('id') id: Types.ObjectId) {
  //   return this.languagesService.remove(id);
  // }
}
