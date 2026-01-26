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

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!password.match(strongPasswordRegex)) {
      throw new BadRequestException(`${role} ${strongPasswordError}`);
    }
  }

  static usernameValidation(username: string) {
    const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
    if (!username.match(usernameRegex)) {
      throw new BadRequestException(
        'Username must be 3-30 characters long and can only contain letters, numbers, dots, underscores, and hyphens.',
      );
    }
  }
}
