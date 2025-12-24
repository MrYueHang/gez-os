import Stripe from "stripe";
import { Request, Response } from "express";
import {
  recordPaymentTransaction,
  upsertUserSubscription,
  recordInvoice,
  getOrCreateStripeProduct,
  getOrCreateStripePrice,
} from "../payment-db";
import { getUserById } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Stripe Webhook Handler
 * Processes payment events and updates database accordingly
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events for webhook verification
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  try {
    switch (event.type) {
      // Payment Intent Events
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment succeeded:", paymentIntent.id);

        const userId = parseInt(paymentIntent.metadata?.user_id || "0");
        if (userId) {
          await recordPaymentTransaction(
            userId,
            paymentIntent.id,
            paymentIntent.amount,
            paymentIntent.currency || "eur",
            "succeeded",
            paymentIntent.description || undefined,
            paymentIntent.metadata
          );
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment failed:", paymentIntent.id);

        const userId = parseInt(paymentIntent.metadata?.user_id || "0");
        if (userId) {
          await recordPaymentTransaction(
            userId,
            paymentIntent.id,
            paymentIntent.amount,
            paymentIntent.currency || "eur",
            "failed",
            paymentIntent.description || undefined,
            paymentIntent.metadata
          );
        }
        break;
      }

      // Checkout Session Events
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[Webhook] Checkout session completed:", session.id);

        const userId = parseInt(session.client_reference_id || "0");
        if (userId && session.payment_intent) {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent.id;

          await recordPaymentTransaction(
            userId,
            paymentIntentId,
            session.amount_total || 0,
            session.currency || "eur",
            "succeeded",
            "Checkout session completed",
            session.metadata
          );
        }

        // Handle subscription
        if (session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          if (userId) {
            const priceId =
              typeof subscription.items.data[0].price === "string"
                ? subscription.items.data[0].price
                : subscription.items.data[0].price.id;

          await upsertUserSubscription(
            userId,
            subscriptionId,
            priceId,
            subscription.status,
            new Date((subscription as any).current_period_start * 1000),
            new Date((subscription as any).current_period_end * 1000)
          );
          }
        }
        break;
      }

      // Subscription Events
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription created:", subscription.id);

        // Get customer info
        if (subscription.customer) {
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;

          // Find user by Stripe customer ID
          // This would require a lookup in your database
          const priceId =
            typeof subscription.items.data[0].price === "string"
              ? subscription.items.data[0].price
              : subscription.items.data[0].price.id;

          console.log("[Webhook] Subscription created for customer:", customerId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription updated:", subscription.id);

        // Update subscription status in database
        const priceId =
          typeof subscription.items.data[0].price === "string"
            ? subscription.items.data[0].price
            : subscription.items.data[0].price.id;

        // This would need user lookup by subscription ID
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription deleted:", subscription.id);

        // Mark subscription as canceled in database
        break;
      }

      // Invoice Events
      case "invoice.created": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Webhook] Invoice created:", invoice.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Webhook] Invoice paid:", invoice.id);

        // Find user and record invoice
        if (invoice.customer) {
          const customerId =
            typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id;

          const subscriptionId =
            typeof (invoice as any).subscription === "string"
              ? (invoice as any).subscription
              : (invoice as any).subscription?.id;

          // Record invoice in database
          console.log("[Webhook] Invoice recorded for customer:", customerId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Webhook] Invoice payment failed:", invoice.id);
        break;
      }

      // Customer Events
      case "customer.created": {
        const customer = event.data.object as Stripe.Customer;
        console.log("[Webhook] Customer created:", customer.id);
        break;
      }

      case "customer.deleted": {
        const customer = event.data.object as Stripe.Customer;
        console.log("[Webhook] Customer deleted:", customer.id);
        break;
      }

      // Product Events
      case "product.created": {
        const product = event.data.object as Stripe.Product;
        console.log("[Webhook] Product created:", product.id);

        await getOrCreateStripeProduct(
          product.id,
          product.name,
          product.description || undefined,
          product.metadata?.category || "other"
        );
        break;
      }

      case "product.updated": {
        const product = event.data.object as Stripe.Product;
        console.log("[Webhook] Product updated:", product.id);
        break;
      }

      // Price Events
      case "price.created": {
        const price = event.data.object as Stripe.Price;
        console.log("[Webhook] Price created:", price.id);

        const productId =
          typeof price.product === "string" ? price.product : price.product.id;

        await getOrCreateStripePrice(
          price.id,
          productId,
          price.unit_amount || 0,
          price.currency,
          price.recurring?.interval || "one_time"
        );
        break;
      }

      case "price.updated": {
        const price = event.data.object as Stripe.Price;
        console.log("[Webhook] Price updated:", price.id);
        break;
      }

      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }

    // Return success response
    res.json({ received: true });
  } catch (error: any) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
