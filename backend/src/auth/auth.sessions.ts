import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
@Injectable()
export class AuthSessions {
  private readonly sessions = new Map<
    string,
    { id: string; stamp: string; expires: number }
  >();
  issue(id: string, stamp: string): string {
    for (const [key, value] of this.sessions)
      if (value.expires < Date.now()) this.sessions.delete(key);
    const token = randomBytes(32).toString('base64url');
    this.sessions.set(this.key(token), {
      id,
      stamp,
      expires: Date.now() + 8 * 60 * 60 * 1000,
    });
    return token;
  }
  find(token: string) {
    const key = this.key(token),
      value = this.sessions.get(key);
    if (!value || value.expires <= Date.now()) {
      this.sessions.delete(key);
      return null;
    }
    return value;
  }
  revoke(token: string) {
    this.sessions.delete(this.key(token));
  }
  private key(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
