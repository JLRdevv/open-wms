import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateWarehouseDto } from './create-warehouse';
import { CreateAddressDto } from './create-address';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateAddressDto extends PartialType(CreateAddressDto) {}

export class UpdateWarehouseDto extends PartialType(
  OmitType(CreateWarehouseDto, ['address'] as const),
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;
}
