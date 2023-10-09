import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly iso: string;

  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @IsNumber()
  @IsNotEmpty()
  readonly numberLength: number;

  @IsString()
  @IsNotEmpty()
  readonly flag: string;

  @IsString()
  @IsNotEmpty()
  readonly timeZone: string;

  @IsString()
  @IsNotEmpty()
  readonly currency: string;

  @IsBoolean()
  @IsNotEmpty()
  readonly isActive: boolean;
}
