import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { paymentRouter } from "./payment-router";
import { downloadRouter } from "./download-router";
import { adminRouter } from "./admin-router";
import { localAuthRouter } from "./local-auth";
import { aiRouter } from "./ai-router";
import { z } from "zod";
import {
  getCasesByUserId,
  getCommunityPosts,
  getCommunityPostsByCategory,
  searchCommunityPosts,
  getActivePollsWithVotes,
  getUserPollVote,
  getArgumentsByPosition,
  getOpinionLeaders,
  getWikiArticles,
  getWikiArticleBySlug,
  getLawyerProfiles,
  getWordCloudData,
  getExternalResources,
  getPlatformStatistics,
} from "./db";
import { getDb } from "./db";
import { cases, communityPosts, pollVotes, argumentsTable } from "../drizzle/schema";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    local: localAuthRouter,
  }),

  // Cases router
  cases: router({
    list: protectedProcedure.query(({ ctx }) =>
      getCasesByUserId(ctx.user.id)
    ),
  }),

  // Community router
  community: router({
    posts: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ input }) => getCommunityPosts(input.limit, input.offset)),
    
    postsByCategory: publicProcedure
      .input(z.object({ category: z.string(), limit: z.number().default(20) }))
      .query(({ input }) => getCommunityPostsByCategory(input.category, input.limit)),
    
    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().default(20) }))
      .query(({ input }) => searchCommunityPosts(input.query, input.limit)),
  }),

  // Polls router
  polls: router({
    active: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(({ input }) => getActivePollsWithVotes(input.limit)),
  }),

  // Arguments router
  arguments: router({
    byPosition: publicProcedure
      .input(z.object({ position: z.number().min(1).max(5), limit: z.number().default(20) }))
      .query(({ input }) => getArgumentsByPosition(input.position, input.limit)),
    
    opinionLeaders: publicProcedure
      .query(() => getOpinionLeaders()),
  }),

  // Wiki router
  wiki: router({
    articles: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(({ input }) => getWikiArticles(input.limit)),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getWikiArticleBySlug(input.slug)),
  }),

  // Lawyer directory router
  lawyers: router({
    list: publicProcedure
      .query(() => getLawyerProfiles()),
  }),

  // Word cloud router
  wordCloud: router({
    data: publicProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(({ input }) => getWordCloudData(input.limit)),
  }),

  // External resources router
  resources: router({
    external: publicProcedure
      .query(() => getExternalResources()),
  }),

  // Statistics router
  stats: router({
    platform: publicProcedure
      .query(() => getPlatformStatistics()),
  }),

  // Payment router
  payment: paymentRouter,

  // Download router
  download: downloadRouter,

  // Admin router
  admin: adminRouter,

  // AI Services router
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
