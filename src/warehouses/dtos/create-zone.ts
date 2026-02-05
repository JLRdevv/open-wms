import { ZoneTypes } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsEnum(ZoneTypes)
  type: ZoneTypes = ZoneTypes.GENERAL_STORAGE;
}
