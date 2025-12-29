import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Zap, Users, Shield, Lightbulb, GitBranch } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import GezFlow from "@/components/GezFlow";
import Architecture from "@/components/Architecture";
import { Link } from "wouter";

export default function Home() {
  // The useAuth hook provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="text-xl font-bold hidden sm:inline">GEZy OS</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#flow" className="text-sm text-muted-foreground hover:text-foreground transition">
              Wie es funktioniert
            </a>
            <a href="#architecture" className="text-sm text-muted-foreground hover:text-foreground transition">
              Architektur
            </a>
            <a href="/community" className="text-sm text-muted-foreground hover:text-foreground transition">
              Community
            </a>
            <a href="/arguments" className="text-sm text-muted-foreground hover:text-foreground transition">
              Argumente
            </a>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{user?.name || 'Benutzer'}</span>
                <a href="/dashboard">
                  <Button size="sm" variant="default">
                    Dashboard
                  </Button>
                </a>
                <Button size="sm" variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Login
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  GEZy OS
                </h1>
                <p className="text-xl text-muted-foreground">
                  Ihr Prozess-Betriebssystem für reale Fälle
                </p>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Transparenz und Kontrolle in komplexen Situationen. GEZy OS führt Sie verständlich durch Ihre Situation, ordnet Dokumente und Fristen, und zeigt Ihnen klare Handlungspfade – von der Selbsthilfe bis zur optionalen anwaltlichen Unterstützung.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Zum Entry-Terminal <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Mehr erfahren
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl opacity-10"></div>
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Zap className="w-16 h-16 text-blue-600 mx-auto" />
                    <p className="text-sm font-semibold text-muted-foreground">Intelligente Prozessführung</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem & Solution Section */}
        <section className="bg-muted/50 py-20 sm:py-32">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Das Problem</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Der Rundfunkbeitrag (GEZ) ist für viele Nutzer eine Quelle der Verwirrung. Komplexe Bescheide, unklar Fristen, und viele Fragen: Kann ich Widerspruch einlegen? Welche Dokumente brauche ich? Wann ist es zu spät?
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground">Unklare Rechtslage und Fristen</p>
                  </div>
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground">Fehlende Orientierung bei Dokumenten</p>
                  </div>
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground">Hohe Kosten für anwaltliche Beratung</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Die Lösung</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    GEZy OS ist ein intelligentes Betriebssystem, das Ihre Situation verständlich macht. Wir analysieren Ihre Dokumente, zeigen Ihnen Ihre Optionen, und begleiten Sie durch jeden Schritt – mit KI-gestützter Unterstützung und optionaler anwaltlicher Expertise.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground">Automatische Dokumentenanalyse und Fristenverwaltung</p>
                  </div>
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground">Klare Handlungspfade und Erklärungen in Menschensprache</p>
                  </div>
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground">Selbsthilfe, Community-Austausch, oder anwaltliche Unterstützung – Sie entscheiden</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 sm:py-32">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Kernfunktionen</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                GEZy OS kombiniert intelligente Analyse, klare Prozessführung und optionale Expertenunterstützung.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <Zap className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>Intelligente Analyse</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Unsere KI analysiert Ihre Dokumente, erkennt den Falltyp und extrahiert wichtige Informationen wie Fristen und Beträge.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <GitBranch className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>Klare Handlungspfade</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Wir zeigen Ihnen transparent, welche Optionen Sie haben – von der Selbsthilfe bis zur anwaltlichen Unterstützung.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>Community & Experten</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Lernen Sie von anderen, teilen Sie Ihre Erfahrungen, oder konsultieren Sie externe Experten bei Bedarf.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* GEZ Flow Section */}
        <GezFlow />

        {/* Architecture Section */}
        <Architecture />

        {/* CTA Section */}
        <section className="py-20 sm:py-32 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="container max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Bereit, Ihre Situation zu klären?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Starten Sie jetzt mit GEZy OS und erhalten Sie sofortige Klarheit über Ihre Optionen.
            </p>
            <Button size="lg" variant="secondary" className="text-blue-600 hover:text-blue-700">
              Zum Entry-Terminal <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">GEZy OS</h3>
              <p className="text-sm text-muted-foreground">Ihr Prozess-Betriebssystem für reale Fälle.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Produkt</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Wie es funktioniert</a></li>
                <li><a href="#" className="hover:text-foreground transition">Architektur</a></li>
                <li><a href="#" className="hover:text-foreground transition">Dokumentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Forum</a></li>
                <li><a href="#" className="hover:text-foreground transition">Erfahrungen teilen</a></li>
                <li><a href="#" className="hover:text-foreground transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Impressum</a></li>
                <li><a href="#" className="hover:text-foreground transition">Datenschutz</a></li>
                <li><a href="#" className="hover:text-foreground transition">AGB</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2025 GEZy OS. Alle Rechte vorbehalten.</p>
            <p>Entwickelt mit Transparenz und Sorgfalt.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
