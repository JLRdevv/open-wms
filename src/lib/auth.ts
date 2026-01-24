import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { APIError, betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import 'dotenv/config';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { username } from 'better-auth/plugins';

const BASE_URL = process.env.BASE_URL;
const DATABASE_URL = process.env.DATABASE_URL;

const prismaBase = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: DATABASE_URL!,
  }),
});

// put hooks later
const prisma = prismaBase;

export const auth = betterAuth({
  baseURL: BASE_URL!,
  trustedOrigins: [process.env.TRUSTED_ORIGINS!],
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') {
        return;
      }
      // hook for username validation
      const { username } = ctx.body;
      if (!username || username.trim() === '') {
        throw new APIError('BAD_REQUEST', {
          message: 'Username is required.',
        });
      }

      if (username.length < 3) {
        throw new APIError('BAD_REQUEST', {
          message: 'Username is too short.',
        });
      }
    }),
  },
});
