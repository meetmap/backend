import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserRequestDto } from './dto';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  public async createUser(@Body() payload: CreateUserRequestDto) {
    return this.usersService.createUser(payload);
  }
}
