import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { User } from 'src/user/entities/user.entity';

export enum Gateway {
  PAYSTACK = 'paystack',
  STRIPE = 'stripe',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  ABANDONED = 'abandoned',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column()
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Gateway fields
  @Column({ type: 'enum', enum: Gateway })
  gateway: Gateway;

  @Column()
  gatewayReference: string;

  @Column({ nullable: true })
  gatewayFees: number;

  @Column({ nullable: true })
  accessCode?: string;

  @Column({ nullable: true })
  checkoutUrl?: string;

  @Column({ nullable: true })
  processedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  gatewayResponse?: Record<string, any>;

  // Relationships
  @ManyToOne(() => Order, (order) => order.transactions, { nullable: true })
  order: Order;

  @ManyToOne(() => Appointment, (appointment) => appointment.transactions, {
    nullable: true,
  })
  appointment: Appointment;

  @ManyToOne(() => User, (user) => user.transactions, { nullable: false })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  paidAt: Date;

  // Additional fields
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  refundReason: string;
}
