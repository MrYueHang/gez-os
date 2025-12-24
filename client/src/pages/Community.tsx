import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ThumbsUp, Share2, Search, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Mock data for community posts
const MOCK_POSTS = [
  {
    id: 1,
    author: "Anna Schmidt",
    avatar: "AS",
    title: "Erfolgreich Widerspruch eingereicht - Tipps und Erfahrungen",
    content:
      "Ich habe vor 3 Monaten einen Widerspruch gegen meinen GEZ-Bescheid eingereicht. Hier sind die wichtigsten Schritte, die mir geholfen haben...",
    category: "Erfahrungsbericht",
    sentiment: "positive",
    upvotes: 24,
    comments: 8,
    timestamp: "vor 2 Tagen",
  },
  {
    id: 2,
    author: "Thomas Müller",
    avatar: "TM",
    title: "Frage: Wie lange dauert normalerweise ein Widerspruchsverfahren?",
    content:
      "Ich habe meinen Widerspruch vor 6 Wochen eingereicht und habe noch keine Antwort bekommen. Ist das normal?",
    category: "Frage",
    sentiment: "neutral",
    upvotes: 12,
    comments: 15,
    timestamp: "vor 1 Tag",
  },
  {
    id: 3,
    author: "Maria Weber",
    avatar: "MW",
    title: "Wichtiger Tipp: Dokumentation ist alles!",
    content:
      "Speichert alle Briefe, Emails und Dokumente. Das hat mir später sehr geholfen, meine Position zu belegen.",
    category: "Tipp",
    sentiment: "positive",
    upvotes: 18,
    comments: 5,
    timestamp: "vor 3 Tagen",
  },
];

const CATEGORIES = [
  { id: "all", label: "Alle Beiträge", icon: "📋" },
  { id: "Erfahrungsbericht", label: "Erfahrungsberichte", icon: "📖" },
  { id: "Frage", label: "Fragen", icon: "❓" },
  { id: "Tipp", label: "Tipps", icon: "💡" },
  { id: "Ressource", label: "Ressourcen", icon: "📚" },
  { id: "Erfolgsgeschichte", label: "Erfolgsgeschichten", icon: "🏆" },
];

export default function Community() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "Erfahrungsbericht" });

  const filteredPosts = MOCK_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePostSubmit = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Bitte füllen Sie Titel und Inhalt aus");
      return;
    }
    toast.success("Beitrag erfolgreich veröffentlicht!");
    setShowNewPostForm(false);
    setNewPost({ title: "", content: "", category: "Erfahrungsbericht" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Community</h1>
              <p className="text-muted-foreground mt-2">
                Teilen Sie Ihre Erfahrungen und lernen Sie von anderen
              </p>
            </div>
            {isAuthenticated && (
              <Button onClick={() => setShowNewPostForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Neuer Beitrag
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Beiträge durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* New Post Form */}
        {showNewPostForm && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Neuen Beitrag erstellen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titel</label>
                <Input
                  placeholder="Geben Sie einen aussagekräftigen Titel ein..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kategorie</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                >
                  {CATEGORIES.slice(1).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Inhalt</label>
                <Textarea
                  placeholder="Teilen Sie Ihre Erfahrung, Frage oder Tipp..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={5}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePostSubmit}>Veröffentlichen</Button>
                <Button variant="outline" onClick={() => setShowNewPostForm(false)}>
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className="gap-2"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0">
                      {post.avatar}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="font-semibold">{post.author}</p>
                          <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                        </div>
                        <Badge
                          variant={
                            post.sentiment === "positive"
                              ? "default"
                              : post.sentiment === "negative"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {post.category}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{post.content}</p>

                      {/* Actions */}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-blue-600 transition">
                          <ThumbsUp className="w-4 h-4" />
                          {post.upvotes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition">
                          <Share2 className="w-4 h-4" />
                          Teilen
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">
                  Keine Beiträge gefunden. Seien Sie der Erste, der einen Beitrag erstellt!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Community-Richtlinien</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>✓ Seien Sie respektvoll und konstruktiv</p>
            <p>✓ Teilen Sie Ihre echten Erfahrungen</p>
            <p>✓ Keine persönlichen Daten oder Kontaktinformationen</p>
            <p>✓ Keine Werbung oder Spam</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
