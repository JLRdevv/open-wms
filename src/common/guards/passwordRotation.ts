import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class PasswordRotationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User | undefined;

    if (!user || user.shouldRotatePassword) {
      throw new ForbiddenException('Rotate your password first.');
    }

    return true;
  }
}
