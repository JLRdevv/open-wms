import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { deleteUser } from 'better-auth/api';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async connectWarehouse(userId: string, warehouseId: number) {
    return await this.prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        warehouses: {
          connect: { id: warehouseId },
        },
      },
    });
  }

  async disconnectWarehouse(userId: string, warehouseId: number) {
    return await this.prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        warehouses: {
          disconnect: { id: warehouseId },
        },
      },
    });
  }

  async enableRotatePassword(userId: string) {
    return await this.prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        shouldRotatePassword: true,
      },
    });
  }

  async updateRole(userId: string, newRole: Role, warehouseId?: number) {
    await this.prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        role: newRole,
        shouldRotatePassword: true,
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
      where: { id: userId, deletedAt: null },
      data: updateData,
    });
  }

  async findById(userId: string, include: { warehouses?: boolean } = {}) {
    return await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        warehouses: include.warehouses,
      },
    });
  }

  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username, deletedAt: null },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async deleteUser(userId: string) {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: userId, deletedAt: null },
        data: { deletedAt: new Date(), warehouses: { set: [] } },
      });
      await prisma.session.deleteMany({
        where: { userId },
      });
    });
  }
}
