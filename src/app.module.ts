import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth/auth';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule.forRoot({
      auth,
    }),
    PrismaModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  levelFirst: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname,req.headers',
                  messageFormat: '{msg} {req.method} {req.url}',
                },
              }
            : undefined,

        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
          }),
        },
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
