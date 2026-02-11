import { ZoneStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateZoneStatusDto {
  @IsEnum(ZoneStatus)
  status: ZoneStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
