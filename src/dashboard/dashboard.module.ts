import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ResponseService } from '../response/response.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, ResponseService],
})
export class DashboardModule {}
