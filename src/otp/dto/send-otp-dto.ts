import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendOtpDto {
  @IsOptional()
  countryCode: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
