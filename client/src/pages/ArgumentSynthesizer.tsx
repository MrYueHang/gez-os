import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

// Mock argument data
const ARGUMENT_POSITIONS = [
  {
    position: 1,
    label: "Duckmäuschen",
    description: "Minimale Einwände, eher zustimmend",
    color: "bg-green-100 text-green-700",
    icon: "🦆",
    arguments: [
      "GEZ ist eine legitime Gebühr für öffentliche Rundfunkanstalten",
      "Die Finanzierung durch Gebühren sichert die Unabhängigkeit",
      "Qualitativ hochwertige Inhalte erfordern Investitionen",
    ],
  },
  {
    position: 2,
    label: "Skeptiker",
    description: "Einige Bedenken, aber grundsätzlich akzeptierend",
    color: "bg-blue-100 text-blue-700",
    icon: "🤔",
    arguments: [
      "Die Gebühren könnten transparenter sein",
      "Mehr Mitsprache bei der Programmgestaltung wäre wünschenswert",
      "Digitale Angebote sollten besser ausgebaut werden",
    ],
  },
  {
    position: 3,
    label: "Neutral",
    description: "Ausgewogene Sicht auf beide Seiten",
    color: "bg-gray-100 text-gray-700",
    icon: "⚖️",
    arguments: [
      "Es gibt Vor- und Nachteile des aktuellen Systems",
      "Reformen sind notwendig, aber nicht radikal",
      "Die Balance zwischen Gebühren und Leistung sollte überprüft werden",
    ],
  },
  {
    position: 4,
    label: "Kritiker",
    description: "Erhebliche Bedenken und Kritik",
    color: "bg-orange-100 text-orange-700",
    icon: "⚠️",
    arguments: [
      "Die Gebühren sind zu hoch für die gebotene Leistung",
      "Zu viele Inhalte sind nicht relevant für alle Zuschauer",
      "Digitale Alternativen bieten bessere Inhalte zu niedrigeren Kosten",
    ],
  },
  {
    position: 5,
    label: "Hardliner",
    description: "Radikale Ablehnung, Zahlungsverweigerung",
    color: "bg-red-100 text-red-700",
    icon: "🔥",
    arguments: [
      "Das GEZ-System ist ungerecht und sollte abgeschafft werden",
      "Gebühren sollten optional sein",
      "Streaming-Dienste bieten bessere Alternativen",
    ],
  },
];

const SENTIMENT_DATA = [
  { position: "Duckmäuschen", users: 5, percentage: 5 },
  { position: "Skeptiker", users: 15, percentage: 15 },
  { position: "Neutral", users: 40, percentage: 40 },
  { position: "Kritiker", users: 30, percentage: 30 },
  { position: "Hardliner", users: 10, percentage: 10 },
];

export default function ArgumentSynthesizer() {
  const [selectedPosition, setSelectedPosition] = useState(3);
  const [volume, setVolume] = useState(50);
  const [showChart, setShowChart] = useState(false);

  const currentPosition = ARGUMENT_POSITIONS[selectedPosition - 1];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Argument Synthesizer</h1>
          <p className="text-muted-foreground mt-2">
            Erkunden Sie verschiedene Perspektiven auf die GEZ-Debatte
          </p>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Position Scale */}
            <Card>
              <CardHeader>
                <CardTitle>Position-Skala</CardTitle>
                <CardDescription>
                  Wählen Sie Ihre Position auf der Skala von 1 (Duckmäuschen) bis 5 (Hardliner)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Scale */}
                <div className="space-y-4">
                  <div className="flex justify-between mb-2">
                    {ARGUMENT_POSITIONS.map((pos) => (
                      <button
                        key={pos.position}
                        onClick={() => setSelectedPosition(pos.position)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg transition ${
                          selectedPosition === pos.position
                            ? `${pos.color} ring-2 ring-offset-2 ring-blue-500`
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="text-2xl">{pos.icon}</span>
                        <span className="text-xs font-medium text-center">{pos.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Slider */}
                  <div className="pt-4">
                    <Slider
                      value={[selectedPosition]}
                      onValueChange={(value) => setSelectedPosition(value[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Zustimmung</span>
                      <span>Ablehnung</span>
                    </div>
                  </div>
                </div>

                {/* Current Position Info */}
                <div className={`p-4 rounded-lg ${currentPosition.color}`}>
                  <h3 className="font-semibold text-lg mb-1">{currentPosition.label}</h3>
                  <p className="text-sm">{currentPosition.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Arguments */}
            <Card>
              <CardHeader>
                <CardTitle>Argumente für diese Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentPosition.arguments.map((arg, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted">
                      <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                      <p className="text-sm">{arg}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Volume Control */}
            <Card>
              <CardHeader>
                <CardTitle>Argument-Intensität</CardTitle>
                <CardDescription>
                  Passen Sie die Lautstärke der Argumente an (leiser = moderater, lauter = extremer)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    min={0}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Intensität: {volume}%
                </div>
                <div className="p-3 rounded-lg bg-muted text-sm">
                  {volume < 30
                    ? "Moderate Argumentation - gemäßigte Tonalität"
                    : volume < 70
                      ? "Ausgewogene Argumentation - sachliche Tonalität"
                      : "Intensive Argumentation - leidenschaftliche Tonalität"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community-Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SENTIMENT_DATA.map((data) => (
                    <div key={data.position}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{data.position}</span>
                        <span className="text-muted-foreground">{data.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition"
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chart Toggle */}
            <Button
              onClick={() => setShowChart(!showChart)}
              variant="outline"
              className="w-full"
            >
              {showChart ? "Diagramm ausblenden" : "Diagramm anzeigen"}
            </Button>

            {showChart && (
              <Card>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={SENTIMENT_DATA}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="position" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Info Box */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm">Wie funktioniert das?</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  Der Argument Synthesizer zeigt verschiedene Perspektiven auf die GEZ-Debatte.
                </p>
                <p>
                  Wählen Sie Ihre Position und passen Sie die Intensität an, um die Argumente in
                  Ihrer bevorzugten Tonalität zu sehen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
