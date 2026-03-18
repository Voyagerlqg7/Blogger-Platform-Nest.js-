import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailService } from '../external/email.service';

export class UserCreatedEvent {
  constructor(
    public userId: string,
    public email: string,
  ) {}
}

@EventsHandler(UserCreatedEvent)
export class SendConfirmationEmailHandler
  implements IEventHandler<UserCreatedEvent>
{
  constructor(private emailService: EmailService) {}

  async handle(event: UserCreatedEvent) {
    await this.emailService.sendMassage(event.userId, event.email);
  }
}
