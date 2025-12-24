
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, FileText, MessageSquare, TrendingUp, Scale, BookOpen } from "lucide-react";
import SmartCityVisualization from "@/components/SmartCityVisualization";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: stats } = trpc.stats.platform.useQuery();
  const { data: cases } = trpc.cases.list.useQuery();
  const { data: communityPosts } = trpc.community.posts.useQuery({ limit: 5 });
  const { data: polls } = trpc.polls.active.useQuery({ limit: 3 });
  const { data: lawyers } = trpc.lawyers.list.useQuery();
  const { data: wordCloud } = trpc.wordCloud.data.useQuery({ limit: 30 });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Zugang erforderlich</CardTitle>
            <CardDescription>Bitte melden Sie sich an, um das Dashboard zu sehen.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Anmelden</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = [
    { name: "Nutzer", value: stats?.totalUsers || 0 },
    { name: "Fälle", value: stats?.totalCases || 0 },
    { name: "Posts", value: stats?.totalCommunityPosts || 0 },
  ];

  const COLORS = ["#2563eb", "#7c3aed", "#ec4899"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Willkommen, {user?.name || "Nutzer"}!</h1>
              <p className="text-muted-foreground mt-1">Verwalten Sie Ihre Fälle und erkunden Sie die Community</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plattform-Nutzer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Aktive Mitglieder</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verwaltete Fälle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCases || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Insgesamt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Community-Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCommunityPosts || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Erfahrungsberichte</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Abstimmungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activePolls || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Laufend</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="infrastructure">Infrastruktur</TabsTrigger>
            <TabsTrigger value="cases">Meine Fälle</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="polls">Abstimmungen</TabsTrigger>
            <TabsTrigger value="lawyers">Anwälte</TabsTrigger>
            <TabsTrigger value="analytics">Statistiken</TabsTrigger>
          </TabsList>

          {/* Smart City Visualization Tab */}
          <TabsContent value="infrastructure" className="space-y-4">
            <SmartCityVisualization />
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meine GEZ-Fälle</CardTitle>
                <CardDescription>Verwalten und verfolgen Sie Ihre Fälle</CardDescription>
              </CardHeader>
              <CardContent>
                {cases && cases.length > 0 ? (
                  <div className="space-y-4">
                    {cases.map((c) => (
                      <div key={c.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{c.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                            <div className="flex gap-4 mt-3 text-sm">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{c.caseType}</span>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{c.status}</span>
                            </div>
                          </div>
                          {c.amount && (
                            <div className="text-right">
                              <p className="text-lg font-bold">{c.amount} EUR</p>
                              {c.deadline && (
                                <p className="text-xs text-muted-foreground">
                                  Frist: {new Date(c.deadline).toLocaleDateString("de-DE")}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Keine Fälle vorhanden. Starten Sie einen neuen Fall.</p>
                    <Button className="mt-4">Neuen Fall erstellen</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community-Erfahrungsberichte</CardTitle>
                <CardDescription>Lernen Sie von anderen Nutzern</CardDescription>
              </CardHeader>
              <CardContent>
                {communityPosts && communityPosts.length > 0 ? (
                  <div className="space-y-4">
                    {communityPosts.map((post) => (
                      <div key={post.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                            <div className="flex gap-2 mt-3">
                              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">{post.category}</span>
                              {post.sentiment && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  post.sentiment === "positiv" ? "bg-green-100 text-green-700" :
                                  post.sentiment === "negativ" ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                  {post.sentiment}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-semibold">{post.upvotes} 👍</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Keine Community-Posts vorhanden.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Polls Tab */}
          <TabsContent value="polls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aktive Abstimmungen</CardTitle>
                <CardDescription>Beteiligen Sie sich an wichtigen Entscheidungen</CardDescription>
              </CardHeader>
              <CardContent>
                {polls && polls.length > 0 ? (
                  <div className="space-y-4">
                    {polls.map((poll) => (
                      <div key={poll.id} className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">{poll.title}</h3>
                        {poll.description && (
                          <p className="text-sm text-muted-foreground mb-3">{poll.description}</p>
                        )}
                        <div className="space-y-2">
                          {poll.options && Array.isArray(poll.options) ? (
                            (poll.options as string[]).map((option: string, idx: number) => (
                              <Button key={idx} variant="outline" className="w-full justify-start">
                                {option}
                              </Button>
                            ))
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          {poll.totalVotes || 0} Stimmen
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Keine aktiven Abstimmungen.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lawyers Tab */}
          <TabsContent value="lawyers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spezialisierte Anwälte</CardTitle>
                <CardDescription>Finden Sie einen Anwalt mit GEZ-Erfahrung</CardDescription>
              </CardHeader>
              <CardContent>
                {lawyers && lawyers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lawyers.slice(0, 6).map((lawyer) => (
                      <div key={lawyer.id} className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold">{lawyer.firmName || "Anwaltskanzlei"}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{lawyer.location}</p>
                        {lawyer.rating && (
                          <p className="text-sm font-semibold mt-2">⭐ {lawyer.rating} ({lawyer.reviewCount} Bewertungen)</p>
                        )}
                        {lawyer.specializations && Array.isArray(lawyer.specializations) ? (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {(lawyer.specializations as string[]).slice(0, 3).map((spec: string, idx: number) => (
                              <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                {spec}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <Button variant="outline" size="sm" className="w-full mt-4">
                          Kontaktieren
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Keine Anwälte vorhanden.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plattform-Übersicht</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aktivitätsverteilung</CardTitle>
                </CardHeader>
                <CardContent>
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
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Word Cloud */}
            <Card>
              <CardHeader>
                <CardTitle>Trending Topics (Wortwolke)</CardTitle>
                <CardDescription>Häufigste Themen in der Community</CardDescription>
              </CardHeader>
              <CardContent>
                {wordCloud && wordCloud.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {wordCloud.slice(0, 30).map((item) => (
                      <span
                        key={item.id}
                        className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium"
                        style={{
                          fontSize: `${Math.min(14 + (item.frequency || 1) * 0.5, 24)}px`,
                          opacity: Math.min(0.5 + (item.frequency || 1) * 0.05, 1),
                        }}
                      >
                        {item.word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Keine Daten verfügbar.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
