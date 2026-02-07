import { BadRequestException, ConflictException } from '@nestjs/common';

export const handlePrismaException = (error: any) => {
  if (error.code) {
    switch (error.code) {
      case 'P2001':
        throw new BadRequestException('Record not found.');
      case 'P2002':
        throw new ConflictException(
          `Unique constraint failed on field(s): ${error.meta.driverAdapterError.cause.constraint.fields}`,
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
