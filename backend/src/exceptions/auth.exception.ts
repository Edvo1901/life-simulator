import { HttpException } from '@nestjs/common';
export class AuthException extends HttpException {
  constructor(code: string, status: number) {
    super({ code }, status);
  }
}
