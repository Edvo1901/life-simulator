import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthException } from '../exceptions/auth.exception';
@Injectable()
export class AuthRateGuard implements CanActivate {
  private readonly attempts = new Map<
    string,
    { count: number; reset: number }
  >();
  canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<{ ip: string; path: string }>();
    const now = Date.now();
    for (const [key, value] of this.attempts)
      if (value.reset <= now) this.attempts.delete(key);
    const key = request.ip + ':' + request.path,
      entry = this.attempts.get(key) ?? { count: 0, reset: now + 60000 };
    entry.count++;
    this.attempts.set(key, entry);
    if (entry.count > 20) throw new AuthException('RATE_LIMITED', 429);
    return true;
  }
}
