import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class ConfirmHardDeleteDto {
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  confirm: boolean;
}
