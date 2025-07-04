import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { Consultation } from '../../consultation/entities/consultation.entity';
import { Prescription } from '../../prescription/entities/prescription.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  specialty: string;

  @Column({ type: 'jsonb' })
  availability: { days: string[]; hours: string[] };

  @Column({ type: 'decimal' })
  consultationFee: number;

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
  @OneToOne(() => User, (user) => user.doctorProfile)
  user: User;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => Consultation, (consultation) => consultation.doctor)
  consultations: Consultation[];

  @OneToMany(() => Prescription, (prescription) => prescription.prescribedBy)
  prescriptions: Prescription[];
}
