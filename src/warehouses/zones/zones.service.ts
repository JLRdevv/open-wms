import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ZonesRepository } from './zones.repository';
import { CreateZoneDto } from '../dtos/create-zone';

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

    if (!warehouse) {
      throw new BadRequestException('Warehouse not found');
    }
    if (zone) {
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
}
