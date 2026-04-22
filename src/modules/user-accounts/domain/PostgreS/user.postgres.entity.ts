// infrastructure/postgres/entities/user.postgres.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany, // Добавляем этот декоратор
} from 'typeorm';
import { User as DomainUser } from '../../../../core/entities/user layer/user/user.entity';
import { EmailConfirmationEntity } from '../../../../core/entities/user layer/user/email.confirmation.entity';
import { PasswordRecoverEntity } from '../../../../core/entities/user layer/user/password.recover.entity';
import { EmailConfirmationPostgresSchema } from './external-entities/email-confirmation.postgres.shema';
import { RecoverPasswordInfo } from './external-entities/recover-password.postgres.schema';
import { SessionPostgres } from './session.postgres.entity';

@Entity('users')
export class UserPostgresEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  passwordHash: string;

  @Column()
  passwordSalt: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(
    () => EmailConfirmationPostgresSchema,
    (emailConf) => emailConf.user,
    {
      cascade: true,
      eager: true,
      nullable: true,
    },
  )
  emailConfirmation: EmailConfirmationPostgresSchema;

  @OneToOne(() => RecoverPasswordInfo, (recoverInfo) => recoverInfo.user, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  recoverPasswordInfo: RecoverPasswordInfo;

  @OneToMany(() => SessionPostgres, (session) => session.user, {
    cascade: true, // Автоматически сохраняет/обновляет сессии
    eager: false,
  })
  sessions: SessionPostgres[];

  toDomain(): DomainUser {
    const emailConfirmationEntity = this.emailConfirmation
      ? new EmailConfirmationEntity(
          this.emailConfirmation.confirmationCode,
          this.emailConfirmation.expiresAt,
          this.emailConfirmation.isConfirmed,
        )
      : null;

    const recoverPasswordEntity = this.recoverPasswordInfo
      ? new PasswordRecoverEntity(
          this.recoverPasswordInfo.code,
          this.recoverPasswordInfo.expiresAt,
        )
      : null;

    return new DomainUser(
      this.id,
      this.login,
      this.email,
      this.passwordHash,
      this.passwordSalt,
      this.createdAt,
      this.updatedAt,
      this.deletedAt,
      emailConfirmationEntity,
      recoverPasswordEntity,
    );
  }

  static fromDomain(domainUser: DomainUser): UserPostgresEntity {
    const entity = new UserPostgresEntity();
    entity.id = domainUser['id'];
    entity.login = domainUser['login'];
    entity.email = domainUser['email'];
    entity.passwordHash = domainUser['passwordHash'];
    entity.passwordSalt = domainUser['passwordSalt'];
    entity.createdAt = domainUser['createdAt'];
    entity.updatedAt = domainUser['updatedAt'];
    entity.deletedAt = domainUser['deleteAt'];

    if (domainUser['emailConfirmation']) {
      entity.emailConfirmation = EmailConfirmationPostgresSchema.fromDomain(
        domainUser['emailConfirmation'],
        entity,
      );
    }

    if (domainUser['recoverPasswordInfo']) {
      entity.recoverPasswordInfo = RecoverPasswordInfo.fromDomain(
        domainUser['recoverPasswordInfo'],
        entity,
      );
    }

    return entity;
  }
}
