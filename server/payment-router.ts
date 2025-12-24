import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import Stripe from "stripe";
import {
  recordPaymentTransaction,
  getUserPaymentTransactions,
  getUserSubscriptions,
  getUserInvoices,
  getPromoCode,
} from "./payment-db";
import { getUserById } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const paymentRouter = router({
  /**
   * Create a checkout session for one-time purchases or subscriptions
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        stripePriceId: z.string(),
        successUrl: z.string().optional(),
        cancelUrl: z.string().optional(),
        promoCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user.email) {
        throw new Error("User email is required for checkout");
      }

      try {
        // Build line items
        const lineItems = [
          {
            price: input.stripePriceId,
            quantity: 1,
          },
        ];

        // Build session parameters
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
          customer_email: user.email,
          line_items: lineItems,
          mode: "payment", // Will be updated for subscriptions
          success_url: input.successUrl || `${ctx.req.headers.origin}/dashboard?payment=success`,
          cancel_url: input.cancelUrl || `${ctx.req.headers.origin}/dashboard?payment=canceled`,
          client_reference_id: user.id.toString(),
          metadata: {
            user_id: user.id.toString(),
            customer_email: user.email,
            customer_name: user.name || "Unknown",
          },
          allow_promotion_codes: true,
        };

        // Create checkout session
        const session = await stripe.checkout.sessions.create(sessionParams);

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("[Payment] Checkout session creation failed:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  /**
   * Create a subscription checkout session
   */
  createSubscriptionCheckout: protectedProcedure
    .input(
      z.object({
        stripePriceId: z.string(),
        successUrl: z.string().optional(),
        cancelUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user.email) {
        throw new Error("User email is required for checkout");
      }

      try {
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
          customer_email: user.email,
          line_items: [
            {
              price: input.stripePriceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: input.successUrl || `${ctx.req.headers.origin}/dashboard?subscription=success`,
          cancel_url: input.cancelUrl || `${ctx.req.headers.origin}/dashboard?subscription=canceled`,
          client_reference_id: user.id.toString(),
          metadata: {
            user_id: user.id.toString(),
            customer_email: user.email,
            customer_name: user.name || "Unknown",
          },
          allow_promotion_codes: true,
        };

        const session = await stripe.checkout.sessions.create(sessionParams);

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("[Payment] Subscription checkout creation failed:", error);
        throw new Error("Failed to create subscription checkout");
      }
    }),

  /**
   * Get user's payment history
   */
  getPaymentHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return getUserPaymentTransactions(ctx.user.id, input.limit);
    }),

  /**
   * Get user's subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return getUserSubscriptions(ctx.user.id);
  }),

  /**
   * Get user's invoices
   */
  getInvoices: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return getUserInvoices(ctx.user.id, input.limit);
    }),

  /**
   * Cancel a subscription
   */
  cancelSubscription: protectedProcedure
    .input(z.object({ stripeSubscriptionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const subscription = await stripe.subscriptions.cancel(input.stripeSubscriptionId);
        return {
          success: true,
          status: subscription.status,
        };
      } catch (error) {
        console.error("[Payment] Subscription cancellation failed:", error);
        throw new Error("Failed to cancel subscription");
      }
    }),

  /**
   * Validate promo code
   */
  validatePromoCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const promoCode = await getPromoCode(input.code);
      if (!promoCode || !promoCode.isActive) {
        return {
          valid: false,
          message: "Promo code not found or inactive",
        };
      }

      return {
        valid: true,
        code: promoCode.code,
        message: "Promo code is valid",
      };
    }),

  /**
   * Get checkout session details
   */
  getCheckoutSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        return {
          id: session.id,
          status: session.payment_status,
          customer_email: session.customer_email,
          amount_total: session.amount_total,
          currency: session.currency,
        };
      } catch (error) {
        console.error("[Payment] Failed to retrieve session:", error);
        throw new Error("Failed to retrieve checkout session");
      }
    }),

  /**
   * Get available products and prices
   */
  getProducts: publicProcedure.query(async () => {
    try {
      const products = await stripe.products.list({
        active: true,
        limit: 100,
      });

      const productsWithPrices = await Promise.all(
        products.data.map(async (product: Stripe.Product) => {
          const prices = await stripe.prices.list({
            product: product.id,
            active: true,
          });

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            prices: prices.data.map((price: Stripe.Price) => ({
              id: price.id,
              amount: price.unit_amount,
              currency: price.currency,
              interval: price.recurring?.interval || "one_time",
              recurring: price.recurring,
            })),
          };
        })
      );

      return productsWithPrices;
    } catch (error) {
      console.error("[Payment] Failed to fetch products:", error);
      throw new Error("Failed to fetch products");
    }
  }),
});

export type PaymentRouter = typeof paymentRouter;
