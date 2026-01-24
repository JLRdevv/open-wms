import { Role } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsEmail,
} from 'class-validator';

const AllowedRoles = Object.values(Role).filter((role) => role !== Role.ADMIN);

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

  @IsIn(AllowedRoles)
  @IsOptional()
  role: Role = Role.OPERATOR;
}
