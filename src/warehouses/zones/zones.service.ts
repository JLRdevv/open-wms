import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ZonesRepository } from './zones.repository';
import { CreateZoneDto } from './dtos/create-zone';
import { ZoneQueryInclude } from './types/include';

@Injectable()
export class ZonesService {
  private readonly logger = new Logger(ZonesService.name);

  constructor(private readonly zonesRepository: ZonesRepository) {}

  async createZone(
    zoneData: CreateZoneDto,
    warehouseId: number,
    adminId: string,
  ) {
    const [warehouse, zone] = await Promise.allSettled([
      this.zonesRepository.findWarehouseById(warehouseId),
      this.zonesRepository.findZoneByCodeInWarehouse(
        zoneData.code,
        warehouseId,
      ),
    ]);

    if (warehouse.status === 'fulfilled' && !warehouse.value) {
      throw new BadRequestException('Warehouse not found');
    }
    if (zone.status === 'fulfilled' && zone.value) {
      throw new BadRequestException(
        `Zone with code ${zoneData.code} already exists in this warehouse`,
      );
    }

    try {
      const zone = await this.zonesRepository.createZone(
        zoneData,
        warehouseId,
        adminId,
      );
      return zone;
    } catch (error) {
      this.logger.error('Failed to create zone', error);
      throw error;
    }
  }

  async getZones(warehouseId: number) {
    const warehouse = await this.zonesRepository.findWarehouseById(
      warehouseId,
      { zones: true },
    );
    if (!warehouse) {
      throw new BadRequestException('Warehouse not found');
    }
    return warehouse.zones;
  }

  async getZoneById(
    warehouseId: number,
    zoneId: number,
    include: ZoneQueryInclude,
  ) {
    const zone = await this.zonesRepository.findZoneById(zoneId, include);
    if (!zone || zone.warehouseId !== warehouseId) {
      throw new BadRequestException('Zone not found in this warehouse');
    }
    return zone;
  }
}
