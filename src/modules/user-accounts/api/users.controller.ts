import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Body,
  Query,
} from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UserViewDto } from './view-dto/users.view-dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserViewDto> {
    return this.usersQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getAll(@Query() query: any): Promise<UserViewDto[]> {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.usersService.createUser(body);

    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
