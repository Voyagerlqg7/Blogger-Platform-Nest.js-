import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserPostgresEntity } from '../user.postgres.entity';
import { EmailConfirmationEntity } from '../../../../../core/entities/user layer/user/email.confirmation.entity';

@Entity()
export class EmailConfirmationPostgresSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  confirmationCode: string | null;

  @Column({ nullable: true })
  expiresAt: Date | null;

  @Column({ nullable: true })
  isConfirmed: boolean | null;

  @OneToOne(() => UserPostgresEntity, (user) => user.emailConfirmation)
  @JoinColumn()
  user: UserPostgresEntity;

  static fromDomain(
    domainEntity: EmailConfirmationEntity,
    user: UserPostgresEntity,
  ): EmailConfirmationPostgresSchema {
    const schema = new EmailConfirmationPostgresSchema();
    schema.confirmationCode = domainEntity.confirmationCode;
    schema.expiresAt = domainEntity.expiresAt;
    schema.isConfirmed = domainEntity.isConfirmed;
    schema.user = user;
    return schema;
  }
}
