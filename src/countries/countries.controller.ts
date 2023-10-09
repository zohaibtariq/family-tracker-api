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
import { CountriesService } from './countries.service';
import { DuplicateKeyExceptionFilter } from '../exceptions/duplicate-key.filter';
import { CreateCountryDto } from './dto/create-country.dto';
import { AccessTokenGuard } from '../otp/guards/accessToken.guard';
import { Roles } from '../otp/decoraters/roles.decorator';
import { RolesGuard } from '../otp/guards/roles.guard';
import { ResponseService } from '../response/response.service';
import { Response } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('countries')
export class CountriesController {
  constructor(
    private readonly countriesService: CountriesService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @Roles('admin', 'superadmin')
  @UseGuards(RolesGuard)
  @UseFilters(DuplicateKeyExceptionFilter)
  async create(
    @Res() res: Response,
    @Body() createCountryDto: CreateCountryDto,
  ) {
    return this.responseService.response(
      res,
      await this.countriesService.create(createCountryDto),
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
      await this.countriesService.findAll(),
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: Types.ObjectId) {
  //   return this.countriesService.findOne(id);
  // }
  //
  // @UseGuards(AccessTokenGuard)
  // @Patch(':id')
  // update(
  //   @Param('id') id: Types.ObjectId,
  //   @Body() updateCountryDto: UpdateCountryDto,
  // ) {
  //   return this.countriesService.update(id, updateCountryDto, { new: true });
  // }
  //
  // @UseGuards(AccessTokenGuard)
  // @Delete(':id')
  // remove(@Param('id') id: Types.ObjectId) {
  //   return this.countriesService.remove(id);
  // }
}
