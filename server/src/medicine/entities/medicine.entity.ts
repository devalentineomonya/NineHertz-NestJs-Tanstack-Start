import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { InventoryItem } from '../../inventory-item/entities/inventory-item.entity';
import { OrderItem } from '../../order/entities/order-item.entity';

@Entity()
@Index(['name', 'genericName'])
export class Medicine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  genericName: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  price: number;

  @Column()
  manufacturer: string;

  @Column({ nullable: true, unique: true })
  barcode: string;

  @OneToMany(() => InventoryItem, (item) => item.medicine)
  inventoryItems: InventoryItem[];

  @OneToMany(() => OrderItem, (item) => item.medicine)
  orderItems: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
