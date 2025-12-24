import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getAllDocuments,
  getDocumentsByType,
  updateDocumentMetadata,
  deleteDocument,
  getAllDocumentPackages,
  upsertDocumentPackage,
  deleteDocumentPackage,
  getAdminsAndModerators,
  updateUserRole,
  getSystemStatistics,
} from "./admin-db";

/**
 * Admin router - requires admin role
 */
export const adminRouter = router({
  /**
   * Check if user is admin
   */
  isAdmin: protectedProcedure.query(({ ctx }) => {
    return ctx.user.role === "admin";
  }),

  /**
   * Get all documents (admin only)
   */
  getAllDocuments: protectedProcedure
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      return getAllDocuments(input.limit, input.offset);
    }),

  /**
   * Get documents by type
   */
  getDocumentsByType: protectedProcedure
    .input(z.object({ documentType: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      return getDocumentsByType(input.documentType, input.limit);
    }),

  /**
   * Update document metadata
   */
  updateDocumentMetadata: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        updates: z.object({
          filename: z.string().optional(),
          documentType: z.string().optional(),
          mimeType: z.string().optional(),
          fileSize: z.number().optional(),
          extractedData: z.any().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      return updateDocumentMetadata(input.documentId, input.updates);
    }),

  /**
   * Delete document
   */
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      return deleteDocument(input.documentId);
    }),

  /**
   * Get all document packages
   */
  getAllDocumentPackages: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }
    return getAllDocumentPackages();
  }),

  /**
   * Create or update document package
   */
  upsertDocumentPackage: protectedProcedure
    .input(
      z.object({
        packageType: z.string(),
        name: z.string(),
        description: z.string(),
        documents: z.array(z.any()),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      return upsertDocumentPackage(
        input.packageType,
        input.name,
        input.description,
        input.documents,
        input.isActive
      );
    }),

  /**
   * Delete document package
   */
  deleteDocumentPackage: protectedProcedure
    .input(z.object({ packageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      return deleteDocumentPackage(input.packageId);
    }),

  /**
   * Get all admins and moderators
   */
  getAdminsAndModerators: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }
    return getAdminsAndModerators();
  }),

  /**
   * Update user role
   */
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "lawyer", "moderator"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      return updateUserRole(input.userId, input.role);
    }),

  /**
   * Get system statistics
   */
  getSystemStatistics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }
    return getSystemStatistics();
  }),
});

export type AdminRouter = typeof adminRouter;
