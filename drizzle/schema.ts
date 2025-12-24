import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "lawyer", "moderator"]).default("user").notNull(),
  
  // GEZy OS specific fields
  bio: text("bio"),
  avatar: varchar("avatar", { length: 512 }),
  isLawyer: boolean("isLawyer").default(false),
  lawyerSpecializations: json("lawyerSpecializations"),
  lawyerContact: varchar("lawyerContact", { length: 255 }),
  isOpinionLeader: boolean("isOpinionLeader").default(false),
  opinionLeaderBio: text("opinionLeaderBio"),
  argumentPosition: int("argumentPosition"),
  
  // Stripe integration
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).unique(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  roleIdx: index("role_idx").on(table.role),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Cases table: Stores GEZ cases and other legal matters
 */
export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  caseType: mysqlEnum("caseType", [
    "Beitragsbescheid",
    "Mahnung",
    "Vollstreckung",
    "Härtefall",
    "Umzug",
    "Befreiung",
    "Treuhand",
    "Schadensersatz",
    "Sonstiges"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", [
    "Neu",
    "In Bearbeitung",
    "Widerspruch eingereicht",
    "Anwalt konsultiert",
    "Abgeschlossen",
    "Archiviert"
  ]).default("Neu").notNull(),
  
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  
  receivedDate: timestamp("receivedDate"),
  deadline: timestamp("deadline"),
  
  assignedLawyerId: int("assignedLawyerId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("cases_userId_idx").on(table.userId),
  caseTypeIdx: index("cases_caseType_idx").on(table.caseType),
  statusIdx: index("cases_status_idx").on(table.status),
}));

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

/**
 * Documents table: Stores uploaded documents and generated templates
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  userId: int("userId").notNull(),
  
  filename: varchar("filename", { length: 255 }).notNull(),
  documentType: mysqlEnum("documentType", [
    "Beitragsbescheid",
    "Mahnung",
    "Vollstreckungsbescheid",
    "Widerspruch",
    "Auskunftsersuchen",
    "Härtefallantrag",
    "Anwaltsschreiben",
    "Sonstiges"
  ]).notNull(),
  
  s3Key: varchar("s3Key", { length: 512 }).notNull(),
  s3Url: varchar("s3Url", { length: 512 }),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  
  extractedData: json("extractedData"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  caseIdIdx: index("documents_caseId_idx").on(table.caseId),
  userIdIdx: index("documents_userId_idx").on(table.userId),
}));

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Community posts and discussions
 */
export const communityPosts = mysqlTable("communityPosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", [
    "Erfahrungsbericht",
    "Frage",
    "Tipp",
    "Ressource",
    "Erfolgsgeschichte",
    "Diskussion"
  ]).notNull(),
  
  tags: json("tags"),
  sentiment: mysqlEnum("sentiment", ["positiv", "neutral", "negativ"]),
  
  upvotes: int("upvotes").default(0),
  downvotes: int("downvotes").default(0),
  commentCount: int("commentCount").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("communityPosts_userId_idx").on(table.userId),
  categoryIdx: index("communityPosts_category_idx").on(table.category),
}));

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Polls and surveys (Abstimmungen)
 */
export const polls = mysqlTable("polls", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pollType: mysqlEnum("pollType", ["Ja/Nein", "Multiple Choice", "Ranking", "Tier-Umfrage"]).notNull(),
  
  options: json("options"),
  
  isActive: boolean("isActive").default(true),
  totalVotes: int("totalVotes").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  createdByIdx: index("polls_createdBy_idx").on(table.createdBy),
}));

export type Poll = typeof polls.$inferSelect;
export type InsertPoll = typeof polls.$inferInsert;

/**
 * Poll votes
 */
export const pollVotes = mysqlTable("pollVotes", {
  id: int("id").autoincrement().primaryKey(),
  pollId: int("pollId").notNull(),
  userId: int("userId").notNull(),
  
  selectedOption: varchar("selectedOption", { length: 255 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  pollIdIdx: index("pollVotes_pollId_idx").on(table.pollId),
  userIdIdx: index("pollVotes_userId_idx").on(table.userId),
}));

export type PollVote = typeof pollVotes.$inferSelect;
export type InsertPollVote = typeof pollVotes.$inferInsert;

/**
 * Arguments and positions (for Argument Synthesizer)
 */
export const argumentsTable = mysqlTable("arguments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  
  position: int("position").notNull(),
  politicalSpectrum: int("politicalSpectrum"),
  
  category: varchar("category", { length: 100 }),
  
  upvotes: int("upvotes").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("arguments_userId_idx").on(table.userId),
  positionIdx: index("arguments_position_idx").on(table.position),
}));

export type Argument = typeof argumentsTable.$inferSelect;
export type InsertArgument = typeof argumentsTable.$inferInsert;

/**
 * Wiki articles (Legal knowledge base)
 */
