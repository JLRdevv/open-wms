import {
  Body,
  Controller,
  Delete,
  Get,
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
import { UpdateEmployeeDto } from './dtos/update-employee';
import { AssignWarehouseDto } from './dtos/assign-warehouse';
import { PasswordRotationGuard } from 'src/common/guards/passwordRotation';
import { NoRotate } from 'src/common/decorators/no-rotate';

@UseGuards(PasswordRotationGuard)
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

  @NoRotate()
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

  @Patch(':id')
  async updateEmployee(
    @Body() body: UpdateEmployeeDto,
    @Param('id') id: string,
    @Session() session: UserSession,
  ) {
    return await this.usersService.updateEmployee(
      body,
      id,
      session.user as User,
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

  @Delete(':id')
  async deleteEmployee(
    @Param('id') id: string,
    @Session() session: UserSession,
  ) {
    return await this.usersService.deleteEmployee(id, session.user as User);
  }

  @Get(':id')
  async getEmployeeById(
    @Param('id') id: string,
    @Session() session: UserSession,
  ) {
    return await this.usersService.getEmployeeById(id, session.user as User);
  }

  @Get(':id/warehouses')
  async getWarehousesByEmployee(
    @Param('id') id: string,
    @Session() session: UserSession,
  ) {
    return await this.usersService.getWarehousesByEmployee(
      id,
      session.user as User,
    );
  }

  @Post(':employeeId/warehouses/:warehouseId')
  async assignToWarehouse(
    @Param() params: AssignWarehouseDto,
    @Session() session: UserSession,
  ) {
    return await this.usersService.assignToWarehouse(
      params.employeeId,
      params.warehouseId,
      session.user as User,
    );
  }

  @Delete(':employeeId/warehouses/:warehouseId')
  async unassignFromWarehouse(
    @Param() params: AssignWarehouseDto,
    @Session() session: UserSession,
  ) {
    return await this.usersService.unassignFromWarehouse(
      params.employeeId,
      params.warehouseId,
      session.user as User,
    );
  }
}
