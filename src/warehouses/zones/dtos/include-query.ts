import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export enum AllowedZoneIncludes {
  LOCATIONS = 'locations',
  DELETED = 'deleted',
}

export class ZoneQueryFilteringDto {
  @IsOptional()
  @IsEnum(AllowedZoneIncludes, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  include: AllowedZoneIncludes[];
}
