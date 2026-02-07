import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export class WarehouseQueryFilteringDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  deleted?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  address?: boolean;
}
