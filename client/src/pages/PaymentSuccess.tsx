import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Download, FileText, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    setSessionId(sid);
  }, []);

  // Fetch checkout session details
  const { data: session, isLoading: sessionLoading } = trpc.payment.getCheckoutSession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  // Fetch user purchases
  const { data: purchases, isLoading: purchasesLoading } = trpc.download.getPurchases.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    setIsLoading(sessionLoading || purchasesLoading);
  }, [sessionLoading, purchasesLoading]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Bitte melden Sie sich an, um Ihre Käufe und Downloads zu verwalten.
            </p>
            <Button className="w-full" onClick={() => navigate("/")}>
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Zahlung erfolgreich!</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Vielen Dank für Ihren Kauf. Ihre Dokumente sind jetzt zum Download bereit.
          </p>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Laden...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Payment Confirmation */}
            {session && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">Zahlungsbestätigung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Betrag</p>
                      <p className="text-2xl font-bold">
                        €{((session.amount_total || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold text-green-600">Bezahlt</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Session ID: {session.id}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Downloads Section */}
            {purchases && purchases.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Ihre Käufe</h2>
                  <div className="grid gap-4">
                    {purchases.map((purchase) => (
                      <PurchaseCard key={purchase.id} purchase={purchase} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Keine Käufe gefunden. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.
                </AlertDescription>
              </Alert>
            )}

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Nächste Schritte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Laden Sie Ihre Dokumente herunter</p>
                      <p className="text-sm text-muted-foreground">
                        Klicken Sie auf die Download-Buttons oben, um Ihre Dokumente zu speichern.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Lesen Sie die Anleitung</p>
                      <p className="text-sm text-muted-foreground">
                        Jedes Dokumentenpaket enthält eine detaillierte Anleitung zur Verwendung.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Benötigen Sie Hilfe?</p>
                      <p className="text-sm text-muted-foreground">
                        Besuchen Sie unser Wiki oder kontaktieren Sie einen Anwalt für professionelle Beratung.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => navigate("/dashboard")}>
                Zum Dashboard
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                Zur Startseite
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Purchase Card Component
 */
function PurchaseCard({ purchase }: { purchase: any }) {
  const downloadMutation = trpc.download.getDownloadLink.useMutation();

  const handleDownload = async () => {
    try {
      // For now, show a placeholder message
      // In production, you would get the actual document path from the purchase
      toast.info("Download-Funktion wird vorbereitet...");
    } catch (error) {
      toast.error("Download fehlgeschlagen");
    }
  };

  const packageInfo: Record<string, { name: string; icon: any; description: string }> = {
    docs_basic: {
      name: "Dokumentenpaket - Basis",
      icon: FileText,
      description: "Widerspruch, Auskunftsersuchen",
    },
    docs_complete: {
      name: "Dokumentenpaket - Komplett",
      icon: FileText,
      description: "Alle Vorlagen und Muster",
    },
    consultation_30: {
      name: "Anwaltskonsultation - 30 Min",
      icon: FileText,
      description: "Telefonkonsultation",
    },
    consultation_60: {
      name: "Anwaltskonsultation - 60 Min",
      icon: FileText,
      description: "Ausführliche Beratung",
    },
    premium_monthly: {
      name: "GEZy Premium - Monatlich",
      icon: FileText,
      description: "Monatliches Abonnement",
    },
    premium_yearly: {
      name: "GEZy Premium - Jährlich",
      icon: FileText,
      description: "Jährliches Abonnement",
    },
  };

  const info = packageInfo[purchase.packageType] || {
    name: purchase.packageName,
    icon: FileText,
    description: "Gekauftes Paket",
  };

  const Icon = info.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <CardTitle>{info.name}</CardTitle>
              <CardDescription>{info.description}</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">€{(purchase.amount / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(purchase.createdAt).toLocaleDateString("de-DE")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">
            <strong>Status:</strong>{" "}
            <span className="text-green-600 font-semibold">{purchase.status}</span>
          </p>
          {purchase.downloadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {purchase.downloadCount} Download{purchase.downloadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handleDownload}
          disabled={downloadMutation.isPending}
        >
          <Download className="w-4 h-4 mr-2" />
          {downloadMutation.isPending ? "Wird vorbereitet..." : "Jetzt herunterladen"}
        </Button>
      </CardContent>
    </Card>
  );
}
