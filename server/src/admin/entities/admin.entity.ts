import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({
    type: 'enum',
    enum: ['super', 'institution', 'support'],
    default: 'institution',
  })
  adminType: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.adminProfile)
  user: User;

  @Column()
  specialty: string;

  @Column('simple-json')
  availability: {
    days: string[];
    hours: string[];
  };

  @Column('decimal', { precision: 10, scale: 2 })
  consultationFee: number;

  @Column()
  licenseNumber: string;

  @Column()
  userEmail: string;
}
