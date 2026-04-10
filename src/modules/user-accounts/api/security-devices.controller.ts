import {
  Controller,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllDevicesQuery } from '../application/UseCases/Security/UseCase_GetAllDevices';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { RefreshToken } from '../../../core/decorators/refresh-token.decorator';
import { UserViewDto } from './view-dto/users.view-dto';
import { DeleteDeviceCommand } from '../application/UseCases/Security/UseCase_DeleteSessionById';
import { DeleteAllDevicesCommand } from '../application/UseCases/Security/UseCase_DeleteAllSessionsExcludeCurrent';
import { RefreshTokenGuard } from '../../../core/guards/refresh-token.guard';
import { SessionViewDto } from './view-dto/session.view-dto';

@Controller('security')
@UseGuards(RefreshTokenGuard)
export class SecurityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAllDevices(
    @RefreshToken() refreshToken: string,
    @CurrentUser() user: UserViewDto,
  ): Promise<SessionViewDto[]> {
    const query = new GetAllDevicesQuery(refreshToken, user.id);
    return await this.queryBus.execute(query);
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateAllDevicesExceptCurrent(
    @RefreshToken() refreshToken: string,
    @CurrentUser() user: UserViewDto,
  ) {
    const command = new DeleteAllDevicesCommand(refreshToken, user.id);
    await this.commandBus.execute(command);
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateDeviceById(
    @RefreshToken() refreshToken: string,
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: UserViewDto,
  ) {
    const command = new DeleteDeviceCommand(refreshToken, deviceId, user.id);
    await this.commandBus.execute(command);
  }
}
