import { IsNotEmpty } from 'class-validator';

export class CreateSettingsDto {
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  value: any;
}
