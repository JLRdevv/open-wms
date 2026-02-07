import { User } from '@prisma/client';

export const serializeUsers = (users: User[]) => {
  return users.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    createdBy: user.createdBy,
    createdAt: user.createdAt,
  }));
};
