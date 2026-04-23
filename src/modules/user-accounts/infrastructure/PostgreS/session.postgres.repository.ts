import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionPostgres } from '../../domain/PostgreS/session.postgres.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { ISessionRepository } from '../../../../core/repositories/ISessionRepository';
import { Session as SessionDomain } from '../../../../core/entities/user layer/session/session.entity';

@Injectable()
export class SessionsPostgresRepository implements ISessionRepository {
  constructor(
    @InjectRepository(SessionPostgres)
    private readonly sessionRepository: Repository<SessionPostgres>,
  ) {}
  //TODO: RAW SQL
  async save(session: SessionDomain): Promise<SessionDomain> {

  }

  async findSessionByUserId(userId: string): Promise<SessionDomain[]> {

  }

  async findByDeviceId(deviceId: string): Promise<SessionDomain> {

  }

  async deleteByDeviceId(deviceId: string): Promise<void> {

  }

  async deleteAllDevicesExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {

}
