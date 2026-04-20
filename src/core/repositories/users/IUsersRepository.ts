import { User } from '../../entities/user layer/user/user.entity';

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;

  findOrNotFoundFail(id: string): Promise<User>;

  findByLoginOrEmail(loginOrEmail: string): Promise<User | null>;

  findByCodeConfirmation(confirmationCode: string): Promise<User | null>;

  findByRecoverPasswordCode(recover_code: string): Promise<User | null>;
}
