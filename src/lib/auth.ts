import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { SESSION_DURATION_SECONDS } from '@/lib/authCookies';

export const SESSION_DURATION = '7d';
export { SESSION_DURATION_SECONDS };

export function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret || secret === 'your-secret-key') {
    throw new Error(
      'JWT secret is not configured. Set NEXTAUTH_SECRET (or JWT_SECRET) in the environment.'
    );
  }
  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, getJwtSecret(), { expiresIn: SESSION_DURATION });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

export type SessionPayload = {
  userId: string;
  role: 'advertiser' | 'retailer' | 'admin';
};
