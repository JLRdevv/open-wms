import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dtos/create-employee';
import { UserUtils } from './user.utils';
import { auth } from 'src/lib/auth';

@Injectable()
export class UsersService {
  async createEmployee(employeeData: CreateEmployeeDto, adminId: string) {
    UserUtils.passwordValidation(employeeData.password, employeeData.role);

    const email =
      employeeData.email ||
      `${employeeData.username}@local.com`;

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
}
