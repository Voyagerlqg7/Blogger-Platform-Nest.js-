import { User as DomainUser } from '../entities/user layer/user/user.entity';

export interface IUsersRepository {
  findById(id: string): Promise<DomainUser | null>;

  findOrNotFoundFail(id: string): Promise<DomainUser>;

  findByLoginOrEmail(loginOrEmail: string): Promise<DomainUser | null>;

  findByCodeConfirmation(confirmationCode: string): Promise<DomainUser | null>;

  findByRecoverPasswordCode(recoverCode: string): Promise<DomainUser | null>;

  save(domainUser: DomainUser): Promise<void>;

  create(domainUser: DomainUser): Promise<void>;
}
