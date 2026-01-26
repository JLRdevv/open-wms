import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class AssignWarehouseDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  warehouseId: number;
}