export const wikiArticles = mysqlTable("wikiArticles", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  content: text("content").notNull(),
  
  category: varchar("category", { length: 100 }),
  tags: json("tags"),
  
  isPublished: boolean("isPublished").default(false),
  views: int("views").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  createdByIdx: index("wikiArticles_createdBy_idx").on(table.createdBy),
  slugIdx: index("wikiArticles_slug_idx").on(table.slug),
}));

export type WikiArticle = typeof wikiArticles.$inferSelect;
export type InsertWikiArticle = typeof wikiArticles.$inferInsert;

/**
 * Newsletter subscriptions
 */
export const newsletterSubscriptions = mysqlTable("newsletterSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  email: varchar("email", { length: 320 }).notNull(),
  isSubscribed: boolean("isSubscribed").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("newsletterSubscriptions_userId_idx").on(table.userId),
  emailIdx: index("newsletterSubscriptions_email_idx").on(table.email),
}));

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;

/**
 * Newsletter issues
 */
export const newsletterIssues = mysqlTable("newsletterIssues", {
  id: int("id").autoincrement().primaryKey(),
  
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  
  issueNumber: int("issueNumber"),
  
  sentAt: timestamp("sentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterIssue = typeof newsletterIssues.$inferSelect;
export type InsertNewsletterIssue = typeof newsletterIssues.$inferInsert;

/**
 * External community links and resources
 */
export const externalResources = mysqlTable("externalResources", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  description: text("description"),
  resourceType: mysqlEnum("resourceType", [
    "Community",
    "Informationsseite",
    "Forum",
    "Boykott-Initiative",
    "Rechtliche Ressource"
  ]).notNull(),
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExternalResource = typeof externalResources.$inferSelect;
export type InsertExternalResource = typeof externalResources.$inferInsert;

/**
 * Word cloud data (for sentiment analysis and trending topics)
 */
export const wordCloudData = mysqlTable("wordCloudData", {
  id: int("id").autoincrement().primaryKey(),
  
  word: varchar("word", { length: 255 }).notNull().unique(),
  frequency: int("frequency").default(1),
  sentiment: mysqlEnum("sentiment", ["positiv", "neutral", "negativ"]),
  category: varchar("category", { length: 100 }),
  
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  wordIdx: index("wordCloudData_word_idx").on(table.word),
}));

export type WordCloudData = typeof wordCloudData.$inferSelect;
export type InsertWordCloudData = typeof wordCloudData.$inferInsert;

/**
 * Data room: Structured document storage for processes
 */
export const dataRooms = mysqlTable("dataRooms", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  userId: int("userId").notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  caseIdIdx: index("dataRooms_caseId_idx").on(table.caseId),
  userIdIdx: index("dataRooms_userId_idx").on(table.userId),
}));

export type DataRoom = typeof dataRooms.$inferSelect;
export type InsertDataRoom = typeof dataRooms.$inferInsert;

/**
 * Data room files
 */
export const dataRoomFiles = mysqlTable("dataRoomFiles", {
  id: int("id").autoincrement().primaryKey(),
  dataRoomId: int("dataRoomId").notNull(),
  
  filename: varchar("filename", { length: 255 }).notNull(),
  s3Key: varchar("s3Key", { length: 512 }).notNull(),
  s3Url: varchar("s3Url", { length: 512 }),
  
  fileType: varchar("fileType", { length: 100 }),
  fileSize: int("fileSize"),
  
  uploadedBy: int("uploadedBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  dataRoomIdIdx: index("dataRoomFiles_dataRoomId_idx").on(table.dataRoomId),
}));

export type DataRoomFile = typeof dataRoomFiles.$inferSelect;
export type InsertDataRoomFile = typeof dataRoomFiles.$inferInsert;

/**
 * Lawyer profiles and specializations
 */
export const lawyerProfiles = mysqlTable("lawyerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  firmName: varchar("firmName", { length: 255 }),
  location: varchar("location", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  website: varchar("website", { length: 512 }),
  
  specializations: json("specializations"),
  experience: int("experience"),
  
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: int("reviewCount").default(0),
  
  isVerified: boolean("isVerified").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("lawyerProfiles_userId_idx").on(table.userId),
}));

export type LawyerProfile = typeof lawyerProfiles.$inferSelect;
export type InsertLawyerProfile = typeof lawyerProfiles.$inferInsert;

/**
 * Lawyer reviews
 */
export const lawyerReviews = mysqlTable("lawyerReviews", {
  id: int("id").autoincrement().primaryKey(),
  lawyerId: int("lawyerId").notNull(),
  userId: int("userId").notNull(),
  
  rating: int("rating").notNull(),
  comment: text("comment"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  lawyerIdIdx: index("lawyerReviews_lawyerId_idx").on(table.lawyerId),
  userIdIdx: index("lawyerReviews_userId_idx").on(table.userId),
}));

