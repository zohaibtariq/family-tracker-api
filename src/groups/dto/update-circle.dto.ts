import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class UpdateCircleDto {
  @IsObject()
  circleCenter: {
    latitude: number;
    longitude: number;
  };

  @IsNumber()
  circleRadius: string;

  @IsNumber()
  circleValidTillHours: number;

  @IsOptional()
  circleValidTill: Date;

  @IsOptional()
  circleUpdatedAt: Date;
}
