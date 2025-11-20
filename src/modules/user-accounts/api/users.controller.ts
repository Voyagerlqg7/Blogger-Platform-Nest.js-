import { Controller, Get, Post, Delete, Param, HttpCode, HttpStatus, Body, Query } from '@nestjs/common';
import { CreateUserInputDto } from '../dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(
        //private usersQueryRepository: UsersQueryRepository,
        //private usersService: UsersService,
    ) {}
    @Get()
    async getAllUsers(@Query() query: any){
    }
    @Get(':id')
    async getById(@Param('id') id: string) {
    }
    @Post()
    async createUser(@Body() body: CreateUserInputDto){

    }
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param('id') id: string){

    }
}