import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { NO_PASSWORD_ROTATION_NEEDED } from '../decorators/no-rotate';

@Injectable()
export class PasswordRotationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const needsRotation = this.reflector.getAllAndOverride<boolean>(
      NO_PASSWORD_ROTATION_NEEDED,
      [context.getHandler(), context.getClass()],
    );

    if (needsRotation) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as User | undefined;

    if (!user || user.shouldRotatePassword) {
      throw new ForbiddenException('Rotate your password first.');
    }

    return true;
  }
}
