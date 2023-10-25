import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  // @Matches(/^\+[0-9]{9,14}$/, { message: 'Invalid emergency number format' })
  emergencyNumber: string;

  @IsOptional()
  @IsString()
  emergencyCountryCode: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  avatar: Express.Multer.File;

  @IsOptional()
  @IsString()
  deviceId: string;

  // @IsOptional()
  // @IsString()
  // currentLocationLatitude: number;

  // @IsOptional()
  // @IsString()
  // currentLocationLongitude: number;

  @IsOptional()
  @IsString()
  @IsEmail()
  emailAddress: number;

  @Exclude()
  phoneNumber: string;

  @Exclude()
  role: string;

  @Exclude()
  refreshToken: string;
}
