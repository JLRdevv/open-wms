import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class WarehouseParamDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  warehouseId: number;
}
