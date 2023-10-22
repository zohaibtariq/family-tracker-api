import { IsNotEmpty, IsString } from 'class-validator';

export class JoinGroupCodeDto {
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
