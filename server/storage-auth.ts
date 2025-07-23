import { db } from './db';
import { users, userDistricts, type User, type InsertUser, type InsertUserDistrict } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { hashPassword } from './auth/password';

// User with districts type
export interface UserWithDistricts extends User {
  districts: string[];
}

// Get user by ID
export async function getUser(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

// Get user with their assigned districts
export async function getUserWithDistricts(userId: number): Promise<UserWithDistricts | undefined> {
  const user = await getUser(userId);
  if (!user) return undefined;

  const districts = await getUserDistricts(userId);
  
  return {
    ...user,
    districts: districts.map(d => d.districtCode)
  };
}

// Create new user
export async function createUser(userData: InsertUser): Promise<User> {
  const hashedPassword = await hashPassword(userData.passwordHash);
  
  const [user] = await db
    .insert(users)
    .values({
      ...userData,
      passwordHash: hashedPassword,
    })
    .returning();

  return user;
}

// Update user
export async function updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
  const updateData: any = { ...userData };
  
  // Hash password if provided
  if (updateData.passwordHash) {
    updateData.passwordHash = await hashPassword(updateData.passwordHash);
  }
  
  updateData.updatedAt = new Date();

  const [user] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();

  return user;
}

// Deactivate user (soft delete)
export async function deactivateUser(id: number): Promise<boolean> {
  const [result] = await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return !!result;
}

// Get all users with their districts
export async function getAllUsersWithDistricts(): Promise<UserWithDistricts[]> {
  const allUsers = await db.select().from(users).where(eq(users.isActive, true));
  
  const usersWithDistricts: UserWithDistricts[] = [];
  
  for (const user of allUsers) {
    const districts = await getUserDistricts(user.id);
    usersWithDistricts.push({
      ...user,
      districts: districts.map(d => d.districtCode)
    });
  }
  
  return usersWithDistricts;
}

// District management functions

// Get user's assigned districts
export async function getUserDistricts(userId: number) {
  return await db
    .select()
    .from(userDistricts)
    .where(eq(userDistricts.userId, userId));
}

// Assign districts to user
export async function assignDistrictsToUser(userId: number, districtCodes: string[]): Promise<void> {
  // Remove existing district assignments
  await db.delete(userDistricts).where(eq(userDistricts.userId, userId));
  
  // Add new district assignments
  if (districtCodes.length > 0) {
    // Get district names from addresses table
    const { addresses } = await import('@shared/schema');
    const distinctDistricts = await db
      .selectDistinct({
        districtCode: addresses.districtCode,
        districtNameEnglish: addresses.districtNameEnglish
      })
      .from(addresses)
      .where(inArray(addresses.districtCode, districtCodes));
    
    const assignments = distinctDistricts.map(district => ({
      userId,
      districtCode: district.districtCode!,
      districtNameEnglish: district.districtNameEnglish!
    }));
    
    await db.insert(userDistricts).values(assignments);
  }
}

// Remove specific district assignment
export async function removeDistrictFromUser(userId: number, districtCode: string): Promise<void> {
  await db
    .delete(userDistricts)
    .where(eq(userDistricts.userId, userId) && eq(userDistricts.districtCode, districtCode));
}

// Get users by district
export async function getUsersByDistrict(districtCode: string): Promise<UserWithDistricts[]> {
  const districtUsers = await db
    .select({ userId: userDistricts.userId })
    .from(userDistricts)
    .where(eq(userDistricts.districtCode, districtCode));

  if (districtUsers.length === 0) return [];

  const userIds = districtUsers.map(u => u.userId);
  const usersData = await db
    .select()
    .from(users)
    .where(inArray(users.id, userIds) && eq(users.isActive, true));

  const result: UserWithDistricts[] = [];
  for (const user of usersData) {
    const districts = await getUserDistricts(user.id);
    result.push({
      ...user,
      districts: districts.map(d => d.districtCode)
    });
  }

  return result;
}

// Check if user has access to district
export async function userHasDistrictAccess(userId: number, districtCode: string): Promise<boolean> {
  const user = await getUser(userId);
  if (!user) return false;
  
  // ADMIN and OFFICE have access to all districts
  if (user.role === 'ADMIN' || user.role === 'OFFICE') return true;
  
  // DISTRICT_SUPERVISOR: check assigned districts
  if (user.role === 'DISTRICT_SUPERVISOR') {
    const [assignment] = await db
      .select()
      .from(userDistricts)
      .where(eq(userDistricts.userId, userId) && eq(userDistricts.districtCode, districtCode));
    
    return !!assignment;
  }
  
  return false;
}