export type LawyerReview = typeof lawyerReviews.$inferSelect;
export type InsertLawyerReview = typeof lawyerReviews.$inferInsert;

/**
 * Stripe Products: Lawyer services, premium features, consultation packages
 */
export const stripeProducts = mysqlTable("stripeProducts", {
  id: int("id").autoincrement().primaryKey(),
  stripeProductId: varchar("stripeProductId", { length: 255 }).notNull().unique(),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["lawyer_consultation", "premium_feature", "document_package", "subscription", "other"]).notNull(),
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeProduct = typeof stripeProducts.$inferSelect;
export type InsertStripeProduct = typeof stripeProducts.$inferInsert;

/**
 * Stripe Prices: Different pricing tiers for products
 */
export const stripePrices = mysqlTable("stripePrices", {
  id: int("id").autoincrement().primaryKey(),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull().unique(),
  stripeProductId: varchar("stripeProductId", { length: 255 }).notNull(),
  
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("eur").notNull(),
  interval: mysqlEnum("interval", ["one_time", "month", "year"]).notNull(),
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  stripeProductIdIdx: index("stripePrices_stripeProductId_idx").on(table.stripeProductId),
}));

export type StripePrice = typeof stripePrices.$inferSelect;
export type InsertStripePrice = typeof stripePrices.$inferInsert;

/**
 * User Subscriptions: Track active subscriptions
 */
export const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(),
  
  status: mysqlEnum("status", ["active", "paused", "canceled", "past_due"]).notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  
  canceledAt: timestamp("canceledAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userSubscriptions_userId_idx").on(table.userId),
  statusIdx: index("userSubscriptions_status_idx").on(table.status),
}));

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Payment Transactions: Track all payments
 */
export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("eur").notNull(),
  
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "canceled"]).notNull(),
  
  description: varchar("description", { length: 512 }),
  metadata: json("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("paymentTransactions_userId_idx").on(table.userId),
  statusIdx: index("paymentTransactions_status_idx").on(table.status),
}));

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

/**
 * Invoices: Track subscription invoices
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("eur").notNull(),
  
  status: mysqlEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).notNull(),
  
  paidAt: timestamp("paidAt"),
  dueDate: timestamp("dueDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("invoices_userId_idx").on(table.userId),
  statusIdx: index("invoices_status_idx").on(table.status),
}));

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Promo Codes: Track discount codes
 */
export const promoCodes = mysqlTable("promoCodes", {
  id: int("id").autoincrement().primaryKey(),
  stripePromotionCodeId: varchar("stripePromotionCodeId", { length: 255 }).notNull().unique(),
  stripeCouponId: varchar("stripeCouponId", { length: 255 }).notNull(),
  
  code: varchar("code", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;


/**
 * User Purchases: Track all document package purchases
 */
export const userPurchases = mysqlTable("userPurchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull(),
  
  packageType: mysqlEnum("packageType", ["docs_basic", "docs_complete", "consultation_30", "consultation_60", "premium_monthly", "premium_yearly"]).notNull(),
  packageName: varchar("packageName", { length: 255 }).notNull(),
  
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("eur").notNull(),
  
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  
  downloadCount: int("downloadCount").default(0),
  lastDownloadedAt: timestamp("lastDownloadedAt"),
  
  expiresAt: timestamp("expiresAt"), // Optional expiration for time-limited access
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userPurchases_userId_idx").on(table.userId),
  statusIdx: index("userPurchases_status_idx").on(table.status),
  paymentIntentIdx: index("userPurchases_paymentIntentId_idx").on(table.stripePaymentIntentId),
}));

export type UserPurchase = typeof userPurchases.$inferSelect;
export type InsertUserPurchase = typeof userPurchases.$inferInsert;

/**
 * Document Downloads: Track individual document downloads
 */
export const documentDownloads = mysqlTable("documentDownloads", {
  id: int("id").autoincrement().primaryKey(),
  purchaseId: int("purchaseId").notNull(),
  userId: int("userId").notNull(),
  
  documentName: varchar("documentName", { length: 255 }).notNull(),
  documentPath: varchar("documentPath", { length: 512 }).notNull(), // S3 path
  documentSize: int("documentSize"), // in bytes
  
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"), // Browser info
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  purchaseIdIdx: index("documentDownloads_purchaseId_idx").on(table.purchaseId),
  userIdIdx: index("documentDownloads_userId_idx").on(table.userId),
}));

export type DocumentDownload = typeof documentDownloads.$inferSelect;
export type InsertDocumentDownload = typeof documentDownloads.$inferInsert;

/**
 * Document Packages: Define available document packages and their contents
 */
export const documentPackages = mysqlTable("documentPackages", {
  id: int("id").autoincrement().primaryKey(),
  
  packageType: varchar("packageType", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  documents: json("documents"), // Array of document metadata
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentPackage = typeof documentPackages.$inferSelect;
export type InsertDocumentPackage = typeof documentPackages.$inferInsert;
