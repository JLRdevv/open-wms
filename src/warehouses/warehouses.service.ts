import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WarehousesRepository } from './warehouses.repository';
import { CreateWarehouseDto } from './dtos/create-warehouse';
import { UpdateWarehouseDto } from './dtos/update-warehouse';
import { WarehouseQueryFilteringDto } from './dtos/query-filtering';

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

  async updateWarehouse(
    newWarehouseData: UpdateWarehouseDto,
    warehouseId: number,
  ) {
    try {
      return await this.warehousesRepository.updateWarehouse(
        newWarehouseData,
        warehouseId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update warehouse with ID ${warehouseId}`,
        error,
      );
      throw error;
    }
  }

  async softDeleteWarehouse(warehouseId: number) {
    try {
      return await this.warehousesRepository.softDeleteWarehouse(warehouseId);
    } catch (error) {
      this.logger.error(
        `Failed to soft delete warehouse with ID ${warehouseId}`,
        error,
      );
      throw error;
    }
  }

  async restoreWarehouse(warehouseId: number) {
    try {
      return await this.warehousesRepository.restoreWarehouse(warehouseId);
    } catch (error) {
      this.logger.error(
        `Failed to restore warehouse with ID ${warehouseId}`,
        error,
      );
      throw error;
    }
  }

  async hardDeleteWarehouse(warehouseId: number, confirm: boolean) {
    if (!confirm)
      return new BadRequestException(
        'You must confirm the hard deletion by setting confirm=true in the query parameters.',
      );
    try {
      return await this.warehousesRepository.hardDeleteWarehouse(warehouseId);
    } catch (error) {
      this.logger.error(
        `Failed to hard delete warehouse with ID ${warehouseId}`,
        error,
      );
      throw error;
    }
  }

  async getWarehouses(include: WarehouseQueryFilteringDto = {}) {
    return await this.warehousesRepository.getWarehouses(include);
  }

  async getWarehouseById(
    warehouseId: number,
    include: WarehouseQueryFilteringDto = {},
  ) {
    const warehouse = await this.warehousesRepository.findById(
      warehouseId,
      include,
    );
    if (!warehouse) {
      throw new NotFoundException(`Warehouse not found with ID ${warehouseId}`);
    }
    return warehouse;
  }
}
