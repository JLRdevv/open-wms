import { SetMetadata } from '@nestjs/common';

export const NO_PASSWORD_ROTATION_NEEDED = 'NO_PASSWORD_ROTATION_NEEDED';
export const NoRotate = () => SetMetadata(NO_PASSWORD_ROTATION_NEEDED, true);