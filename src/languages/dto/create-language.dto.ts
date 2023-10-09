import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LanguageDirection } from '../enums/language-directions';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEnum(LanguageDirection)
  @IsNotEmpty()
  readonly direction: LanguageDirection;

  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
