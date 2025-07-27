import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { Prescription } from '../../prescription/entities/prescription.entity';
import { Order } from '../../order/entities/order.entity';
import { Review } from 'src/appointment/entities/review.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'jsonb', nullable: true })
  medicalHistory: Record<string, any>;

  @Index()
  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @OneToOne(() => User, (user) => user.patientProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Appointment, (appointment) => appointment.patient, {})
  appointments: Appointment[];

  @OneToMany(() => Prescription, (prescription) => prescription.patient, {})
  prescriptions: Prescription[];

  @OneToMany(() => Order, (order) => order.patient, {})
  orders: Order[];

  @OneToMany(() => Review, (review) => review.patient)
  reviews: Review[];
}
