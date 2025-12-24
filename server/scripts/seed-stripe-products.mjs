#!/usr/bin/env node

/**
 * Seed script to create Stripe products and prices
 * Run with: node server/scripts/seed-stripe-products.mjs
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const products = [
  {
    name: "Anwaltskonsultation - 30 Minuten",
    description: "30-minütige Telefonkonsultation mit einem GEZ-Spezialisten",
    prices: [
      {
        amount: 4900, // €49.00
        currency: "eur",
        interval: "one_time",
      },
    ],
  },
  {
    name: "Anwaltskonsultation - 60 Minuten",
    description: "60-minütige Telefonkonsultation mit einem GEZ-Spezialisten",
    prices: [
      {
        amount: 8900, // €89.00
        currency: "eur",
        interval: "one_time",
      },
    ],
  },
  {
    name: "Dokumentenpaket - Basis",
    description: "Vorlagen für Widerspruch und Auskunftsersuchen",
    prices: [
      {
        amount: 1999, // €19.99
        currency: "eur",
        interval: "one_time",
      },
    ],
  },
  {
    name: "Dokumentenpaket - Komplett",
    description: "Alle Vorlagen: Widerspruch, Auskunftsersuchen, Härtefallantrag, Beschwerde",
    prices: [
      {
        amount: 3999, // €39.99
        currency: "eur",
        interval: "one_time",
      },
    ],
  },
  {
    name: "GEZy Premium - Monatlich",
    description: "Unbegrenzte Dokumentenzugriff, Prioritäts-Support, exklusive Community-Inhalte",
    prices: [
      {
        amount: 999, // €9.99
        currency: "eur",
        interval: "month",
      },
    ],
  },
  {
    name: "GEZy Premium - Jährlich",
    description: "Unbegrenzte Dokumentenzugriff, Prioritäts-Support, exklusive Community-Inhalte (2 Monate sparen!)",
    prices: [
      {
        amount: 9990, // €99.90
        currency: "eur",
        interval: "year",
      },
    ],
  },
  {
    name: "Anwaltsverzeichnis - Premium-Eintrag",
    description: "Erhöhte Sichtbarkeit im Anwaltsverzeichnis für 3 Monate",
    prices: [
      {
        amount: 4999, // €49.99
        currency: "eur",
        interval: "month",
      },
    ],
  },
];

async function seedProducts() {
  console.log("🚀 Starting Stripe product seeding...\n");

  try {
    for (const productData of products) {
      console.log(`📦 Creating product: ${productData.name}`);

      // Create product
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        type: "service",
      });

      console.log(`   ✓ Product created: ${product.id}`);

      // Create prices
      for (const priceData of productData.prices) {
        const priceParams = {
          product: product.id,
          unit_amount: priceData.amount,
          currency: priceData.currency,
          ...(priceData.interval !== "one_time" && {
            recurring: {
              interval: priceData.interval,
            },
          }),
        };

        const price = await stripe.prices.create(priceParams);
        console.log(`   ✓ Price created: ${price.id} (${priceData.amount / 100} ${priceData.currency.toUpperCase()})`);
      }

      console.log();
    }

    console.log("✅ All products and prices created successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Go to https://dashboard.stripe.com/products");
    console.log("2. Verify all products are created");
    console.log("3. Update the price IDs in your frontend code");
    console.log("4. Register the webhook endpoint in Stripe Dashboard");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
