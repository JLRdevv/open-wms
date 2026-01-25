import { Role } from '@prisma/client';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { creatableRoles } from './create-employee';

export class RoleChangeDto {
  @IsIn(creatableRoles)
  newRole: Role;


  // WIP: if employee is demoted to a role that needs warehouse assignment
  @IsOptional()
  @IsNumber()
  warehouseId?: number;
}
