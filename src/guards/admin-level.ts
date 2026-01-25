import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AdminLevelGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User | undefined;
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Access denied. Admin level permission required.',
      );
    }
    return true;
  }
}
