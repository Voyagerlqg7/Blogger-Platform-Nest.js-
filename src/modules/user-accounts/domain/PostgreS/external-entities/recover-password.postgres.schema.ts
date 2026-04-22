import {
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { UserPostgresEntity } from '../user.postgres.entity';
import { PasswordRecoverEntity } from '../../../../../core/entities/user layer/user/password.recover.entity';

@Entity()
export class RecoverPasswordInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  code: string | null;

  @Column({ nullable: true })
  expiresAt: Date | null;

  @OneToOne(() => UserPostgresEntity, (user) => user.recoverPasswordInfo)
  @JoinColumn()
  user: UserPostgresEntity;

  static fromDomain(
    domainEntity: PasswordRecoverEntity,
    user: UserPostgresEntity,
  ): RecoverPasswordInfo {
    const schema = new RecoverPasswordInfo();
    schema.code = domainEntity.code;
    schema.expiresAt = domainEntity.expiresAt;
    schema.user = user;
    return schema;
  }
}
