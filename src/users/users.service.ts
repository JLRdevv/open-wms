import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dtos/create-employee';
import { UserUtils } from './user.utils';
import { auth } from 'src/lib/auth';
import { Role, User } from '@prisma/client';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { RotatePasswordDto } from './dtos/rotate-password';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(employeeData: CreateEmployeeDto, adminId: string) {
    UserUtils.passwordValidation(employeeData.password, employeeData.role);

    if (employeeData.role !== Role.OPERATOR)
      if (!employeeData.email)
        throw new BadRequestException(
          'Email is required for non-operator roles.',
        );

    const email = employeeData.email || `${employeeData.username}@local.com`;

    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password: employeeData.password,
          name: employeeData.name,
          role: employeeData.role,
          username: employeeData.username,
          createdBy: adminId,
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
      throw new BadRequestException('User is not allowed to rotate password.');
    }

    if (!body.currentPassword || !body.newPassword) {
      throw new BadRequestException(
        'Current password and new password are required for operators.',
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
