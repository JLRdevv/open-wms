import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminGuard } from 'src/guards/admin';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { CreateEmployeeDto } from './dtos/create-employee';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AdminGuard)
  @Post('employee')
  async createEmployee(
    @Body() body: CreateEmployeeDto,
    @Session() session: UserSession,
  ) {
    return await this.usersService.createEmployee(body, session.user.id);
  }
}
