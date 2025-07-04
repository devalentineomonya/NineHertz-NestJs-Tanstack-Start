import { Module } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { Medicine } from './entities/medicine.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from 'src/inventory-item/entities/inventory-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, InventoryItem])],
  controllers: [MedicineController],
  providers: [MedicineService],
})
export class MedicineModule {}
