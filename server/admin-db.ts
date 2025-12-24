import { eq, and, or } from "drizzle-orm";
import { getDb } from "./db";
import { documents, documentPackages, users } from "../drizzle/schema";

/**
 * Get all documents (admin only)
 */
export async function getAllDocuments(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(documents)
    .limit(limit)
    .offset(offset);
}

/**
 * Get documents by type
 */
export async function getDocumentsByType(documentType: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(documents)
    .where(eq(documents.documentType, documentType as any))
    .limit(limit);
}

/**
 * Update document metadata
 */
export async function updateDocumentMetadata(
  documentId: number,
  updates: {
    filename?: string;
    documentType?: string;
    mimeType?: string;
    fileSize?: number;
    extractedData?: any;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (updates.filename) updateData.filename = updates.filename;
  if (updates.documentType) updateData.documentType = updates.documentType;
  if (updates.mimeType) updateData.mimeType = updates.mimeType;
  if (updates.fileSize) updateData.fileSize = updates.fileSize;
  if (updates.extractedData) updateData.extractedData = updates.extractedData;

  return db
    .update(documents)
    .set(updateData)
    .where(eq(documents.id, documentId));
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(documents).where(eq(documents.id, documentId));
}

/**
 * Get all document packages
 */
export async function getAllDocumentPackages() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(documentPackages);
}

/**
 * Create or update document package
 */
export async function upsertDocumentPackage(
  packageType: string,
  name: string,
  description: string,
  documents: any[],
  isActive = true
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if package exists
  const existing = await db
    .select()
    .from(documentPackages)
    .where(eq(documentPackages.packageType, packageType))
    .limit(1);

  if (existing.length > 0) {
    // Update
    return db
      .update(documentPackages)
      .set({
        name,
        description,
        documents,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(documentPackages.packageType, packageType));
  } else {
    // Insert
    return db.insert(documentPackages).values({
      packageType,
      name,
      description,
      documents,
      isActive,
    });
  }
}

/**
 * Delete document package
 */
export async function deleteDocumentPackage(packageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(documentPackages).where(eq(documentPackages.id, packageId));
}

/**
 * Get user count by role
 */
export async function getUserCountByRole() {
  const db = await getDb();
  if (!db) return {};

  const result = await db.select().from(users);

  const counts: Record<string, number> = {};
  result.forEach((user) => {
    const role = (user.role as string) || "user";
    counts[role] = (counts[role] || 0) + 1;
  });

  return counts;
}

/**
 * Get all admins and moderators
 */
export async function getAdminsAndModerators() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(users)
    .where(or(eq(users.role, "admin"), eq(users.role, "moderator")));
}

/**
 * Update user role
 */
export async function updateUserRole(userId: number, role: "user" | "admin" | "lawyer" | "moderator") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    role,
    updatedAt: new Date(),
  };

  return db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}

/**
 * Get system statistics
 */
export async function getSystemStatistics() {
  const db = await getDb();
  if (!db) return null;

  const userCount = await db.select().from(users);
  const documentCount = await db.select().from(documents);
  const packageCount = await db.select().from(documentPackages);

  return {
    totalUsers: userCount.length,
    totalDocuments: documentCount.length,
    totalPackages: packageCount.length,
    usersByRole: await getUserCountByRole(),
  };
}
