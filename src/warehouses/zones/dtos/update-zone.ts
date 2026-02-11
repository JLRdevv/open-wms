import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateZoneDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;
  
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  code?: string;
}
