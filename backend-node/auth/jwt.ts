import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';
import { jwtBlacklist } from '@shared/schema';
import { eq, lt } from 'drizzle-orm';

// Get JWT secret from environment variables - critical for security
const JWT_SECRET = process.env.JWT_SECRET;

// Fail fast if JWT_SECRET is not configured in production
if (!JWT_SECRET) {
  console.error('🚨 SECURITY ERROR: JWT_SECRET environment variable not configured!');
  console.error('Please add JWT_SECRET to your environment variables.');
  process.exit(1);
}

// Type assertion after null check - we know JWT_SECRET is defined here
const jwtSecret: string = JWT_SECRET;
const JWT_EXPIRES_IN = '1h'; // 1 hour

export interface JWTPayload {
  userId: number;
  username: string;
  role: 'ADMIN' | 'OFFICE' | 'DISTRICT_SUPERVISOR';
  districts: string[]; // Array of district codes for DISTRICT_SUPERVISOR
  sessionToken: string; // For single login validation
  iat: number;
  exp: number;
}

// Generate JWT token
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    // Ensure the decoded token has the expected shape
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return decoded as JWTPayload;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Generate session token for single login enforcement
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash token for blacklist storage
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Add token to blacklist (for logout)
export async function blacklistToken(token: string): Promise<void> {
  const decoded = verifyToken(token);
  if (!decoded) return;

  const tokenHash = hashToken(token);
  const expiredAt = new Date(decoded.exp * 1000);

  await db.insert(jwtBlacklist).values({
    tokenHash,
    expiredAt,
  });
}

// Check if token is blacklisted
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  
  const [result] = await db
    .select()
    .from(jwtBlacklist)
    .where(eq(jwtBlacklist.tokenHash, tokenHash));

  return !!result;
}

// Clean up expired blacklisted tokens (cleanup job)
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();
  await db.delete(jwtBlacklist).where(lt(jwtBlacklist.expiredAt, now));
}