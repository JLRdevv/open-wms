import { BadRequestException, ConflictException } from '@nestjs/common';

export const handlePrismaException = (error: any) => {
  if (error.code) {
    switch (error.code) {
      case 'P2001':
        throw new BadRequestException('Record not found.');
      case 'P2002':
        throw new ConflictException(`Unique constraint failed on field(s): ${error.meta.driverAdapterError.cause.constraint.fields}`);

      default:
        throw error;
    }
  }
};
