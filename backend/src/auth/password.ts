import * as bcrypt from 'bcrypt';
import { AuthException } from '../exceptions/auth.exception';
export function validatePassword(password: string): void {
  if (
    Array.from(password).length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72 ||
    password.includes('\0')
  )
    throw new AuthException('INVALID_PASSWORD', 400);
}
export function validateUsername(username: string): void {
  if (
    !username ||
    username.length > 50 ||
    username !== username.trim() ||
    /[\u0000-\u001f\u007f]/.test(username)
  )
    throw new AuthException('INVALID_USERNAME', 400);
}
export async function hashPassword(password: string): Promise<string> {
  validatePassword(password);
  return bcrypt.hash(password, 12);
}
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
