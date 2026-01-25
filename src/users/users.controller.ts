import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { CreateEmployeeDto } from './dtos/create-employee';
import { RotatePasswordDto } from './dtos/rotate-password';
import { type Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { User } from '@prisma/client';
import { RoleChangeDto } from './dtos/role-change';

@Controller('employee')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createEmployee(
    @Body() body: CreateEmployeeDto,
    @Session() session: UserSession,
  ) {
    return await this.usersService.createEmployee(body, session.user as User);
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

  @Patch(':id/role')
  async roleChange(
    @Body() body: RoleChangeDto,
    @Session() session: UserSession,
    @Param('id') id: string,
  ) {
    return await this.usersService.roleChange(
      id,
      body.newRole,
      session.user as User,
      body.warehouseId,
    );
  }
}
