import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserPostgresEntity } from './user.postgres.entity';

@Entity()
export class SessionPostgres {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  userId: string;
  @Column()
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lasActiveDate: Date;
  @Column()
  sessionExpiresAt: Date;

  @ManyToOne(() => UserPostgresEntity, (user) => user.sessions, {
    onDelete: 'CASCADE', // При удалении пользователя, удаляются все его сессии
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: UserPostgresEntity;
}
