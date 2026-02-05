import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WarehousesRepository } from './warehouses.repository';
import { CreateWarehouseDto } from './dtos/create-warehouse';

@Injectable()
export class WarehousesService {
  private readonly logger = new Logger(WarehousesService.name);

  constructor(private readonly warehousesRepository: WarehousesRepository) {}

  async createWarehouse(warehouseData: CreateWarehouseDto, adminId: string) {
    try {
      return await this.warehousesRepository.createWarehouse(
        warehouseData,
        adminId,
      );
    } catch (error) {
      this.logger.error('Failed to create warehouse', error);
      throw error;
    }
  }
}
