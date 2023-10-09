import { Module } from '@nestjs/common';
import { ResponseService } from './response.service';

@Module({
  controllers: [],
  providers: [ResponseService],
  exports: [ResponseService],
})
export class ResponseModule {}
