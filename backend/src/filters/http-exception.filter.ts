import { randomUUID } from 'node:crypto';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const codes: Record<number, string> = {
      400: 'INVALID_REQUEST',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'RATE_LIMITED',
    };
    const body =
      exception instanceof HttpException ? exception.getResponse() : null;
    const domainCode =
      body &&
      typeof body === 'object' &&
      'code' in body &&
      typeof body.code === 'string' &&
      /^[A-Z_]+$/.test(body.code)
        ? body.code
        : null;
    const code =
      domainCode ??
      codes[status] ??
      (status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR');
    const response = host.switchToHttp().getResponse<{
      setHeader(name: string, value: string): void;
      status(code: number): { json(body: unknown): void };
    }>();
    const requestId = randomUUID();
    response.setHeader('X-Request-ID', requestId);
    // Log one safe event; never include exception text, stack, SQL, or payloads.
    if (status >= 500) {
      this.logger.error(JSON.stringify({ requestId, status, code }));
    }
    response.status(status).json({
      error: {
        code,
        message:
          status >= 500
            ? 'An unexpected error occurred.'
            : 'The request could not be completed.',
      },
    });
  }
}
