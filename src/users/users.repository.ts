import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async connectWarehouse(userId: string, warehouseId: number) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        warehouses: {
          connect: { id: warehouseId },
        },
      },
    });
  }

  async enableRotatePassword(userId: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        shouldRotatePassword: true,
      },
    });
  }

  async updateRole(userId: string, newRole: Role, warehouseId?: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        ...(warehouseId && {
          warehouses: {
            connect: { id: warehouseId },
          },
        }),
      },
    });
  }

  async update(
    userId: string,
    updateData: Partial<{ name: string; email: string; username: string }>,
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async findById(userId: string, include: { warehouses?: boolean } = {}) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        warehouses: include.warehouses,
      },
    });
  }

  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
}
