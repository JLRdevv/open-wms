import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ZonesRepository } from './zones.repository';
import { CreateZoneDto } from './dtos/create-zone';
import { ZoneQueryInclude } from './types/include';
import { UpdateZoneDto } from './dtos/update-zone';
import { AllowedZoneIncludes } from './dtos/include-query';
import { parseIncludeQuery } from 'src/common/utils/parse-include';

@Injectable()
export class ZonesService {
  private readonly logger = new Logger(ZonesService.name);

  constructor(private readonly zonesRepository: ZonesRepository) {}

  async createZone(
    zoneData: CreateZoneDto,
    warehouseId: number,
    adminId: string,
  ) {
    const warehouse = await this.zonesRepository.findWarehouseById(warehouseId);
    if (!warehouse) {
      throw new BadRequestException('Warehouse not found');
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

  async getZoneById(zoneId: number, query: AllowedZoneIncludes[]) {
    const include = parseIncludeQuery<ZoneQueryInclude>(query);
    const zone = await this.zonesRepository.findZoneById(zoneId, include);
    if (!zone) {
      throw new BadRequestException('Zone not found');
    }
    return zone;
  }

  async updateZone(data: UpdateZoneDto, zoneId: number) {
    return await this.zonesRepository.updateZone(data, zoneId);
  }
}
