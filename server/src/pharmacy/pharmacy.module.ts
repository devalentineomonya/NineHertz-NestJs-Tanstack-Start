import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { Pharmacy } from './entity/pharmacy.entity';
import { InventoryItem } from 'src/inventory-item/entities/inventory-item.entity';
import { Order } from 'src/order/entities/order.entity';
import { Pharmacist } from 'src/pharmacist/entities/pharmacist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pharmacy, InventoryItem, Order, Pharmacist]),
  ],
  controllers: [PharmacyController],
  providers: [PharmacyService],
  exports: [PharmacyService],
})
export class PharmacyModule {}
