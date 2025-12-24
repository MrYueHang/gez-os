import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  userSubscriptions,
  paymentTransactions,
  invoices,
  stripeProducts,
  stripePrices,
  promoCodes,
} from "../drizzle/schema";

/**
 * Create or update user subscription
 */
export async function upsertUserSubscription(
  userId: number,
  stripeSubscriptionId: string,
  stripePriceId: string,
  status: string,
  currentPeriodStart?: Date,
  currentPeriodEnd?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing subscription
    await db
      .update(userSubscriptions)
      .set({
        status: status as any,
        currentPeriodStart,
        currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId));
  } else {
    // Create new subscription
    await db.insert(userSubscriptions).values({
      userId,
      stripeSubscriptionId,
      stripePriceId,
      status: status as any,
      currentPeriodStart,
      currentPeriodEnd,
    });
  }
}

/**
 * Get user's active subscriptions
 */
export async function getUserSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .orderBy(desc(userSubscriptions.createdAt));
}

/**
 * Get user's active subscription (if any)
 */
export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const subs = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  return subs.length > 0 ? subs[0] : undefined;
}

/**
 * Cancel user subscription
 */
export async function cancelUserSubscription(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userSubscriptions)
    .set({
      status: "canceled",
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

/**
 * Record payment transaction
 */
export async function recordPaymentTransaction(
  userId: number,
  stripePaymentIntentId: string,
  amount: number,
  currency: string,
  status: string,
  description?: string,
  metadata?: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(paymentTransactions).values({
    userId,
    stripePaymentIntentId,
    amount,
    currency,
    status: status as any,
    description,
    metadata,
  });
}

/**
 * Get user's payment transactions
 */
export async function getUserPaymentTransactions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.userId, userId))
    .orderBy(desc(paymentTransactions.createdAt))
    .limit(limit);
}

/**
 * Update payment transaction status
 */
export async function updatePaymentStatus(
  stripePaymentIntentId: string,
  status: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(paymentTransactions)
    .set({
      status: status as any,
      updatedAt: new Date(),
    })
    .where(eq(paymentTransactions.stripePaymentIntentId, stripePaymentIntentId));
}

/**
 * Record invoice
 */
export async function recordInvoice(
  userId: number,
  stripeInvoiceId: string,
  amount: number,
  currency: string,
  status: string,
  stripeSubscriptionId?: string,
  paidAt?: Date,
  dueDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(invoices).values({
    userId,
    stripeInvoiceId,
    stripeSubscriptionId,
    amount,
    currency,
    status: status as any,
    paidAt,
    dueDate,
  });
}

/**
 * Get user's invoices
 */
export async function getUserInvoices(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt))
    .limit(limit);
}

/**
 * Get or create Stripe product in database
 */
export async function getOrCreateStripeProduct(
  stripeProductId: string,
  name: string,
  description?: string,
  category?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(stripeProducts)
    .where(eq(stripeProducts.stripeProductId, stripeProductId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new product
  await db.insert(stripeProducts).values({
    stripeProductId,
    name,
    description,
    category: category as any,
  });

  const created = await db
    .select()
    .from(stripeProducts)
    .where(eq(stripeProducts.stripeProductId, stripeProductId))
    .limit(1);

  return created[0];
}

/**
 * Get or create Stripe price in database
 */
export async function getOrCreateStripePrice(
  stripePriceId: string,
  stripeProductId: string,
  amount: number,
  currency: string,
  interval: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(stripePrices)
    .where(eq(stripePrices.stripePriceId, stripePriceId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new price
  await db.insert(stripePrices).values({
    stripePriceId,
    stripeProductId,
    amount,
    currency,
    interval: interval as any,
  });

  const created = await db
    .select()
    .from(stripePrices)
    .where(eq(stripePrices.stripePriceId, stripePriceId))
    .limit(1);

  return created[0];
}

/**
 * Get promo code
 */
export async function getPromoCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.code, code.toUpperCase()))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}
