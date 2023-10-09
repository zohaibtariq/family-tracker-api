import { IsNotEmpty, IsString } from 'class-validator';

export class CreateScreenDto {
  @IsString()
  @IsNotEmpty()
  readonly slug: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
