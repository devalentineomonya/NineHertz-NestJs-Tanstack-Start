import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToMany,
} from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Pharmacist } from 'src/pharmacist/entities/pharmacist.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  PHARMACIST = 'pharmacist',
}

@Entity()
@Index(['role', 'isEmailVerified'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  passwordHash?: string;

  @Column({ nullable: true, select: false })
  otpHash?: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiry?: Date;

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({
    type: 'enum',
    enum: ['patient', 'doctor', 'admin', 'pharmacist'],
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
  patientProfile?: Patient;

  @OneToOne(() => Doctor, (doctor) => doctor.user, {
    onDelete: 'CASCADE',
  })
  doctorProfile?: Doctor;

  @OneToOne(() => Admin, (admin) => admin.user, { cascade: true })
  adminProfile?: Admin;

  @OneToOne(() => Pharmacist, (pharmacist) => pharmacist.user, {
    cascade: true,
  })
  pharmacistProfile?: Pharmacist;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return this.passwordHash
      ? await bcrypt.compare(attempt, this.passwordHash)
      : false;
  }

  async setOtp(otp: string, expiresInMinutes = 30) {
    const salt = await bcrypt.genSalt(10);
    this.otpHash = await bcrypt.hash(otp, salt);

    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiresInMinutes);
    this.otpExpiry = expiryDate;
  }

  clearOtp() {
    this.otpHash = undefined;
    this.otpExpiry = undefined;
  }
}
