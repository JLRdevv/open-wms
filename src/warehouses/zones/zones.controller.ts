import {
  Body,
  Controller,
  Param,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { WarehouseParamDto } from '../dtos/warehouse-param';
import { CreateZoneDto } from './dtos/create-zone';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { ZonesService } from './zones.service';
import { AdminLevelGuard } from 'src/common/guards/admin-level';

@Controller('warehouses/:warehouseId/zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
  @UseGuards(AdminLevelGuard)
  async createZone(
    @Param() params: WarehouseParamDto,
    @Body() body: CreateZoneDto,
    @Session() session: UserSession,
  ) {
    return await this.zonesService.createZone(
      body,
      params.warehouseId,
      session.user.id,
    );
  }
}
