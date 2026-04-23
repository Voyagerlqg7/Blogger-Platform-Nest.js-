import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUsersRepository } from '../../../../core/repositories/IUsersRepository';
import { UserPostgresEntity } from '../../domain/PostgreS/user.postgres.entity';
import { User as DomainUser } from '../../../../core/entities/user layer/user/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class PostgresUsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserPostgresEntity)
    private readonly userRepository: Repository<UserPostgresEntity>,
  ) {}
  //TODO: RAW SQL

  async findById(id: string): Promise<DomainUser | null> {

  }

  async findOrNotFoundFail(id: string): Promise<DomainUser> {

  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<DomainUser | null> {

  }

  async findByCodeConfirmation(
    confirmationCode: string,
  ): Promise<DomainUser | null> {

  }

  async findByRecoverPasswordCode(
    recoverCode: string,
  ): Promise<DomainUser | null> {

  }

  async save(domainUser: DomainUser): Promise<void> {

  }

  async create(domainUser: DomainUser): Promise<void> {

  }
}
