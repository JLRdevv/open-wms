import { Module } from '@nestjs/common';
import { ZonesController } from './controllers/zones';
import { WarehouseZonesController } from './controllers/warehouse-zones';
import { ZonesRepository } from './zones.repository';
import { ZonesService } from './zones.service';

@Module({
  controllers: [ZonesController, WarehouseZonesController],
  providers: [ZonesRepository, ZonesService],
})
export class ZonesModule {}
