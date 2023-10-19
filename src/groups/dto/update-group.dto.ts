import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  circleCenter: {
    latitude: number;
    longitude: number;
  };

  @IsOptional()
  @IsNumber()
  circleRadius: string;
}
