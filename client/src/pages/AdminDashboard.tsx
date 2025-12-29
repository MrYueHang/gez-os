import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Upload, FileText, Package, Users, AlertCircle, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingAdmin } = trpc.admin.isAdmin.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch system statistics
  const { data: stats, isLoading: statsLoading } = trpc.admin.getSystemStatistics.useQuery(
    undefined,
    { enabled: isAuthenticated && isAdmin }
  );

  // Fetch all documents
  const { data: documents, isLoading: docsLoading } = trpc.admin.getAllDocuments.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated && isAdmin }
  );

  // Fetch all packages
  const { data: packages, isLoading: packagesLoading } = trpc.admin.getAllDocumentPackages.useQuery(
    undefined,
    { enabled: isAuthenticated && isAdmin }
  );

  // Fetch admins and moderators
  const { data: staff, isLoading: staffLoading } = trpc.admin.getAdminsAndModerators.useQuery(
    undefined,
    { enabled: isAuthenticated && isAdmin }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Bitte melden Sie sich an, um auf das Admin-Dashboard zuzugreifen.
            </p>
            <Button className="w-full" onClick={() => navigate("/")}>
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkingAdmin || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sie haben keine Berechtigung, auf das Admin-Dashboard zuzugreifen. Nur Administratoren können diese Seite sehen.
            </p>
            <Button className="w-full" onClick={() => navigate("/")}>
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = stats
    ? Object.entries(stats.usersByRole || {}).map(([role, count]) => ({
        name: role,
        value: count as number,
      }))
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Verwalten Sie Dokumente, Pakete und Benutzer</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Zurück
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Benutzer"
              value={stats.totalUsers}
              icon={Users}
              color="bg-blue-50"
            />
            <StatCard
              title="Dokumente"
              value={stats.totalDocuments}
              icon={FileText}
              color="bg-green-50"
            />
            <StatCard
              title="Pakete"
              value={stats.totalPackages}
              icon={Package}
              color="bg-purple-50"
            />
            <StatCard
              title="Administratoren"
              value={Object.values(stats.usersByRole || {}).reduce((a, b) => a + (b as number), 0)}
              icon={Settings}
              color="bg-orange-50"
            />
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="documents">Dokumente</TabsTrigger>
            <TabsTrigger value="packages">Pakete</TabsTrigger>
            <TabsTrigger value="staff">Personal</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* User Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Benutzerverteilung nach Rolle</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Keine Daten verfügbar</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Schnellaktionen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab("documents")}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Dokument hochladen
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab("packages")}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Neues Paket erstellen
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab("staff")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Benutzer verwalten
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => toast.info("Einstellungen folgen in Kürze")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Einstellungen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dokumente verwalten</CardTitle>
                <CardDescription>
                  {documents ? `${documents.length} Dokumente insgesamt` : "Lädt..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {docsLoading ? (
                  <p className="text-muted-foreground">Lädt Dokumente...</p>
                ) : documents && documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.slice(0, 10).map((doc) => (
                      <DocumentRow key={doc.id} document={doc} />
                    ))}
                    {documents.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        ... und {documents.length - 10} weitere Dokumente
                      </p>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Keine Dokumente gefunden</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dokumentenpakete</CardTitle>
                <CardDescription>
                  {packages ? `${packages.length} Pakete insgesamt` : "Lädt..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {packagesLoading ? (
                  <p className="text-muted-foreground">Lädt Pakete...</p>
                ) : packages && packages.length > 0 ? (
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <PackageRow key={pkg.id} package={pkg} />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Keine Pakete gefunden</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Administratoren & Moderatoren</CardTitle>
                <CardDescription>
                  {staff ? `${staff.length} Mitglieder insgesamt` : "Lädt..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {staffLoading ? (
                  <p className="text-muted-foreground">Lädt Personal...</p>
                ) : staff && staff.length > 0 ? (
                  <div className="space-y-4">
                    {staff.map((member) => (
                      <StaffRow key={member.id} member={member} />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Kein Personal gefunden</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`${color} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Document Row Component
 */
function DocumentRow({ document }: { document: any }) {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{document.filename}</p>
          <p className="text-sm text-muted-foreground">{document.documentType}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info(`Bearbeiten von ${document.filename} - Funktion folgt`)}
        >
          Bearbeiten
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600"
          onClick={() => toast.error(`Löschen von ${document.filename} - Bitte bestätigen Sie die Aktion`)}
        >
          Löschen
        </Button>
      </div>
    </div>
  );
}

/**
 * Package Row Component
 */
function PackageRow({ package: pkg }: { package: any }) {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition">
      <div className="flex items-center gap-3">
        <Package className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{pkg.name}</p>
          <p className="text-sm text-muted-foreground">{pkg.packageType}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          pkg.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
        }`}>
          {pkg.isActive ? "Aktiv" : "Inaktiv"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info(`Bearbeiten von ${pkg.name} - Funktion folgt`)}
        >
          Bearbeiten
        </Button>
      </div>
    </div>
  );
}

/**
 * Staff Row Component
 */
function StaffRow({ member }: { member: any }) {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{member.name}</p>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          member.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
        }`}>
          {member.role}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info(`Rolle ändern für ${member.name} - Funktion folgt`)}
        >
          Ändern
        </Button>
      </div>
    </div>
  );
}
