import { Body, Controller, Param, Post, Session } from '@nestjs/common';
import { WarehouseParamDto } from '../dtos/warehouse-param';
import { CreateZoneDto } from '../dtos/create-zone';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { ZonesService } from './zones.service';

@Controller('warehouse/:warehouseId/zone')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
  async createZone(
    @Param() params: WarehouseParamDto,
    @Body() body: CreateZoneDto,
    @Session() session: UserSession,
  ) {
    return await this.zonesService.createZone(body, params.warehouseId, session.user.id);
  }
}
