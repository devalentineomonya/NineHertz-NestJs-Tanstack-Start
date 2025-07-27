import { Doctor } from 'src/doctor/entities/doctor.entity';
import { AppointmentStatus } from 'src/enums/appointment.enum';
import { Patient } from 'src/patient/entities/patient.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Review } from './review.entity';

export enum AppointmentType {
  CONSULTATION = 'consultation',
  CHECKUP = 'checkup',
  FOLLOW_UP = 'follow_up',
}

export enum AppointmentMode {
  PHYSICAL = 'physical',
  VIRTUAL = 'virtual',
}

@Entity()
@Index(['datetime', 'status'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  datetime: Date;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @Column({ type: 'int', default: 30 })
  duration: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.CONSULTATION,
  })
  type: AppointmentType;

  @Column({
    type: 'enum',
    enum: AppointmentMode,
    default: AppointmentMode.PHYSICAL,
  })
  mode: AppointmentMode;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', nullable: true })
  videoSessionId?: string | null;

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  // ADDED: Transaction relationship
  @OneToMany(() => Transaction, (transaction) => transaction.appointment)
  transactions: Transaction[];

  @OneToMany(() => Review, (review) => review.appointment)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
