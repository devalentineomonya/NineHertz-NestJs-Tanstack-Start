import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacistDashboardController } from './pharmacist-dashboard.controller';
import { PharmacistDashboardService } from './pharmacist-dashboard.service';
import { Pharmacist } from 'src/pharmacist/entities/pharmacist.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { Order } from 'src/order/entities/order.entity';
import { InventoryItem } from 'src/inventory-item/entities/inventory-item.entity';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pharmacist,
      Prescription,
      Order,
      InventoryItem,
      Medicine,
      Notification,
    ]),
  ],
  controllers: [PharmacistDashboardController],
  providers: [PharmacistDashboardService],
  exports: [PharmacistDashboardService],
})
export class PharmacistDashboardModule {}
