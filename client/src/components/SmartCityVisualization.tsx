import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Zap, Users, Network, TrendingUp } from "lucide-react";

interface DataStreamInfo {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  metrics: {
    active: number;
    total: number;
    growth: string;
  };
}

const DATA_STREAMS: DataStreamInfo[] = [
  {
    id: "traffic",
    label: "Verkehr & Logistik",
    icon: "🚗",
    description: "Echtzeit-Verkehrsdaten und Routenoptimierung",
    color: "from-blue-400 to-blue-600",
    metrics: { active: 1247, total: 5000, growth: "+12%" },
  },
  {
    id: "energy",
    label: "Energie & Versorgung",
    icon: "⚡",
    description: "Intelligente Stromverteilung und Verbrauchsoptimierung",
    color: "from-green-400 to-green-600",
    metrics: { active: 892, total: 3500, growth: "+8%" },
  },
  {
    id: "communication",
    label: "Kommunikation & Netzwerk",
    icon: "📡",
    description: "5G-Netzwerk und digitale Infrastruktur",
    color: "from-purple-400 to-purple-600",
    metrics: { active: 2156, total: 6000, growth: "+15%" },
  },
  {
    id: "governance",
    label: "Verwaltung & Dienste",
    icon: "🏛️",
    description: "E-Government und öffentliche Services",
    color: "from-orange-400 to-orange-600",
    metrics: { active: 654, total: 2000, growth: "+5%" },
  },
];

export default function SmartCityVisualization() {
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [hoveredStream, setHoveredStream] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  const activeStream = DATA_STREAMS.find((s) => s.id === selectedStream);
  const hovered = DATA_STREAMS.find((s) => s.id === hoveredStream);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-600" />
              Smart City Dateninfrastruktur
            </CardTitle>
            <CardDescription>
              Interaktive Visualisierung der vernetzten Stadtservices und Datenströme
            </CardDescription>
          </div>
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
          >
            {showMetrics ? "Grafik ausblenden" : "Metriken anzeigen"}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Visualization */}
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden border border-slate-200">
          {/* Smart City Image */}
          <div className="relative w-full aspect-video">
            <img
              src="/smart-city.png"
              alt="Smart City Dateninfrastruktur"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />

            {/* Animated Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

            {/* Interactive Hotspots */}
            <div className="absolute inset-0">
              {/* Traffic Hotspot */}
              <button
                onMouseEnter={() => setHoveredStream("traffic")}
                onMouseLeave={() => setHoveredStream(null)}
                onClick={() => setSelectedStream("traffic")}
                className={`absolute bottom-1/3 left-1/4 w-12 h-12 rounded-full transition-all duration-300 ${
                  hoveredStream === "traffic" || selectedStream === "traffic"
                    ? "scale-125 ring-2 ring-blue-400"
                    : "hover:scale-110"
                }`}
                title="Verkehr & Logistik"
              >
                <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white text-lg hover:bg-blue-600 transition animate-pulse">
                  🚗
                </div>
              </button>

              {/* Energy Hotspot */}
              <button
                onMouseEnter={() => setHoveredStream("energy")}
                onMouseLeave={() => setHoveredStream(null)}
                onClick={() => setSelectedStream("energy")}
                className={`absolute bottom-1/2 left-1/2 w-12 h-12 rounded-full transition-all duration-300 ${
                  hoveredStream === "energy" || selectedStream === "energy"
                    ? "scale-125 ring-2 ring-green-400"
                    : "hover:scale-110"
                }`}
                title="Energie & Versorgung"
              >
                <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center text-white text-lg hover:bg-green-600 transition animate-pulse">
                  ⚡
                </div>
              </button>

              {/* Communication Hotspot */}
              <button
                onMouseEnter={() => setHoveredStream("communication")}
                onMouseLeave={() => setHoveredStream(null)}
                onClick={() => setSelectedStream("communication")}
                className={`absolute bottom-1/3 right-1/4 w-12 h-12 rounded-full transition-all duration-300 ${
                  hoveredStream === "communication" || selectedStream === "communication"
                    ? "scale-125 ring-2 ring-purple-400"
                    : "hover:scale-110"
                }`}
                title="Kommunikation & Netzwerk"
              >
                <div className="w-full h-full bg-purple-500 rounded-full flex items-center justify-center text-white text-lg hover:bg-purple-600 transition animate-pulse">
                  📡
                </div>
              </button>

              {/* Governance Hotspot */}
              <button
                onMouseEnter={() => setHoveredStream("governance")}
                onMouseLeave={() => setHoveredStream(null)}
                onClick={() => setSelectedStream("governance")}
                className={`absolute top-1/3 right-1/3 w-12 h-12 rounded-full transition-all duration-300 ${
                  hoveredStream === "governance" || selectedStream === "governance"
                    ? "scale-125 ring-2 ring-orange-400"
                    : "hover:scale-110"
                }`}
                title="Verwaltung & Dienste"
              >
                <div className="w-full h-full bg-orange-500 rounded-full flex items-center justify-center text-white text-lg hover:bg-orange-600 transition animate-pulse">
                  🏛️
                </div>
              </button>
            </div>

            {/* Tooltip */}
            {hovered && (
              <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
                <p className="font-semibold">{hovered.label}</p>
                <p className="text-xs text-gray-300">{hovered.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Data Streams Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DATA_STREAMS.map((stream) => (
            <button
              key={stream.id}
              onClick={() => setSelectedStream(stream.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedStream === stream.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="text-2xl mb-1">{stream.icon}</div>
              <p className="text-xs font-semibold text-gray-900">{stream.label}</p>
            </button>
          ))}
        </div>

        {/* Detailed Information */}
        {activeStream && (
          <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-2xl">{activeStream.icon}</span>
                  {activeStream.label}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{activeStream.description}</p>
              </div>
              <Badge className={`bg-gradient-to-r ${activeStream.color} text-white`}>
                Aktiv
              </Badge>
            </div>

            {showMetrics && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {activeStream.metrics.active}
                  </div>
                  <p className="text-xs text-muted-foreground">Aktive Verbindungen</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activeStream.metrics.total}
                  </div>
                  <p className="text-xs text-muted-foreground">Gesamtkapazität</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {activeStream.metrics.growth}
                  </div>
                  <p className="text-xs text-muted-foreground">Wachstum</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-muted-foreground space-y-2">
          <p className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <strong>Interaktiv:</strong> Klicken Sie auf die Hotspots oder die Symbole unten, um
            Details zu sehen
          </p>
          <p className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <strong>Live-Daten:</strong> Diese Visualisierung zeigt die Echtzeitverbindungen der
            Smart City
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
