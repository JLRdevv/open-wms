import { AllowedZoneIncludes } from '../dtos/include-query';

export type ZoneQueryInclude = Partial<
  Record<AllowedZoneIncludes, boolean | undefined>
>;
