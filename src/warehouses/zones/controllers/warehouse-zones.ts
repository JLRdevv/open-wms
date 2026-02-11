import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { WarehouseParamDto } from '../../dtos/warehouse-param';
import { CreateZoneDto } from '../dtos/create-zone';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { ZonesService } from '../zones.service';
import { AdminLevelGuard } from 'src/common/guards/admin-level';
import { PasswordRotationGuard } from 'src/common/guards/passwordRotation';

@Controller('warehouses/:warehouseId/zones')
@UseGuards(AdminLevelGuard, PasswordRotationGuard)
export class WarehouseZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
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

  @Get()
  async getZones(@Param() params: WarehouseParamDto) {
    return await this.zonesService.getZones(params.warehouseId);
  }
}
