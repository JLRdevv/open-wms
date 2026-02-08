import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { AdminLevelGuard } from 'src/common/guards/admin-level';
import { CreateWarehouseDto } from './dtos/create-warehouse';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { WarehouseParamDto } from './dtos/warehouse-param';
import { UpdateWarehouseDto } from './dtos/update-warehouse';
import { ConfirmHardDeleteDto } from 'src/common/dtos/confirm-hard-delete';
import { WarehouseQueryFilteringDto } from './dtos/query-filtering';
import { PasswordRotationGuard } from 'src/common/guards/passwordRotation';

@Controller('warehouse')
@UseGuards(AdminLevelGuard, PasswordRotationGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  async getWarehouses(@Query() query: WarehouseQueryFilteringDto) {
    return await this.warehousesService.getWarehouses(query);
  }

  @Get(':warehouseId')
  async getWarehouseById(
    @Param() params: WarehouseParamDto,
    @Query() query: WarehouseQueryFilteringDto,
  ) {
    return await this.warehousesService.getWarehouseById(
      params.warehouseId,
      query,
    );
  }

  @Get(':warehouseId/employees')
  async getWarehouseEmployees(@Param() params: WarehouseParamDto) {
    return await this.warehousesService.getWarehouseEmployees(
      params.warehouseId,
    );
  }

  @Post()
  async createWarehouse(
    @Body() warehouseData: CreateWarehouseDto,
    @Session() session: UserSession,
  ) {
    return await this.warehousesService.createWarehouse(
      warehouseData,
      session.user.id,
    );
  }

  @Patch(':warehouseId')
  async updateWarehouse(
    @Param() params: WarehouseParamDto,
    @Body() body: UpdateWarehouseDto,
  ) {
    return await this.warehousesService.updateWarehouse(
      body,
      params.warehouseId,
    );
  }

  @Delete(':warehouseId')
  async softDeleteWarehouse(@Param() params: WarehouseParamDto) {
    return await this.warehousesService.softDeleteWarehouse(params.warehouseId);
  }

  @Post(':warehouseId/restore')
  async restoreWarehouse(@Param() params: WarehouseParamDto) {
    return await this.warehousesService.restoreWarehouse(params.warehouseId);
  }

  @Delete(':warehouseId/hard-delete')
  async hardDeleteWarehouse(
    @Param() params: WarehouseParamDto,
    @Query() query: ConfirmHardDeleteDto,
  ) {
    return await this.warehousesService.hardDeleteWarehouse(
      params.warehouseId,
      query.confirm,
    );
  }
}
