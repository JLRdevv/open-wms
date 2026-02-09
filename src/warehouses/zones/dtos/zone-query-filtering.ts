import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ZoneQueryFilteringDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  locations?: boolean;
  
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  deleted?: boolean;
}
