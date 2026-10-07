import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';

@Controller('probe')
class ProbeController {
  @Get()
  fail(): never {
    throw new Error('sensitive database failure details');
  }
}
@Module({ controllers: [ProbeController] })
class ProbeModule {}

describe('HTTP error boundary', () => {
  let app: INestApplication;
  let baseUrl: string;
  beforeAll(async () => {
    app = await NestFactory.create(ProbeModule, { logger: false });
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });
  afterAll(async () => {
    await app.close();
  });
  it('returns the standard error contract for a missing route', async () => {
    const response = await fetch(`${baseUrl}/missing`);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'The request could not be completed.',
      },
    });
    expect(response.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
  });
  it('keeps sensitive exception details out of unexpected error responses', async () => {
    const response = await fetch(`${baseUrl}/probe`);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    });
  });
});
