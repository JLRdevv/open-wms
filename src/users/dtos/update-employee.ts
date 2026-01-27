import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;
}
