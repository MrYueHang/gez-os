import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Check, Zap, FileText, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { data: products, isLoading } = trpc.payment.getProducts.useQuery();
  const createCheckout = trpc.payment.createCheckoutSession.useMutation();
  const createSubscriptionCheckout = trpc.payment.createSubscriptionCheckout.useMutation();

  const handleCheckout = async (priceId: string, isSubscription: boolean) => {
    if (!isAuthenticated) {
      toast.error("Bitte melden Sie sich an, um fortzufahren");
      return;
    }

    try {
      setSelectedPlan(priceId);
      const mutation = isSubscription ? createSubscriptionCheckout : createCheckout;
      const result = await mutation.mutateAsync({
        stripePriceId: priceId,
      });

      if (result.url) {
        window.open(result.url, "_blank");
        toast.success("Sie werden zur Kasse weitergeleitet...");
      }
    } catch (error) {
      toast.error("Fehler beim Erstellen der Checkout-Sitzung");
      console.error(error);
    } finally {
      setSelectedPlan(null);
    }
  };

  const pricingTiers: Array<{
    title: string;
    description: string;
    icon: any;
    plans: Array<{
      name: string;
      price: string;
      description: string;
      features: string[];
      priceId: string;
      isSubscription: boolean;
      popular?: boolean;
      savings?: string;
    }>;
  }> = [
    {
      title: "Anwaltskonsultation",
      description: "Professionelle Beratung von GEZ-Spezialisten",
      icon: Users,
      plans: [
        {
          name: "30 Minuten",
          price: "€49,00",
          description: "Kurzkonsultation",
          features: [
            "30 Minuten Telefonat",
            "Persönliche Beratung",
            "Erste Schritte besprechen",
          ],
          priceId: "price_consultation_30",
          isSubscription: false,
        },
        {
          name: "60 Minuten",
          price: "€89,00",
          description: "Ausführliche Beratung",
          features: [
            "60 Minuten Telefonat",
            "Detaillierte Analyse",
            "Handlungsplan erstellen",
            "Follow-up per Email",
          ],
          priceId: "price_consultation_60",
          isSubscription: false,
          popular: true,
        },
      ],
    },
    {
      title: "Dokumentenpakete",
      description: "Vorgefertigte Vorlagen und Muster",
      icon: FileText,
      plans: [
        {
          name: "Basis",
          price: "€19,99",
          description: "Essenzielle Dokumente",
          features: [
            "Widerspruchsvorlage",
            "Auskunftsersuchen",
            "Anleitung & Tipps",
          ],
          priceId: "price_docs_basic",
          isSubscription: false,
        },
        {
          name: "Komplett",
          price: "€39,99",
          description: "Alle wichtigen Vorlagen",
          features: [
            "Alle Basis-Dokumente",
            "Härtefallantrag",
            "Beschwerdevorlage",
            "Rechtliche Hinweise",
            "Aktualisierungen",
          ],
          priceId: "price_docs_complete",
          isSubscription: false,
          popular: true,
        },
      ],
    },
    {
      title: "Premium Abos",
      description: "Unbegrenzte Vorteile und Unterstützung",
      icon: Zap,
      plans: [
        {
          name: "Monatlich",
          price: "€9,99",
          description: "Flexibel kündbar",
          features: [
            "Alle Dokumente",
            "Prioritäts-Support",
            "Exklusive Community",
            "Monatliche Updates",
            "Jederzeit kündbar",
          ],
          priceId: "price_premium_monthly",
          isSubscription: true,
        },
        {
          name: "Jährlich",
          price: "€99,90",
          description: "2 Monate sparen!",
          features: [
            "Alles aus Monatlich",
            "Jahresrabatt",
            "Prioritäts-Support",
            "Exklusive Events",
            "Jederzeit kündbar",
          ],
          priceId: "price_premium_yearly",
          isSubscription: true,
          popular: true,
          savings: "€19,98 sparen",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Transparente Preise</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Wählen Sie das passende Paket für Ihre Situation. Alle Preise sind in EUR und enthalten keine versteckten Gebühren.
          </p>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Laden...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {pricingTiers.map((tier, tierIdx) => {
              const Icon = tier.icon;
              return (
                <div key={tierIdx} className="space-y-6">
                  {/* Tier Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <Icon className="w-8 h-8 text-blue-600" />
                    <div>
                      <h2 className="text-2xl font-bold">{tier.title}</h2>
                      <p className="text-muted-foreground">{tier.description}</p>
                    </div>
                  </div>

                  {/* Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tier.plans.map((plan, planIdx) => (
                      <Card
                        key={planIdx}
                        className={`relative flex flex-col transition-all ${
                          plan.popular
                            ? "border-blue-600 shadow-lg md:scale-105"
                            : "border-border"
                        }`}
                      >
                        {plan.popular && (
                          <Badge className="absolute -top-3 left-6 bg-blue-600">
                            Beliebt
                          </Badge>
                        )}

                        {(plan as any).savings && (
                          <div className="absolute -top-3 right-6 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {(plan as any).savings}
                          </div>
                        )}

                        <CardHeader>
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                          <div className="mt-4">
                            <span className="text-4xl font-bold">{plan.price}</span>
                            {plan.isSubscription && (
                              <span className="text-muted-foreground ml-2">/Monat</span>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col">
                          {/* Features */}
                          <ul className="space-y-3 mb-6 flex-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          {/* CTA Button */}
                          <Button
                            className="w-full"
                            variant={plan.popular ? "default" : "outline"}
                            onClick={() => handleCheckout(plan.priceId, plan.isSubscription)}
                            disabled={selectedPlan === plan.priceId}
                          >
                            {selectedPlan === plan.priceId ? "Wird verarbeitet..." : "Jetzt buchen"}
                          </Button>

                          {plan.isSubscription && (
                            <p className="text-xs text-muted-foreground text-center mt-3">
                              Jederzeit kündbar, keine Bindung
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 border-t border-border pt-12">
          <h2 className="text-2xl font-bold mb-8">Häufig gestellte Fragen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Kann ich mein Abo kündigen?</h3>
              <p className="text-muted-foreground text-sm">
                Ja, Sie können Ihr Abo jederzeit ohne Bindung kündigen. Es fallen keine Strafgebühren an.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Welche Zahlungsarten werden akzeptiert?</h3>
              <p className="text-muted-foreground text-sm">
                Wir akzeptieren alle gängigen Kreditkarten, Lastschrift und andere Zahlungsmethoden über Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Gibt es Rabatte?</h3>
              <p className="text-muted-foreground text-sm">
                Ja! Das Jahresabo spart Ihnen 2 Monate Gebühren. Nutzen Sie auch unsere Promo-Codes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Ist meine Zahlung sicher?</h3>
              <p className="text-muted-foreground text-sm">
                Alle Zahlungen werden über Stripe verarbeitet, einen der sichersten Zahlungsanbieter.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
