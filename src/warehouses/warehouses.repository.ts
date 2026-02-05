import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWarehouseDto } from './dtos/create-warehouse';
import { handlePrismaException } from 'src/common/utils/prisma-exception-handler';
import { UpdateWarehouseDto } from './dtos/update-warehouse';

@Injectable()
export class WarehousesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWarehouse(warehouseData: CreateWarehouseDto, adminId: string) {
    try {
      return await this.prisma.warehouse.create({
        data: {
          name: warehouseData.name,
          code: warehouseData.code,
          createdBy: adminId,
          address: {
            create: {
              ...warehouseData.address,
            },
          },
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async findById(warehouseId: number) {
    try {
      return await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async updateWarehouse(data: UpdateWarehouseDto, warehouseId: number) {
    try {
      return await this.prisma.warehouse.update({
        where: { id: warehouseId },
        data: {
          name: data.name,
          code: data.code,
          address: data.address
            ? {
                update: {
                  ...data.address,
                },
              }
            : undefined,
        },
        include: { address: true },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }
}
