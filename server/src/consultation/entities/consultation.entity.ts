import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Doctor } from '../../doctor/entities/doctor.entity';

export enum ConsultationStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in progress',
  CANCELLED = 'cancelled',
  SCHEDULED = 'scheduled',
}

@Entity()
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  videoSessionId: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis: Record<string, any>;

  @ManyToOne(() => Patient, (patient) => patient.consultations)
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.consultations)
  doctor: Doctor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index()
  @Column({
    type: 'enum',
    enum: ConsultationStatus,
    default: ConsultationStatus.SCHEDULED,
  })
  status: ConsultationStatus;
}
