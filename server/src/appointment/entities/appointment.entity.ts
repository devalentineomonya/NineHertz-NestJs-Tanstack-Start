import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { AppointmentStatus } from 'src/enums/appointment.enum';

export enum AppointmentType {
  VIRTUAL = 'virtual',
  PHYSICAL = 'physical',
}

// APPOINTMENT ENTITY
@Entity()
@Index(['datetime', 'status'])
export class Appointment {
  @Column({ type: 'timestamptz' })
  datetime: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    default: AppointmentType.PHYSICAL,
  })
  type: AppointmentType;

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
