import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getUserPurchases,
  getPurchaseById,
  recordDocumentDownload,
  getPurchaseDownloadHistory,
  getUserDownloadHistory,
  userHasAccessToPackage,
  getUserAccessiblePackages,
  getDocumentPackage,
} from "./download-db";
import { storagePut, storageGet } from "./storage";

export const downloadRouter = router({
  /**
   * Get user's purchases
   */
  getPurchases: protectedProcedure.query(async ({ ctx }) => {
    return getUserPurchases(ctx.user.id);
  }),

  /**
   * Get a specific purchase with download history
   */
  getPurchaseDetails: protectedProcedure
    .input(z.object({ purchaseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const purchase = await getPurchaseById(input.purchaseId, ctx.user.id);
      if (!purchase) {
        throw new Error("Purchase not found or access denied");
      }

      const downloadHistory = await getPurchaseDownloadHistory(input.purchaseId);

      return {
        purchase,
        downloadHistory,
      };
    }),

  /**
   * Get user's download history
   */
  getDownloadHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      return getUserDownloadHistory(ctx.user.id, input.limit);
    }),

  /**
   * Get user's accessible packages
   */
  getAccessiblePackages: protectedProcedure.query(async ({ ctx }) => {
    return getUserAccessiblePackages(ctx.user.id);
  }),

  /**
   * Check if user has access to a specific package
   */
  hasPackageAccess: protectedProcedure
    .input(z.object({ packageType: z.string() }))
    .query(async ({ ctx, input }) => {
      return userHasAccessToPackage(ctx.user.id, input.packageType);
    }),

  /**
   * Get download link for a document
   * This generates a presigned URL from S3
   */
  getDownloadLink: protectedProcedure
    .input(
      z.object({
        purchaseId: z.number(),
        documentPath: z.string(),
        documentName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify purchase ownership
      const purchase = await getPurchaseById(input.purchaseId, ctx.user.id);
      if (!purchase) {
        throw new Error("Purchase not found or access denied");
      }

      if (purchase.status !== "completed") {
        throw new Error("Purchase not completed");
      }

      try {
        // Get presigned download URL from S3
        const { url } = await storageGet(input.documentPath);

        // Record the download
        await recordDocumentDownload(
          input.purchaseId,
          ctx.user.id,
          input.documentName,
          input.documentPath,
          undefined,
          ctx.req.ip || ctx.req.socket.remoteAddress,
          ctx.req.headers["user-agent"]
        );

        return {
          success: true,
          downloadUrl: url,
        };
      } catch (error) {
        console.error("[Download] Failed to generate download link:", error);
        throw new Error("Failed to generate download link");
      }
    }),

  /**
   * Get document package details
   */
  getPackageDetails: publicProcedure
    .input(z.object({ packageType: z.string() }))
    .query(async ({ input }) => {
      return getDocumentPackage(input.packageType);
    }),

  /**
   * Initiate document download (for analytics)
   */
  initiateDownload: protectedProcedure
    .input(
      z.object({
        purchaseId: z.number(),
        documentName: z.string(),
        documentPath: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify purchase
      const purchase = await getPurchaseById(input.purchaseId, ctx.user.id);
      if (!purchase || purchase.status !== "completed") {
        throw new Error("Invalid purchase");
      }

      try {
        // Record download attempt
        await recordDocumentDownload(
          input.purchaseId,
          ctx.user.id,
          input.documentName,
          input.documentPath,
          undefined,
          ctx.req.ip || ctx.req.socket.remoteAddress,
          ctx.req.headers["user-agent"]
        );

        return {
          success: true,
          message: "Download recorded",
        };
      } catch (error) {
        console.error("[Download] Failed to record download:", error);
        throw new Error("Failed to record download");
      }
    }),
});

export type DownloadRouter = typeof downloadRouter;
