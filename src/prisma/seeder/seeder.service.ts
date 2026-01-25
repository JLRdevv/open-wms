import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Logger } from '@nestjs/common';
import { auth } from 'src/lib/auth/auth';
import { Role } from '@prisma/client';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const email = process.env.SEED_ADMIN_EMAIL;
    const username = process.env.SEED_ADMIN_USERNAME;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!email || !password || !username) {
      this.logger.warn('Configure the ROOT user first in the .env file!');
      process.exit(1);
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      this.logger.log('ROOT user already exists, skipping creation.');
      return;
    }

    this.logger.log('Creating ROOT user from .env...');

    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: 'root',
          username,
          role: Role.ROOT,
        },
        headers: new Headers({
          [process.env.INTERNAL_HEADER_NAME!]: process.env.INTERNAL_SECRET!,
        }),
      });

      this.logger.log(`ROOT user created!`);
    } catch (error) {
      this.logger.error(`Error creating ROOT user: ${error.message}`);
    }
  }
}
