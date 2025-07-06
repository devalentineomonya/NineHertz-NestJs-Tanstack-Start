import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Medicine } from '../../medicine/entities/medicine.entity';
import { Pharmacy } from 'src/pharmacy/entity/pharmacy.entity';

@Entity()
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column()
  reorderThreshold: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastRestocked: Date;

  @ManyToOne(() => Medicine, (medicine) => medicine.inventoryItems)
  medicine: Medicine;

  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.inventory)
  pharmacy: Pharmacy;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
