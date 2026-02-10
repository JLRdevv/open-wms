import { BadRequestException, ConflictException } from '@nestjs/common';

export const handlePrismaException = (error: any) => {
  if (error.code) {
    switch (error.code) {
      case 'P2001':
        throw new BadRequestException('Record not found.');
      case 'P2002':
        let errorFields = error.meta.driverAdapterError.cause.constraint.fields;
        if (errorFields.length > 1) {
          errorFields = errorFields.join(' & ').replace(/"/g, '');
          throw new ConflictException(
            `Unique constraint failed on fields: ${errorFields}, this is a multi-column unique key`,
          );
        }
        throw new ConflictException(
          `Unique constraint failed on field: ${errorFields}`,
        );
      case 'P2025':
        throw new BadRequestException(
          `${error.meta.modelName} to update not found.`,
        );
      default:
        throw error;
    }
  }
};
