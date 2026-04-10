import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../infrastructure/sessions.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Session, type SessionModelType } from '../../domain/session.entity';
import { CreateSessionDto } from '../../dto/auth_dto/create-session.dto';

export class UserLoggedInEvent {
  constructor(public dto: CreateSessionDto) {}
}

@EventsHandler(UserLoggedInEvent)
export class UseCase_CreateSessionHandler
  implements IEventHandler<UserLoggedInEvent>
{
  constructor(
    private readonly sessionRepository: SessionRepository,
    @InjectModel(Session.name)
    private readonly sessionModel: SessionModelType,
  ) {}

  async handle({ dto }: UserLoggedInEvent): Promise<void> {
    const session = this.sessionModel.createInstance(dto, 50_000);
    await this.sessionRepository.save(session);
  }
}
