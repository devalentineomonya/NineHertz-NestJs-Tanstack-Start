import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { PatientDashboardService } from './patient-dashboard.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { RequestWithUser } from 'src/shared/types/request.types';

@Controller('dashboard/patient')
@Roles(Role.PATIENT)
export class PatientDashboardController {
  constructor(private readonly dashboardService: PatientDashboardService) {}

  @Get()
  async getDashboard(@Req() req: RequestWithUser) {
    return this.dashboardService.getDashboardData(req.user.sub);
  }

  @Patch('notifications/:id/read')
  async markNotificationAsRead(@Param('id') id: string) {
    return await this.dashboardService.markNotificationAsRead(id);
  }

  @Patch('notifications/read-all')
  async markAllNotificationsAsRead(@Req() req: RequestWithUser) {
    return await this.dashboardService.markAllNotificationsAsRead(req.user.sub);
  }
}
