import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { SessionModelType } from '../../../domain/session.entity';
import { Session } from '../../../domain/session.entity';
import { SessionRepository } from '../../../infrastructure/sessions.repository';
import { CreateSessionDto } from '../../../dto/auth_dto/create-session.dto';

@Injectable()
export class UseCase_CreateSession {
  constructor(
    private readonly sessionRepository: SessionRepository,
    @InjectModel(Session.name)
    private readonly sessionModel: SessionModelType,
  ) {}

  async execute(dto: CreateSessionDto): Promise<void> {
    const session = this.sessionModel.createInstance(dto, 20_000);
    await this.sessionRepository.save(session);
  }
}
