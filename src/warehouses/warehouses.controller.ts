import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { AdminLevelGuard } from 'src/common/guards/admin-level';
import { CreateWarehouseDto } from './dtos/create-warehouse';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('warehouse')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @UseGuards(AdminLevelGuard)
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
}
