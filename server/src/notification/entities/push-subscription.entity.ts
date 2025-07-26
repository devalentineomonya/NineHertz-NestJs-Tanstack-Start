import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('push-subscriptions')
@Index(['userId', 'endpoint'], { unique: true })
export class PushSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ length: 500 })
  endpoint: string;

  @Column({ length: 500 })
  p256dhKey: string;

  @Column({ length: 500 })
  authKey: string;

  @CreateDateColumn()
  createdAt: Date;
}
