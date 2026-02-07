import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateAddressDto } from './create-address';
import { Type } from 'class-transformer';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}
