import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';

const strongPasswordError = `password must follow these rules: At least 8 characters, At least one Uppercase Letter, At least one Lowercase Letter, At least one Number, At least one Special Character (symbol).`;

export class UserUtils {
  static passwordValidation(password: string, role: Role) {
    if (role === Role.OPERATOR) {
      const operatorPasswordRegex = /^\d{4}$/;
      if (!password.match(operatorPasswordRegex)) {
        throw new BadRequestException(
          'Operator password must be exactly 4 digits.',
        );
      }
    }
    if (role === Role.MANAGER) {
      const managerPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!password.match(managerPasswordRegex)) {
        throw new BadRequestException(`Manager ${strongPasswordError}`);
      }
    }
    if (role === Role.ADMIN) {
      const adminPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!password.match(adminPasswordRegex)) {
        throw new BadRequestException(`Admin ${strongPasswordError}`);
      }
    }
  }
}
