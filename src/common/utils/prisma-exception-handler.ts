import { ConflictException } from '@nestjs/common';

export const handlePrismaException = (error: any) => {
  if (error.code) {
    switch (error.code) {
      case 'P2001':
        throw new ConflictException('Record not found.');
      case 'P2002':
        throw new ConflictException('Unique constraint failed.');

      default:
        throw error;
    }
  }
};
