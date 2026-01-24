import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RotatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  newPassword?: string;
}
