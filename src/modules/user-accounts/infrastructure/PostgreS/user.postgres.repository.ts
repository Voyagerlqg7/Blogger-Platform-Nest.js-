import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUsersRepository } from '../../../../core/repositories/users/IUsersRepository';
import { UserPostgresEntity } from '../../domain/PostgreS/user.postgres.entity';
import { User as DomainUser } from '../../../../core/entities/user layer/user/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class PostgresUsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserPostgresEntity)
    private readonly userRepository: Repository<UserPostgresEntity>,
  ) {}

  async findById(id: string): Promise<DomainUser | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['emailConfirmation', 'recoverPasswordInfo'],
    });

    return userEntity ? userEntity.toDomain() : null;
  }

  async findOrNotFoundFail(id: string): Promise<DomainUser> {
    const user = await this.findById(id);
    if (!user) {
      throw DomainException.notFound(`User with id ${id} not found`);
    }
    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<DomainUser | null> {
    const userEntity = await this.userRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
      relations: ['emailConfirmation', 'recoverPasswordInfo'],
    });

    return userEntity ? userEntity.toDomain() : null;
  }

  async findByCodeConfirmation(
    confirmationCode: string,
  ): Promise<DomainUser | null> {
    const userEntity = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .where('emailConfirmation.confirmationCode = :code', {
        code: confirmationCode,
      })
      .getOne();

    return userEntity ? userEntity.toDomain() : null;
  }

  async findByRecoverPasswordCode(
    recoverCode: string,
  ): Promise<DomainUser | null> {
    const userEntity = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.recoverPasswordInfo', 'recoverInfo')
      .where('recoverInfo.code = :code', { code: recoverCode })
      .getOne();

    return userEntity ? userEntity.toDomain() : null;
  }

  async save(domainUser: DomainUser): Promise<void> {
    const userEntity = UserPostgresEntity.fromDomain(domainUser);
    await this.userRepository.save(userEntity);
  }

  async create(domainUser: DomainUser): Promise<void> {
    const userEntity = UserPostgresEntity.fromDomain(domainUser);
    await this.userRepository.insert(userEntity);
  }
}
