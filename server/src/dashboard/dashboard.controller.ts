import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Public } from 'src/auth/decorators/public.decorators';

@Public()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  async getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }
}
