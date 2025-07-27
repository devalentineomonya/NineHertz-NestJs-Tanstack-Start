import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { Prescription } from '../../prescription/entities/prescription.entity';
import { Review } from 'src/appointment/entities/review.entity';

@Entity()
@Index(['specialty', 'status'])
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  specialty: string;

  @Column({ default: 'Etc/GMT-3' })
  timezone: string;

  @Column({ type: 'jsonb' })
  availability: { days: string[]; hours: string[] };

  @Column({ type: 'decimal' })
  appointmentFee: number;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    type: 'varchar',
    default: 'active',
    enum: ['active', 'inactive'],
  })
  status: 'active' | 'inactive';

  @OneToOne(() => User, (user) => user.doctorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  appointments: Appointment[];

  @OneToMany(() => Review, (review) => review.doctor)
  reviews: Review[];

  @OneToMany(() => Prescription, (prescription) => prescription.prescribedBy, {
    cascade: true,
  })
  prescriptions: Prescription[];
}
