import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export enum AllowedWarehouseIncludes {
  ADDRESS = 'address',
  ZONES = 'zones',
  DELETED = 'deleted',
}

export class WarehouseQueryFilteringDto {
  @IsOptional()
  @IsEnum(AllowedWarehouseIncludes, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  include: AllowedWarehouseIncludes[];
}
