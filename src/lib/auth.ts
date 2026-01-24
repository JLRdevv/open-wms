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
    minPasswordLength: 3,
  },
  plugins: [username()],

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
      },
      shouldRotatePassword: {
        type: 'boolean',
        required: false,
      },
      createdBy: {
        type: 'string',
        required: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path == '/sign-up/email') {
        const isInternalCall =
          ctx.headers?.get(process.env.INTERNAL_HEADER_NAME!) ===
          process.env.INTERNAL_SECRET;
        if (!isInternalCall)
          throw new APIError('BAD_REQUEST', {
            message: 'Public sign-up is not allowed.',
          });
      }
    }),
  },
});
