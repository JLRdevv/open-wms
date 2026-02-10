import { AllowedWarehouseIncludes } from '../dtos/include-query';

export type WarehouseQueryInclude = Partial<
  Record<AllowedWarehouseIncludes, boolean | undefined>
>;
