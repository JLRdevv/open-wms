import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZonesService } from '../zones.service';
import { AdminLevelGuard } from 'src/common/guards/admin-level';
import { PasswordRotationGuard } from 'src/common/guards/passwordRotation';
import { ZoneParamDto } from '../dtos/zone-param';
import { ZoneQueryFilteringDto } from '../dtos/zone-query-filtering';
import { UpdateZoneDto } from '../dtos/update-zone';

@Controller('zones')
@UseGuards(AdminLevelGuard, PasswordRotationGuard)
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get(':zoneId')
  async getZoneById(
    @Param() params: ZoneParamDto,
    @Query() query: ZoneQueryFilteringDto,
  ) {
    return await this.zonesService.getZoneById(params.zoneId!, query);
  }

  @Patch(':zoneId')
  async updateZone(
    @Body() body: UpdateZoneDto,
    @Param() params: ZoneParamDto,
  ) {
    return await this.zonesService.updateZone(
      body,
      params.zoneId,
    );
  }
}
