import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ZoneParamDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  warehouseId: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  zoneId: number;
}
