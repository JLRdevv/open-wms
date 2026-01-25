import { Role } from '@prisma/client';

export const RoleLevel: Record<Role, number> = {
  ROOT: 5,
  SUPER_ADMIN: 4,
  ADMIN: 3,
  MANAGER: 2,
  OPERATOR: 1,
};

export function canManageRole(currentRole: Role, targetRole: Role) {
  if (currentRole === Role.ROOT || currentRole === Role.SUPER_ADMIN)
    return true;

  return RoleLevel[currentRole] > RoleLevel[targetRole];
}
