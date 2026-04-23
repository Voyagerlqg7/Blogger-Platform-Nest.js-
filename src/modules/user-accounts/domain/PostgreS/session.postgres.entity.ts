import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserPostgresEntity } from './user.postgres.entity';
import { Session as DomainSession } from '../../../../core/entities/user layer/session/session.entity';

@Entity('sessions')
export class SessionPostgres {
  @PrimaryGeneratedColumn('uuid')
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
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: UserPostgresEntity;

  // Метод для преобразования в доменную сущность
  toDomain(): DomainSession {
    return new DomainSession(
      this.id,
      this.userId,
      this.deviceId,
      this.ip,
      this.title,
      this.lasActiveDate,
      this.sessionExpiresAt,
    );
  }

  static fromDomain(domainSession: DomainSession): SessionPostgres {
    const entity = new SessionPostgres();
    entity.id = domainSession['id'];
    entity.userId = domainSession['userId'];
    entity.deviceId = domainSession['deviceId'];
    entity.ip = domainSession['ip'];
    entity.title = domainSession['title'];
    entity.lasActiveDate = domainSession['lastActiveDate'];
    entity.sessionExpiresAt = domainSession['sessionExpiresAt'];

    return entity;
  }
}
