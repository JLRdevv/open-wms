import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WarehousesRepository } from './warehouses.repository';
import { CreateWarehouseDto } from './dtos/create-warehouse';
import { UpdateWarehouseDto } from './dtos/update-warehouse';
import { WarehouseQueryFilteringDto } from './dtos/include-query';
import { serializeUsers } from './utils/serialize-users';
import { parseIncludeQuery } from '../common/utils/parse-include';
import { WarehouseQueryInclude } from './types/include';

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
      const [warehouse, zones] = await Promise.all([
        this.warehousesRepository.findById(warehouseId),
        this.warehousesRepository.getZones(warehouseId),
      ]);
      if (!warehouse) {
        throw new NotFoundException(
          `Warehouse not found with ID ${warehouseId}`,
        );
      }
      if (zones.length > 0) {
        throw new BadRequestException(
          'Cannot delete warehouse with associated zones. Please remove all zones before deleting.',
        );
      }
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
      const [warehouse, zones] = await Promise.all([
        this.warehousesRepository.findById(warehouseId, { deleted: true }),
        this.warehousesRepository.getZones(warehouseId, { deleted: true }),
      ]);
      if (!warehouse) {
        throw new NotFoundException(
          `Warehouse not found with ID ${warehouseId}`,
        );
      }
      if (zones.length > 0) {
        throw new BadRequestException(
          'Cannot delete warehouse with associated zones. Please hard delete all zones before deleting.',
        );
      }
      return await this.warehousesRepository.hardDeleteWarehouse(warehouseId);
    } catch (error) {
      this.logger.error(
        `Failed to hard delete warehouse with ID ${warehouseId}`,
        error,
      );
      throw error;
    }
  }

  async getWarehouses(query: WarehouseQueryFilteringDto) {
    const include = parseIncludeQuery<WarehouseQueryInclude>(query.include);
    return await this.warehousesRepository.getWarehouses(include);
  }

  async getWarehouseById(
    warehouseId: number,
    query: WarehouseQueryFilteringDto,
  ) {
    const include = parseIncludeQuery<WarehouseQueryInclude>(query.include);
    const warehouse = await this.warehousesRepository.findById(
      warehouseId,
      include,
    );
    if (!warehouse) {
      throw new NotFoundException(`Warehouse not found with ID ${warehouseId}`);
    }
    return warehouse;
  }

  async getWarehouseEmployees(warehouseId: number) {
    const warehouse =
      await this.warehousesRepository.getWarehouseEmployees(warehouseId);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse not found with ID ${warehouseId}`);
    }
    return serializeUsers(warehouse.users);
  }
}
