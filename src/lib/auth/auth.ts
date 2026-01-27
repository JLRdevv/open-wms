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
const privateRoutes = ['/sign-up/email', '/update-user'];
const USERNAME_SIGNIN_ROUTE = '/sign-in/username';
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
      deletedAt: {
        type: 'date',
        required: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (privateRoutes.includes(ctx.path)) {
        const isInternalCall =
          ctx.headers?.get(process.env.INTERNAL_HEADER_NAME!) ===
          process.env.INTERNAL_SECRET;
        if (!isInternalCall)
          throw new APIError('BAD_REQUEST', {
            message: 'This route is not public.',
          });
      }
      if (ctx.path === USERNAME_SIGNIN_ROUTE) {
        const isDeleted = await prisma.user.findUnique({
          where: { username: ctx.body.username },
          select: { deletedAt: true },
        });

        if (isDeleted?.deletedAt) {
          throw new APIError('BAD_REQUEST', {
            message: 'This account has been deleted.',
          });
        }
      }
    }),
  },
});
