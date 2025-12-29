import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import * as db from "./db";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";

const SALT_ROUNDS = 10;

export const localAuthRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password, name } = input;

      // Check if user already exists
      const dbInstance = getDb();
      const existingUser = await dbInstance.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const [newUser] = await dbInstance
        .insert(users)
        .values({
          email,
          passwordHash,
          name,
          loginMethod: "local",
          lastSignedIn: new Date(),
        })
        .$returningId();

      // Create session token
      const sessionToken = await sdk.createSessionToken(String(newUser.id), {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return {
        success: true,
        user: {
          id: newUser.id,
          email,
          name,
        },
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      // Find user
      const dbInstance = getDb();
      const user = await dbInstance.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user || !user.passwordHash) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new Error("Invalid email or password");
      }

      // Update last signed in
      await dbInstance
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      // Create session token
      const sessionToken = await sdk.createSessionToken(String(user.id), {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),
});
