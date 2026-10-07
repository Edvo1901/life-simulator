import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthException } from '../exceptions/auth.exception';
import type { AuthRequest } from '../types/auth/account';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const match = request.headers.authorization?.match(
      /^Bearer ([A-Za-z0-9_-]{43})$/,
    );
    if (!match) throw new AuthException('UNAUTHENTICATED', 401);
    request.authToken = match[1];
    request.identity = await this.auth.identify(match[1]);
    return true;
  }
}
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (
      context.switchToHttp().getRequest<AuthRequest>().identity.roleCode !==
      'admin'
    )
      throw new AuthException('FORBIDDEN', 403);
    return true;
  }
}
