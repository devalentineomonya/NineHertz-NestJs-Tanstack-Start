import { InventoryItem } from 'src/inventory-item/entities/inventory-item.entity';
import { Order } from 'src/order/entities/order.entity';
import { Pharmacist } from 'src/pharmacist/entities/pharmacist.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  contactPhone: string;

  @Column()
  licenseNumber: string;

  @OneToMany(() => InventoryItem, (item) => item.pharmacy)
  inventory: InventoryItem[];

  @OneToMany(() => Order, (order) => order.pharmacy)
  orders: Order[];

  @OneToMany(() => Pharmacist, (pharmacist) => pharmacist.pharmacy)
  pharmacists: Pharmacist[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
