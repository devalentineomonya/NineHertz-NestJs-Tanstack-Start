import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Pharmacy } from 'src/pharmacy/entity/pharmacy.entity';
@Entity()
@Index(['issueDate', 'expiryDate', 'isFulfilled'])
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  medicationDetails: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ default: false })
  isFulfilled: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions)
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.prescriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  prescribedBy: Doctor;

  @ManyToOne(() => Pharmacy, { nullable: true })
  fulfilledBy?: Pharmacy;
}
