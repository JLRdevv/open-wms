import { Role } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsIn,
  IsInt,
} from 'class-validator';

export const creatableRoles = Object.values(Role).filter(
  (role) => role !== Role.ROOT,
);

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsInt()
  @IsOptional()
  warehouseId?: number;

  @IsIn(creatableRoles)
  role: Role;
}
