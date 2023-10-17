import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class JoinGroupDto {
  @IsString()
  @IsNotEmpty()
  readonly groupId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  readonly userId: Types.ObjectId;
}
