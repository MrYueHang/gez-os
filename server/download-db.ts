import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  userPurchases,
  documentDownloads,
  documentPackages,
} from "../drizzle/schema";

/**
 * Create a user purchase record after successful payment
 */
export async function createUserPurchase(
  userId: number,
  stripePaymentIntentId: string,
  packageType: string,
  packageName: string,
  amount: number,
  currency: string = "eur"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userPurchases).values({
    userId,
    stripePaymentIntentId,
    packageType: packageType as any,
    packageName,
    amount,
    currency,
    status: "completed",
  });

  return result;
}

/**
 * Get user's purchases
 */
export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(userPurchases)
    .where(eq(userPurchases.userId, userId))
    .orderBy(desc(userPurchases.createdAt));
}

/**
 * Get a specific purchase by ID
 */
export async function getPurchaseById(purchaseId: number, userId?: number) {
  const db = await getDb();
  if (!db) return undefined;

  const conditions = [eq(userPurchases.id, purchaseId)];
  if (userId) {
    conditions.push(eq(userPurchases.userId, userId));
  }

  const result = await db
    .select()
    .from(userPurchases)
    .where(and(...conditions))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get purchase by Stripe payment intent ID
 */
export async function getPurchaseByPaymentIntent(stripePaymentIntentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userPurchases)
    .where(eq(userPurchases.stripePaymentIntentId, stripePaymentIntentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Record a document download
 */
export async function recordDocumentDownload(
  purchaseId: number,
  userId: number,
  documentName: string,
  documentPath: string,
  documentSize?: number,
  ipAddress?: string,
  userAgent?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Record the download
  await db.insert(documentDownloads).values({
    purchaseId,
    userId,
    documentName,
    documentPath,
    documentSize,
    ipAddress,
    userAgent,
  });

  // Update download count and last download time
  await db
    .update(userPurchases)
    .set({
      downloadCount: (userPurchases.downloadCount as any) + 1,
      lastDownloadedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userPurchases.id, purchaseId));
}

/**
 * Get download history for a purchase
 */
export async function getPurchaseDownloadHistory(purchaseId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(documentDownloads)
    .where(eq(documentDownloads.purchaseId, purchaseId))
    .orderBy(desc(documentDownloads.downloadedAt));
}

/**
 * Get all downloads for a user
 */
export async function getUserDownloadHistory(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(documentDownloads)
    .where(eq(documentDownloads.userId, userId))
    .orderBy(desc(documentDownloads.downloadedAt))
    .limit(limit);
}

/**
 * Create a document package
 */
export async function createDocumentPackage(
  packageType: string,
  name: string,
  description: string,
  documents: any[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(documentPackages).values({
    packageType,
    name,
    description,
    documents,
  });
}

/**
 * Get document package by type
 */
export async function getDocumentPackage(packageType: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(documentPackages)
    .where(eq(documentPackages.packageType, packageType))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all active document packages
 */
export async function getAllDocumentPackages() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(documentPackages)
    .where(eq(documentPackages.isActive, true));
}

/**
 * Check if user has access to a package
 */
export async function userHasAccessToPackage(
  userId: number,
  packageType: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(userPurchases)
    .where(
      and(
        eq(userPurchases.userId, userId),
        eq(userPurchases.packageType, packageType as any),
        eq(userPurchases.status, "completed")
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Get user's accessible packages
 */
export async function getUserAccessiblePackages(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const purchases = await db
    .select()
    .from(userPurchases)
    .where(
      and(
        eq(userPurchases.userId, userId),
        eq(userPurchases.status, "completed")
      )
    );

  // Get unique package types
  const packageTypes = Array.from(new Set(purchases.map((p) => p.packageType)));

  // Get package details
  const packages = await Promise.all(
    packageTypes.map((type) => getDocumentPackage(type))
  );

  return packages.filter((p) => p !== undefined);
}
