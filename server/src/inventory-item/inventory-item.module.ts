import { Module } from '@nestjs/common';
import { InventoryItemService } from './inventory-item.service';
import { InventoryItemController } from './inventory-item.controller';
import { InventoryItem } from './entities/inventory-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { Pharmacy } from 'src/pharmacy/entity/pharmacy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, Medicine, Pharmacy])],
  controllers: [InventoryItemController],
  providers: [InventoryItemService],
})
export class InventoryItemModule {}
