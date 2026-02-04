import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWarehouseDto } from './dtos/create-warehouse';
import { handlePrismaException } from 'src/common/utils/prisma-exception-handler';

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
              address: warehouseData.address.addressLine,
              city: warehouseData.address.city,
              state: warehouseData.address.state,
              zipCode: warehouseData.address.zipCode,
              country: warehouseData.address.country,
            },
          },
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }
}
