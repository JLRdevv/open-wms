import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { AdminLevelGuard } from 'src/common/guards/admin-level';
import { CreateWarehouseDto } from './dtos/create-warehouse';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { WarehouseParamDto } from './dtos/warehouse-param';
import { UpdateWarehouseDto } from './dtos/update-warehouse';

@Controller('warehouse')
@UseGuards(AdminLevelGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

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
}
