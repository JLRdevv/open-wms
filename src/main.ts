import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  app.useLogger(app.get(Logger));
  await app.listen(configService.getOrThrow<number>('HTTP_PORT'));
}
bootstrap();
