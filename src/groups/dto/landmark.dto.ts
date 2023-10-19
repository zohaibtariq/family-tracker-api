import { IsNotEmpty, IsNumber } from 'class-validator';

export class LandmarkDto {
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;
}
