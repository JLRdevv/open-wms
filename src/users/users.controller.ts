import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { CreateEmployeeDto } from './dtos/create-employee';
import { RotatePasswordDto } from './dtos/rotate-password';
import { type Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { ManagerLevelGuard } from 'src/guards/manager-level';

@Controller('employees')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(ManagerLevelGuard)
  @Post('create')
  async createEmployee(
    @Body() body: CreateEmployeeDto,
    @Session() session: UserSession,
  ) {
    return await this.usersService.createEmployee(body, session.user.id);
  }

  @Post('rotate-password')
  async rotatePassword(
    @Body() body: RotatePasswordDto,
    @Session() session: UserSession,
    @Req() req: Request,
  ) {
    const sessionHeaders = fromNodeHeaders(req.headers);

    return await this.usersService.rotatePassword(
      body,
      session,
      sessionHeaders,
    );
  }
}
