// import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FamilyRoles } from '../enums/family-roles';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEnum(FamilyRoles)
  @IsNotEmpty()
  readonly groupOwnerFamilyRole: FamilyRoles;

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
