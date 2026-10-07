import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const port = Number(process.env.API_PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT must be an integer from 1 to 65535.');
  }
  const app = await NestFactory.create<
    import('@nestjs/platform-express').NestExpressApplication
  >(AppModule, { logger: false, bodyParser: false });
  const limit = Number(process.env.MAX_REQUEST_BODY_BYTES ?? 16384);
  if (!Number.isInteger(limit) || limit < 1024 || limit > 1048576)
    throw new Error('Invalid request-body limit.');
  app.useBodyParser('json', { limit });
  app.use(
    (
      _request: unknown,
      response: { setHeader(name: string, value: string): void },
      next: () => void,
    ) => {
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('X-Frame-Options', 'DENY');
      response.setHeader('Cache-Control', 'no-store');
      next();
    },
  );
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api');
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();
  await app.listen(port, '127.0.0.1');
}
void bootstrap().catch(() => {
  console.error('Backend startup failed. Check local configuration.');
  process.exitCode = 1;
});
