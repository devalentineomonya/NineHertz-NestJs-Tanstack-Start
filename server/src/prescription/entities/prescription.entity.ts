import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Pharmacist } from 'src/pharmacist/entities/pharmacist.entity';

@Entity()
@Index(['issueDate', 'expiryDate', 'isFulfilled'])
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  items: {
    medicineId: string;
    dosage: string;
    frequency: string;
    note?: string;
  }[];

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

  @Column({ type: 'timestamp', nullable: true })
  fulfillmentDate?: Date;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions)
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.prescriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  prescribedBy: Doctor;

  @ManyToOne(() => Pharmacist, { nullable: true })
  fulfilledBy?: Pharmacist;

  @BeforeUpdate()
  updateFulfillmentDate() {
    if (this.fulfilledBy) {
      this.fulfillmentDate = new Date();
    }
  }
}
