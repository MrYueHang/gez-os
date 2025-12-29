import { eq, desc, and, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  InsertUser,
  users,
  cases,
  communityPosts,
  polls,
  pollVotes,
  argumentsTable,
  wikiArticles,
  lawyerProfiles,
  wordCloudData,
  documents,
  externalResources,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import * as schema from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const connection = mysql.createPool(process.env.DATABASE_URL);
      _db = drizzle(connection, { schema, mode: 'default' });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db!;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Cases queries
export async function getCasesByUserId(userId: number) {
  const db = getDb();
  if (!db) return [];

  return db.select().from(cases).where(eq(cases.userId, userId)).orderBy(desc(cases.createdAt));
}

export async function getCaseById(caseId: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Community posts queries
export async function getCommunityPosts(limit = 20, offset = 0) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(communityPosts)
    .orderBy(desc(communityPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getCommunityPostsByCategory(categoryValue: string, limit = 20) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.category, categoryValue as any))
    .orderBy(desc(communityPosts.upvotes))
    .limit(limit);
}

export async function searchCommunityPosts(query: string, limit = 20) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(communityPosts)
    .where(like(communityPosts.title, `%${query}%`))
    .orderBy(desc(communityPosts.upvotes))
    .limit(limit);
}

// Polls queries
export async function getActivePollsWithVotes(limit = 10) {
  const db = getDb();
  if (!db) return [];

  const activePollsData = await db
    .select()
    .from(polls)
    .where(eq(polls.isActive, true))
    .orderBy(desc(polls.createdAt))
    .limit(limit);

  // Fetch vote counts for each poll
  const pollsWithVotes = await Promise.all(
    activePollsData.map(async (poll) => {
      const votes = await db
        .select()
        .from(pollVotes)
        .where(eq(pollVotes.pollId, poll.id));
      return { ...poll, votes };
    })
  );

  return pollsWithVotes;
}

export async function getUserPollVote(pollId: number, userId: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(pollVotes)
    .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Arguments queries
export async function getArgumentsByPosition(position: number, limit = 20) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(argumentsTable)
    .where(eq(argumentsTable.position, position))
    .orderBy(desc(argumentsTable.upvotes))
    .limit(limit);
}

export async function getOpinionLeaders() {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(users)
    .where(eq(users.isOpinionLeader, true))
    .orderBy(desc(users.createdAt));
}

// Wiki queries
export async function getWikiArticles(limit = 50) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(wikiArticles)
    .where(eq(wikiArticles.isPublished, true))
    .orderBy(desc(wikiArticles.views))
    .limit(limit);
}

export async function getWikiArticleBySlug(slug: string) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(wikiArticles)
    .where(eq(wikiArticles.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Lawyer queries
export async function getLawyerProfiles(limit = 50) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(lawyerProfiles)
    .where(eq(lawyerProfiles.isVerified, true))
    .orderBy(desc(lawyerProfiles.rating))
    .limit(limit);
}

export async function getLawyerProfileByUserId(userId: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(lawyerProfiles)
    .where(eq(lawyerProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Word cloud queries
export async function getWordCloudData(limit = 100) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(wordCloudData)
    .orderBy(desc(wordCloudData.frequency))
    .limit(limit);
}

// External resources
export async function getExternalResources() {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(externalResources)
    .where(eq(externalResources.isActive, true))
    .orderBy(desc(externalResources.createdAt));
}

// Statistics
export async function getPlatformStatistics() {
  const db = getDb();
  if (!db) return null;

  try {
    const totalUsers = await db.select().from(users);
    const totalCases = await db.select().from(cases);
    const totalPosts = await db.select().from(communityPosts);
    const activePollsCount = await db
      .select()
      .from(polls)
      .where(eq(polls.isActive, true));

    return {
      totalUsers: totalUsers.length,
      totalCases: totalCases.length,
      totalCommunityPosts: totalPosts.length,
      activePolls: activePollsCount.length,
    };
  } catch (error) {
    console.error("[Database] Failed to get statistics:", error);
    return null;
  }
}
