import { PartialType } from '@nestjs/mapped-types';
import { VerifyOtpDto } from './verify-otp.dto';

export class UpdateVerifyOtpDto extends PartialType(VerifyOtpDto) {}
