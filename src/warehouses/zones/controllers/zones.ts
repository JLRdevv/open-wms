import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZonesService } from '../zones.service';
import { AdminLevelGuard } from 'src/common/guards/admin-level';
import { PasswordRotationGuard } from 'src/common/guards/passwordRotation';
import { ZoneParamDto } from '../dtos/zone-param';
import { ZoneQueryFilteringDto } from '../dtos/include-query';
import { UpdateZoneDto } from '../dtos/update-zone';
import { UpdateZoneStatusDto } from '../dtos/update-status';

@Controller('zones')
@UseGuards(AdminLevelGuard, PasswordRotationGuard)
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get(':zoneId')
  async getZoneById(
    @Param() params: ZoneParamDto,
    @Query() query: ZoneQueryFilteringDto,
  ) {
    return await this.zonesService.getZoneById(params.zoneId, query.include);
  }

  @Patch(':zoneId')
  async updateZone(@Body() body: UpdateZoneDto, @Param() params: ZoneParamDto) {
    return await this.zonesService.updateZone(body, params.zoneId);
  }

  @Get(':zoneId/status')
  async getZoneStatus(@Param() params: ZoneParamDto) {
    return await this.zonesService.getZoneStatus(params.zoneId);
  }

  @Post(':zoneId/status')
  async updateZoneStatus(
    @Body() body: UpdateZoneStatusDto,
    @Param() params: ZoneParamDto,
  ) {
    return await this.zonesService.updateZoneStatus(body, params.zoneId);
  }
}
