import { InjectModel } from '@nestjs/mongoose';
import { UsersMongoRepository } from '../../../infrastructure/Mongo/users.mongo.repository';
import { PasswordService } from '../../external/password.service';
import { registrationUserDTO } from '../../../dto/auth_dto/registration.dto';
import { UserViewDto } from '../../../api/view-dto/users.view-dto';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exceptions';
import type { UserModelType } from '../../../domain/Mongo/user.mongo.entity';
import { User } from '../../../domain/Mongo/user.mongo.entity';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../../Events/SendConfirmationMessage';

export class CreateUserCommand {
  constructor(public dto: registrationUserDTO) {}
}

@CommandHandler(CreateUserCommand)
export class UseCase_RegisterUser
  implements ICommandHandler<CreateUserCommand, UserViewDto>
{
  constructor(
    private usersRepository: UsersMongoRepository,
    private passwordService: PasswordService,
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    private eventBus: EventBus,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<UserViewDto> {
    const errors: Extension[] = [];

    const existingUser = await this.usersRepository.findByLoginOrEmail(
      dto.login,
    );
    if (existingUser) {
      errors.push(
        new Extension('User with this login already exists', 'login'),
      );
    }

    const existingEmail = await this.usersRepository.findByLoginOrEmail(
      dto.email,
    );
    if (existingEmail) {
      errors.push(
        new Extension('User with this email already exists', 'email'),
      );
    }

    if (errors.length > 0) {
      throw DomainException.validationFailed(errors);
    }
    const salt = await this.passwordService.generatePasswordSalt();
    const hash = await this.passwordService.generateHash(dto.password, salt);
    const user = this.userModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: hash,
      passwordSalt: salt,
      isConfirmed: false,
    });

    await this.usersRepository.save(user);

    this.eventBus.publish(
      new UserCreatedEvent(user._id.toString(), user.email),
    );

    return UserViewDto.mapToView(user);
  }
}
