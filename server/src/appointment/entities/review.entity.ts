import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'int' })
  rating: number;

  @ManyToOne(() => Appointment, (appointment) => appointment.reviews)
  @JoinColumn()
  appointment: Appointment;

  @ManyToOne(() => Patient, (patient) => patient.reviews)
  @JoinColumn()
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.reviews)
  @JoinColumn()
  doctor: Doctor;

  @CreateDateColumn()
  createdAt: Date;
}
