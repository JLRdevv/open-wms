import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { handlePrismaException } from 'src/common/utils/prisma-exception-handler';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async connectWarehouse(userId: string, warehouseId: number) {
    try {
      return await this.prisma.user.update({
        where: { id: userId, deletedAt: null },
        data: {
          warehouses: {
            connect: { id: warehouseId },
          },
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async disconnectWarehouse(userId: string, warehouseId: number) {
    try {
      return await this.prisma.user.update({
        where: { id: userId, deletedAt: null },
        data: {
          warehouses: {
            disconnect: { id: warehouseId },
          },
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async disableRotatePassword(userId: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId, deletedAt: null },
        data: {
          shouldRotatePassword: false,
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async enableRotatePassword(userId: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId, deletedAt: null },
        data: {
          shouldRotatePassword: true,
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async updateRole(userId: string, newRole: Role, warehouseId?: number) {
    try {
      return await this.prisma.user.update({
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
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async update(
    userId: string,
    updateData: Partial<{ name: string; email: string; username: string }>,
  ) {
    try {
      return await this.prisma.user.update({
        where: { id: userId, deletedAt: null },
        data: updateData,
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async findById(
    userId: string,
    include: { warehouses?: boolean; deleted?: boolean } = {},
  ) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId, ...(include.deleted ? {} : { deletedAt: null }) },
        include: {
          warehouses: include.warehouses,
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async findByUsername(username: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { username, deletedAt: null },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email, deletedAt: null },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.user.update({
          where: { id: userId, deletedAt: null },
          data: { deletedAt: new Date(), warehouses: { set: [] } },
        });
        await prisma.session.deleteMany({
          where: { userId },
        });
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }
}
