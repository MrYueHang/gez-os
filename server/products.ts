/**
 * Stripe Products Configuration
 * Define all products and pricing tiers for GEZy OS
 */

export const STRIPE_PRODUCTS = {
  // Lawyer Consultation Services
  LAWYER_CONSULTATION_30MIN: {
    name: "Anwaltskonsultation - 30 Minuten",
    description: "30-minütige Telefonkonsultation mit einem GEZ-Spezialisten",
    category: "lawyer_consultation",
    prices: {
      eur: 4900, // €49.00 in cents
    },
    interval: "one_time" as const,
  },
  
  LAWYER_CONSULTATION_60MIN: {
    name: "Anwaltskonsultation - 60 Minuten",
    description: "60-minütige Telefonkonsultation mit einem GEZ-Spezialisten",
    category: "lawyer_consultation",
    prices: {
      eur: 8900, // €89.00 in cents
    },
    interval: "one_time" as const,
  },

  // Document Packages
  DOCUMENT_PACKAGE_BASIC: {
    name: "Dokumentenpaket - Basis",
    description: "Vorlagen für Widerspruch und Auskunftsersuchen",
    category: "document_package",
    prices: {
      eur: 1999, // €19.99 in cents
    },
    interval: "one_time" as const,
  },

  DOCUMENT_PACKAGE_COMPLETE: {
    name: "Dokumentenpaket - Vollständig",
    description: "Alle Vorlagen: Widerspruch, Auskunftsersuchen, Härtefallantrag, Beschwerde",
    category: "document_package",
    prices: {
      eur: 3999, // €39.99 in cents
    },
    interval: "one_time" as const,
  },

  // Premium Subscription
  PREMIUM_MONTHLY: {
    name: "GEZy Premium - Monatlich",
    description: "Unbegrenzte Dokumentenzugriff, Prioritäts-Support, exklusive Community-Inhalte",
    category: "subscription",
    prices: {
      eur: 999, // €9.99 in cents
    },
    interval: "month" as const,
  },

  PREMIUM_YEARLY: {
    name: "GEZy Premium - Jährlich",
    description: "Unbegrenzte Dokumentenzugriff, Prioritäts-Support, exklusive Community-Inhalte (2 Monate sparen!)",
    category: "subscription",
    prices: {
      eur: 9990, // €99.90 in cents (saves €19.98)
    },
    interval: "year" as const,
  },

  // Lawyer Directory Premium
  LAWYER_DIRECTORY_LISTING: {
    name: "Anwaltsverzeichnis - Premium-Eintrag",
    description: "Erhöhte Sichtbarkeit im Anwaltsverzeichnis für 3 Monate",
    category: "subscription",
    prices: {
      eur: 4999, // €49.99 in cents
    },
    interval: "month" as const,
  },
} as const;

/**
 * Helper function to get product by key
 */
export function getProduct(key: keyof typeof STRIPE_PRODUCTS) {
  return STRIPE_PRODUCTS[key];
}

/**
 * Helper function to get price in cents
 */
export function getPrice(key: keyof typeof STRIPE_PRODUCTS, currency: "eur" = "eur"): number {
  const product = STRIPE_PRODUCTS[key];
  return product.prices[currency] || product.prices.eur;
}

/**
 * Helper function to format price for display
 */
export function formatPrice(amountInCents: number, currency: string = "EUR"): string {
  const amount = (amountInCents / 100).toFixed(2);
  return `${amount} ${currency}`;
}
