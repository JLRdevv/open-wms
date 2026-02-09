import { handlePrismaException } from 'src/common/utils/prisma-exception-handler';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneDto } from './dtos/create-zone';
import { Injectable } from '@nestjs/common';
import { WarehouseQueryInclude } from '../types/include';
import { ZoneQueryInclude } from './types/include';
import { UpdateZoneDto } from './dtos/update-zone';

@Injectable()
export class ZonesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findWarehouseById(
    warehouseId: number,
    include: WarehouseQueryInclude = {},
  ) {
    try {
      return await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
        include: {
          address: include.address,
          zones: include.zones
            ? {
                where: {
                  deletedAt: null,
                },
              }
            : undefined,
        },
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

  async findZoneById(zoneId: number, include: ZoneQueryInclude = {}) {
    try {
      return await this.prisma.zone.findUnique({
        where: { id: zoneId, deletedAt: include.deleted ? undefined : null },
        include: {
          locations: include.locations
            ? { where: { deletedAt: null } }
            : undefined,
        },
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }

  async updateZone(data: UpdateZoneDto, zoneId: number) {
    try {
      return await this.prisma.zone.update({
        where: { id: zoneId },
        data,
      });
    } catch (error) {
      handlePrismaException(error);
      throw error;
    }
  }
}
