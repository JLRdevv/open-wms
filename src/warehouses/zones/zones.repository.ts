import { handlePrismaException } from 'src/common/utils/prisma-exception-handler';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneDto } from '../dtos/create-zone';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZonesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findWarehouseById(warehouseId: number) {
    try {
      return await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async findZoneByCodeInWarehouse(code: string, warehouseId: number) {
    try {
      return await this.prisma.zone.findFirst({
        where: {
          code: code,
          warehouseId: warehouseId,
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async createZone(
    zoneData: CreateZoneDto,
    warehouseId: number,
    adminId: string,
  ) {
    try {
      return await this.prisma.zone.create({
        data: {
          name: zoneData.name,
          code: zoneData.code,
          type: zoneData.type,
          warehouseId: warehouseId,
          createdBy: adminId,
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }
}
