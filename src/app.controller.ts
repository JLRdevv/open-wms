import { Controller, Get, UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return { status: 'ok' };
  }

  @Get('whoami')
  whoami(@Session() session: UserSession) {
    return { session };
  }
}
