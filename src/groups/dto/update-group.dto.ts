import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';
import { Exclude } from 'class-transformer';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @Exclude()
  name: string;
}
