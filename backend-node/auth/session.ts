import { db } from '../db';
import { userSessions } from '@shared/schema';
import { eq, lt } from 'drizzle-orm';
import { generateSessionToken } from './jwt';

// Create new session (single login enforcement)
export async function createSession(userId: number): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Remove any existing session for this user (single login enforcement)
  await db.delete(userSessions).where(eq(userSessions.userId, userId));

  // Create new session
  await db.insert(userSessions).values({
    userId,
    sessionToken,
    expiresAt,
  });

  return sessionToken;
}

// Validate session exists and is not expired
export async function validateSession(userId: number, sessionToken: string): Promise<boolean> {
  const [session] = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.userId, userId));

  if (!session) return false;
  if (session.sessionToken !== sessionToken) return false;
  if (session.expiresAt < new Date()) {
    // Session expired, remove it
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
    return false;
  }

  return true;
}

// Remove session (logout)
export async function removeSession(userId: number): Promise<void> {
  await db.delete(userSessions).where(eq(userSessions.userId, userId));
}

// Clean up expired sessions (cleanup job)
export async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date();
  await db.delete(userSessions).where(lt(userSessions.expiresAt, now));
}

// Get session info
export async function getSession(userId: number) {
  const [session] = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.userId, userId));
  
  return session;
}