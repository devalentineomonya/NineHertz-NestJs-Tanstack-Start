import { OrderStatus } from 'src/enums/order.enum';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { OrderItem } from './order-item.entity';

@Entity()
@Index(['status', 'orderDate'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];

  @ManyToOne(() => Patient, (patient) => patient.orders)
  patient: Patient;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
