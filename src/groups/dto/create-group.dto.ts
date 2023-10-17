// import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  //
  // @IsString()
  // readonly code: string;
  //
  // @IsNumber()
  // @IsOptional()
  // readonly zoom: number;
  //
  // @IsNumber()
  // @IsOptional()
  // readonly radius: number;
  //
  // @IsString()
  // @IsOptional()
  // readonly deep_link: string;
  //
  // @IsString()
  // @IsOptional()
  // readonly share_url: string;
  //
  // @IsBoolean()
  // readonly isActive: boolean;
}
