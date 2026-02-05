import { Module } from '@nestjs/common';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { WarehousesRepository } from './warehouses.repository';
import { ZonesModule } from './zones/zones.module';

@Module({
  controllers: [WarehousesController],
  providers: [WarehousesService, WarehousesRepository],
  imports: [ZonesModule]
})
export class WarehousesModule {}
