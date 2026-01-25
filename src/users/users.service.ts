import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dtos/create-employee';
import { UserUtils } from './user.utils';
import { auth } from 'src/lib/auth/auth';
import { Role, User } from '@prisma/client';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { RotatePasswordDto } from './dtos/rotate-password';
import { PrismaService } from 'src/prisma/prisma.service';
import { canManageRole } from 'src/lib/auth/role.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(newEmployee: CreateEmployeeDto, currentUser: User) {
    if (!canManageRole(currentUser.role, newEmployee.role)) {
      throw new UnauthorizedException(
        `You do not have permission to create users with the role ${newEmployee.role}.`,
      );
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
      await auth.api.signUpEmail({
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
      return { created: true };
    } catch (error) {
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
      await auth.api.changePassword({
        body: {
          currentPassword: body.currentPassword,
          newPassword: body.newPassword,
        },
        headers,
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { shouldRotatePassword: false },
      });

      return {
        success: true,
        message: 'Password changed successfully.',
      };
    } catch (error) {
      throw error;
    }
  }
}
