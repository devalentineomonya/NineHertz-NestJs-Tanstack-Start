import { Controller, Get, Req } from '@nestjs/common';
import { PharmacistDashboardService } from './pharmacist-dashboard.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { RequestWithUser } from 'src/shared/types/request.types';

@Controller('dashboard/pharmacist')
@Roles(Role.PHARMACIST)
export class PharmacistDashboardController {
  constructor(
    private readonly pharmacistDashboardService: PharmacistDashboardService,
  ) {}

  @Get()
  async getDashboardData(@Req() req: RequestWithUser) {
    return this.pharmacistDashboardService.getDashboardData(req.user.sub);
  }
}
