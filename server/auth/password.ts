import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Password policy validation schema
export const passwordSchema = z.string()
  .min(10, 'Password must be at least 10 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  // Validate password meets requirements
  passwordSchema.parse(password);
  
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Validate password meets policy requirements
export function validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
  try {
    passwordSchema.parse(password);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return { valid: false, errors: ['Invalid password format'] };
  }
}