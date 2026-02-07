import {
  BadRequestException,
  ConflictException,
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
import { UpdateEmployeeDto } from './dtos/update-employee';

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
    try {
      if (registerToWarehouse) {
        await this.usersRepository.connectWarehouse(
          signUpResponse.user.id,
          newEmployee.warehouseId!,
        );
      }
      return signUpResponse.user;
    } catch (error) {
      this.logger.error(error);
      throw error;
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
      throw new InternalServerErrorException('Error rotating password.');
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
      if (employee.warehouses.length < 1 && !warehouseId) {
        throw new BadRequestException(
          `The role ${newRole} requires the employee to be assigned to at least one warehouse, provide a warehouseId to assign.`,
        );
      }
      if (warehouseId) {
        const warehouse = await this.prisma.warehouse.findUnique({
          where: { id: warehouseId },
        });
        //validate warehouse existence
        if (!warehouse) throw new BadRequestException('Warehouse not found!');
        registerToWarehouse = true;
      }
    }

    try {
      const updateResponse = await this.usersRepository.updateRole(
        employeeId,
        newRole,
        registerToWarehouse ? warehouseId : undefined,
      );
      return updateResponse;
    } catch (error) {
      this.logger.error('Error updating role', error);
      throw new InternalServerErrorException('Error updating role.');
    }
  }

  async updateEmployee(
    updateData: UpdateEmployeeDto,
    targetId: string,
    currentUser: User,
  ) {
    const employee = await this.usersRepository.findById(targetId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    if (!canManageRole(currentUser.role, employee.role)) {
      throw new UnauthorizedException(
        'You do not have permission to update this user.',
      );
    }

    if (updateData.username) {
      UserUtils.usernameValidation(updateData.username);
    }

    if (updateData.email || updateData.username) {
      const [existingByUsername, existingByEmail] = await Promise.all([
        updateData.username
          ? this.usersRepository.findByUsername(updateData.username)
          : null,
        updateData.email
          ? this.usersRepository.findByEmail(updateData.email)
          : null,
      ]);

      if (existingByUsername && existingByUsername.id !== targetId) {
        throw new ConflictException('Username already in use.');
      }

      if (existingByEmail && existingByEmail.id !== targetId) {
        throw new ConflictException('Email already in use.');
      }
    }

    const dataToUpdate: Partial<User> = {};
    if (updateData.name) dataToUpdate.name = updateData.name;
    if (updateData.email) dataToUpdate.email = updateData.email;
    if (updateData.username) dataToUpdate.username = updateData.username;

    try {
      await this.usersRepository.update(targetId, dataToUpdate);

      return { success: true, message: 'Employee updated successfully.' };
    } catch (error) {
      this.logger.error('Error updating employee', error);
      throw new InternalServerErrorException('Error updating employee.');
    }
  }

  async assignToWarehouse(employeeId: string, warehouseId: number, user: User) {
    if (employeeId === user.id) {
      throw new BadRequestException(
        'You cannot assign yourself to a warehouse.',
      );
    }
    const [employee, warehouse] = await Promise.all([
      this.usersRepository.findById(employeeId, { warehouses: true }),
      this.prisma.warehouse.findUnique({ where: { id: warehouseId } }),
    ]);

    if (!employee || !warehouse) {
      throw new NotFoundException('Employee or warehouse not found.');
    }

    if (RoleLevel[employee.role] > RoleLevel[Role.MANAGER]) {
      throw new BadRequestException(
        `employees with role ${employee.role} cannot be assigned to warehouses.`,
      );
    }

    if (employee.warehouses.some((w) => w.id === warehouseId)) {
      throw new ConflictException(
        'Employee is already assigned to this warehouse.',
      );
    }

    if (!canManageRole(user.role, employee.role)) {
      throw new UnauthorizedException(
        `You do not have permission to assign this user.`,
      );
    }

    try {
      await this.usersRepository.connectWarehouse(employeeId, warehouseId);
      return {
        success: true,
        message: 'Employee assigned to warehouse successfully.',
      };
    } catch (error) {
      this.logger.error('Error assigning employee to warehouse', error);
      throw new InternalServerErrorException(
        'Error assigning employee to warehouse.',
      );
    }
  }

  async unassignFromWarehouse(
    employeeId: string,
    warehouseId: number,
    user: User,
  ) {
    if (employeeId === user.id) {
      throw new BadRequestException(
        'You cannot unassign yourself from a warehouse.',
      );
    }
    const [employee, warehouse] = await Promise.all([
      this.usersRepository.findById(employeeId, { warehouses: true }),
      this.prisma.warehouse.findUnique({ where: { id: warehouseId } }),
    ]);
    if (!employee || !warehouse) {
      throw new NotFoundException('Employee or warehouse not found.');
    }
    if (!canManageRole(user.role, employee.role)) {
      throw new UnauthorizedException(
        `You do not have permission to unassign this user.`,
      );
    }
    if (!employee.warehouses.some((w) => w.id === warehouseId)) {
      throw new ConflictException(
        'Employee is not assigned to this warehouse.',
      );
    }
    if (employee.warehouses.length <= 1) {
      throw new BadRequestException(
        'Employee must be assigned to at least one warehouse.',
      );
    }

    try {
      await this.usersRepository.disconnectWarehouse(employeeId, warehouseId);
      return {
        success: true,
        message: 'Employee unassigned from warehouse successfully.',
      };
    } catch (error) {
      this.logger.error('Error unassigning employee from warehouse', error);
      throw new InternalServerErrorException(
        'Error unassigning employee from warehouse.',
      );
    }
  }

  async deleteEmployee(employeeId: string, currentUser: User) {
    if (employeeId === currentUser.id) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    const employee = await this.usersRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    if (!canManageRole(currentUser.role, employee.role)) {
      throw new UnauthorizedException(
        'You do not have permission to delete this user.',
      );
    }

    try {
      await this.usersRepository.deleteUser(employeeId);
      return { success: true, message: 'Employee deleted successfully.' };
    } catch (error) {
      this.logger.error('Error deleting employee', error);
      throw new InternalServerErrorException('Error deleting employee.');
    }
  }

  async getWarehousesByEmployee(id: string, currentUser: User) {
    const employee = await this.usersRepository.findById(id, {
      warehouses: true,
    });
    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }
    if (
      id !== currentUser.id &&
      !canManageRole(currentUser.role, employee.role)
    ) {
      throw new UnauthorizedException(
        "You do not have permission to view this user's assigned warehouses.",
      );
    }
    return employee.warehouses;
  }

  async getEmployeeById(id: string, currentUser: User) {
    const employee = await this.usersRepository.findById(id, { deleted: true });
    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    if (
      id !== currentUser.id &&
      !canManageRole(currentUser.role, employee.role)
    ) {
      throw new UnauthorizedException(
        "You do not have permission to view this user's information.",
      );
    }

    return employee;
  }
}
