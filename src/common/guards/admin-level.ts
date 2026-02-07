import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { RoleLevel } from 'src/lib/auth/role.util';

@Injectable()
export class AdminLevelGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User | undefined;
    if (!user) return false;
    if (RoleLevel[user.role] < RoleLevel[Role.ADMIN]) return false;
    return true;
  }
}
