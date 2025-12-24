import { Express, raw } from "express";
import { handleStripeWebhook } from "../webhooks/stripe";

/**
 * Setup Stripe webhook endpoint
 * Must be registered BEFORE express.json() middleware
 */
export function setupStripeWebhook(app: Express) {
  // Register webhook endpoint with raw body parser
  // This must come BEFORE express.json() to preserve the raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    raw({ type: "application/json" }),
    handleStripeWebhook
  );

  console.log("[Stripe] Webhook endpoint registered at /api/stripe/webhook");
}

// Export for use in server setup
export default setupStripeWebhook;
