import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { Admin } from '../../admin/entities/admin.entity';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  passwordHash?: string;

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({
    type: 'enum',
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  })
  role: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
  @OneToOne(() => Patient, (patient) => patient.user, { cascade: true })
  @JoinColumn()
  patientProfile?: Patient;

  @OneToOne(() => Doctor, (doctor) => doctor.user, { cascade: true })
  @JoinColumn()
  doctorProfile?: Doctor;

  @OneToOne(() => Admin, (admin) => admin.user, { cascade: true })
  @JoinColumn()
  adminProfile?: Admin;
}
