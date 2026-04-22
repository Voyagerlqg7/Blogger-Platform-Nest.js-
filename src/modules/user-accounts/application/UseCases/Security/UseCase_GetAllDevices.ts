import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionViewDto } from '../../../api/view-dto/session.view-dto';
import { SessionRepository } from '../../../infrastructure/sessions.mongo.repository';

export class GetAllDevicesQuery {
  constructor(
    public refreshToken: string,
    public userId: string,
  ) {}
}

@QueryHandler(GetAllDevicesQuery)
export class UseCase_GetAllDevices
  implements IQueryHandler<GetAllDevicesQuery, SessionViewDto[]>
{
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(query: GetAllDevicesQuery): Promise<SessionViewDto[]> {
    const sessions = await this.sessionRepository.findSessionsByUserId(
      query.userId,
    );

    return sessions.map((session) => SessionViewDto.mapToView(session));
  }
}
