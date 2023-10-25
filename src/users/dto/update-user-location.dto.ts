import { IsObject } from 'class-validator';

export class UpdateUserLocationDto {
  @IsObject()
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}
