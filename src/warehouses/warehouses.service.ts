import { ConflictException, Injectable, Logger } from '@nestjs/common';
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
      if (error.code && error.code === 'P2002') {
        throw new ConflictException(
          `Warehouse with code ${warehouseData.code} already exists.`,
        );
      }
      this.logger.error('Failed to create warehouse', error);
      throw error;
    }
  }
}
