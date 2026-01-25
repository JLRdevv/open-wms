import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dtos/create-employee';
import { UserUtils } from './user.utils';
import { auth } from 'src/lib/auth/auth';
import { Role, User } from '@prisma/client';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { RotatePasswordDto } from './dtos/rotate-password';
import { PrismaService } from 'src/prisma/prisma.service';
import { canManageRole, RoleLevel } from 'src/lib/auth/role.util';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createEmployee(newEmployee: CreateEmployeeDto, currentUser: User) {
    if (!canManageRole(currentUser.role, newEmployee.role)) {
      throw new UnauthorizedException(
        `You do not have permission to create users with the role ${newEmployee.role}.`,
      );
    }

    let registerToWarehouse = false;
    if (RoleLevel[newEmployee.role] <= RoleLevel[Role.MANAGER]) {
      if (!newEmployee.warehouseId) {
        throw new BadRequestException(
          `The role ${newEmployee.role} requires the employee to be assigned to at least one warehouse, provide a warehouseId.`,
        );
      }
      registerToWarehouse = true;
    }

    UserUtils.passwordValidation(newEmployee.password, newEmployee.role);

    // Email not required for operators
    if (newEmployee.role !== Role.OPERATOR)
      if (!newEmployee.email)
        throw new BadRequestException(
          `Email is required for ${newEmployee.role} role.`,
        );

    const email = newEmployee.email || `${newEmployee.username}@local.com`;

    try {
      await this.prisma.$transaction(async () => {
        const signUpResponse = await auth.api.signUpEmail({
          body: {
            email,
            password: newEmployee.password,
            name: newEmployee.name,
            role: newEmployee.role,
            username: newEmployee.username,
            createdBy: currentUser.id,
          },
          headers: new Headers({
            [process.env.INTERNAL_HEADER_NAME!]: process.env.INTERNAL_SECRET!,
          }),
        });
        if (registerToWarehouse) {
          await this.usersRepository.connectWarehouse(
            signUpResponse.user.id,
            newEmployee.warehouseId!,
          );
        }
      });
      return { success: true, message: 'Employee created successfully.' };
    } catch (error) {
      this.logger.error('Error creating employee', error);
      throw new InternalServerErrorException();
    }
  }

  async rotatePassword(
    body: RotatePasswordDto,
    session: UserSession,
    headers: Headers,
  ) {
    const user = session.user as User;

    if (!user.shouldRotatePassword) {
      throw new BadRequestException(
        'You are not allowed to rotate your password.',
      );
    }

    UserUtils.passwordValidation(body.newPassword, user.role);

    try {
      await Promise.all([
        auth.api.changePassword({
          body: {
            currentPassword: body.currentPassword,
            newPassword: body.newPassword,
          },
          headers,
        }),
        this.usersRepository.enableRotatePassword(user.id),
      ]);

      return {
        success: true,
        message: 'Password changed successfully.',
      };
    } catch (error) {
      this.logger.error('Error rotating password', error);
      throw new InternalServerErrorException();
    }
  }

  async roleChange(
    employeeId: string,
    newRole: Role,
    user: User,
    warehouseId?: number,
  ) {
    //no changing your own role
    if (employeeId === user.id) {
      throw new BadRequestException('You cannot change your own role.');
    }

    const employee = await this.usersRepository.findById(employeeId, {
      warehouses: true,
    });

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    if (!canManageRole(user.role, employee.role)) {
      throw new UnauthorizedException(
        `You do not have permission to reassign this user.`,
      );
    }

    //users bellow or equal to manager must be assigned to at least one warehouse
    let registerToWarehouse = false;
    if (RoleLevel[newRole] <= RoleLevel[Role.MANAGER]) {
      if (employee.warehouses.length === 0 && !warehouseId) {
        throw new BadRequestException(
          `The role ${newRole} requires the employee to be assigned to at least one warehouse, provide a warehouseId to assign.`,
        );
      }
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
      });

      //validate warehouse existence
      if (!warehouse) throw new BadRequestException('Warehouse not found!');
      registerToWarehouse = true;
    }

    try {
      await this.usersRepository.updateRole(
        employeeId,
        newRole,
        registerToWarehouse ? warehouseId : undefined,
      );
      return {
        message: 'Role updated successfully.',
        newRole,
      };
    } catch (error) {
      this.logger.error('Error updating role', error);
      throw new InternalServerErrorException();
    }
  }
}
