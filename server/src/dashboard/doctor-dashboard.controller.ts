import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DoctorDashboardService } from './doctor-dashboard.service';
import { Roles } from 'src/auth/decorators/roles.decorators';

import { RequestWithUser } from 'src/shared/types/request.types';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Doctor Dashboard')
@ApiBearerAuth()
@Controller('dashboard/doctor')
@Roles(Role.DOCTOR)
export class DoctorDashboardController {
  constructor(
    private readonly doctorDashboardService: DoctorDashboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get doctor dashboard data',
    description:
      'Retrieve comprehensive dashboard data for the authenticated doctor including stats, appointments, patients, and notifications',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found',
  })
  async getDashboard(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return await this.doctorDashboardService.getDashboardData(userId);
  }
}
