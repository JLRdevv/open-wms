import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Logger } from '@nestjs/common';
import { auth } from 'src/lib/auth';

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
      this.logger.warn('seed admin user not created, skiping');
      return;
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      this.logger.log('Default admin user already exists, skipping creation.');
      return;
    }

    this.logger.log('Creating default admin user from .env...');

    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: 'Super Admin',
          username,
        },
        headers: new Headers({
          [process.env.INTERNAL_HEADER_NAME!]: process.env.INTERNAL_SECRET!,
        }),
      });

      const newUser = await this.prisma.user.findUnique({ where: { email } });

      if (newUser) {
        await this.prisma.user.update({
          where: { id: newUser.id },
          data: { role: 'ADMIN' },
        });
        this.logger.log(`Admin ${username} created and promoted successfully`);
      }
    } catch (error) {
      this.logger.error(`Error creating default admin: ${error.message}`);
    }
  }
}
