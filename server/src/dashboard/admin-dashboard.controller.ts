import { Controller, Get } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';

@Roles(Role.ADMIN)
@Controller('dashboard/admin')
export class DashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  async getAdminDashboard() {
    return this.adminDashboardService.getAdminDashboard();
  }
}
