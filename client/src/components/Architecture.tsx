import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Users, Zap, Shield, Layers } from 'lucide-react';

const layers = [
  {
    id: 'l0',
    name: 'L0: OS_KERNEL + MCP',
    icon: Database,
    color: 'from-purple-600 to-purple-700',
    description: 'Die Meta-Logik und der Master Control Process pro Fall. Das Herzstück der Orchestrierung.',
    focus: 'Orchestrierung',
    role: 'Verwaltet den gesamten Lebenszyklus eines Falls und koordiniert alle anderen Ebenen.'
  },
  {
    id: 'l1',
    name: 'L1: Rollen-/Denk-Hüte',
    icon: Shield,
    color: 'from-blue-600 to-blue-700',
    description: 'Strategische und regulatorische Perspektiven (Strategy, Compliance, User, Data).',
    focus: 'Governance',
    role: 'Definiert die Entscheidungskriterien und Compliance-Anforderungen für das MCP.'
  },
  {
    id: 'l1-5',
    name: 'L1.5: Community / CCC',
    icon: Users,
    color: 'from-green-600 to-green-700',
    description: 'Der Erfahrungs- und Resonanzraum für Nutzer. Kollektives Wissen und Austausch.',
    focus: 'Kollektives Wissen',
    role: 'Ermöglicht Nutzern, Erfahrungen zu teilen und voneinander zu lernen.'
  },
  {
    id: 'l2',
    name: 'L2: Skills & KI-Subagenten',
    icon: Zap,
    color: 'from-orange-600 to-orange-700',
    description: 'Die funktionale Intelligenz (Story-KI, Archivist, Risk-Analyzer) und atomare Fähigkeiten.',
    focus: 'Intelligenz',
    role: 'Führt spezialisierte Aufgaben durch und bietet KI-gestützte Unterstützung.'
  },
  {
    id: 'l3',
    name: 'L3: User-Prompt-Tools & UI',
    icon: Layers,
    color: 'from-red-600 to-red-700',
    description: 'Die Schnittstelle zum Nutzer (Landingpages, Terminals, Dashboards, Timelines).',
    focus: 'Interaktion',
    role: 'Präsentiert Informationen und ermöglicht Nutzer-Interaktionen mit dem System.'
  }
];

const objectTypes = [
  { name: 'OS_KERNEL', description: 'GEZy OS Meta-Logik', layer: 'L0', role: 'Foundation' },
  { name: 'MCP', description: 'Master Control Process pro Fall/Asset', layer: 'L0', role: 'Orchestration' },
  { name: 'ROLE_HAT', description: 'Verantwortungs-Hüte (Strategie, Compliance, etc.)', layer: 'L1', role: 'Governance' },
  { name: 'AI_AGENT', description: 'Subagenten mit Persona (Story-KI, Archivist, etc.)', layer: 'L2', role: 'Intelligence' },
  { name: 'SKILL', description: 'Atomare Fähigkeiten (extrahieren, klassifizieren, etc.)', layer: 'L2', role: 'Functionality' },
  { name: 'PROCESS_NODE', description: 'Prozessschritte in Flows', layer: 'L0/L2', role: 'Workflow' },
  { name: 'CASE_TYPE', description: 'Art des Falls (Beitragsbescheid, Mahnung, etc.)', layer: 'L0/L3', role: 'Classification' },
  { name: 'DOC_TEMPLATE', description: 'Dokumentvorlagen (Widerspruch, Auskunftsersuchen, etc.)', layer: 'L2/L3', role: 'Output' },
  { name: 'UI_SURFACE', description: 'Frontend-Elemente (Entry-Terminal, Dashboards, etc.)', layer: 'L3', role: 'Interface' },
  { name: 'COMMUNITY_SPACE', description: 'Bereiche für Erfahrungs-/Story-Sharing', layer: 'L1.5', role: 'Social' },
  { name: 'EXTERNAL_PRO', description: 'Externe Profis (z.B. Partner-Anwälte)', layer: 'L2', role: 'External' }
];

const tags = [
  { name: 'LAYER', values: ['L0', 'L1', 'L1.5', 'L2', 'L3'], description: 'Definiert die Architektur-Ebene' },
  { name: 'ROLE', values: ['CXO', 'AGENT', 'PROCESS', 'CASE', 'DOC', 'UI', 'COMMUNITY', 'EXTERNAL'], description: 'Definiert die Rolle/Funktion' },
  { name: 'DOMAIN', values: ['GEZ', 'RECHT', 'FINANZEN', 'USER', 'TECH', 'IMMOBILIEN'], description: 'Definiert die Fachdomäne' },
  { name: 'MODE', values: ['HUMAN', 'AI', 'MIXED'], description: 'Definiert die Interaktionsart' },
  { name: 'SENSITIV', values: ['LOW', 'MEDIUM', 'HIGH'], description: 'Definiert die Sensitivität' }
];

export default function Architecture() {
  return (
    <section id="architecture" className="py-20 sm:py-32 bg-muted/50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Die Architektur: Schichten für maximale Flexibilität</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            GEZy OS ist modular aufgebaut, um nicht nur den GEZ-Fall, sondern zukünftig auch andere komplexe Domains abbilden zu können.
          </p>
        </div>

        <Tabs defaultValue="layers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="layers">Die 5 Ebenen</TabsTrigger>
            <TabsTrigger value="objects">Objekt-Typen</TabsTrigger>
            <TabsTrigger value="tags">Tagging-System</TabsTrigger>
          </TabsList>

          {/* Layers Tab */}
          <TabsContent value="layers" className="space-y-6">
            <div className="space-y-4">
              {layers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <Card key={layer.id} className="border-border overflow-hidden">
                    <CardHeader className={`bg-gradient-to-r ${layer.color} text-white`}>
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6" />
                        <div>
                          <CardTitle className="text-white">{layer.name}</CardTitle>
                          <p className="text-sm text-white/80 mt-1">{layer.focus}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Beschreibung</h4>
                        <p className="text-foreground">{layer.description}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Rolle im System</h4>
                        <p className="text-foreground">{layer.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Objects Tab */}
          <TabsContent value="objects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectTypes.map((obj, index) => (
                <Card key={index} className="border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{obj.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{obj.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-muted-foreground">Layer:</span>
                        <p className="text-foreground">{obj.layer}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">Rolle:</span>
                        <p className="text-foreground">{obj.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tags Tab */}
          <TabsContent value="tags" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Tagging-System</h3>
              <p className="text-sm text-blue-800">
                Jedes Objekt in GEZy OS kann mit Tags versehen werden, um seinen Kontext, seine Rolle, seine Domain und seine Sensitivität zu definieren. Dies ermöglicht flexible Filterung, Governance und zukünftige Erweiterungen.
              </p>
            </div>
            <div className="space-y-4">
              {tags.map((tag, index) => (
                <Card key={index} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{tag.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tag.values.map((value, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {value}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Extensibility Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Die Vision: Von GEZ zu jeder komplexen Domain</h3>
          <p className="text-foreground leading-relaxed mb-4">
            Die modulare Architektur von GEZy OS ist der Schlüssel zur <strong>Extensibilität</strong>. Durch den Austausch der <strong>DOMAIN-spezifischen</strong> L2-Skills und AI-Agenten (z.B. GEZ-Archivist gegen Immobilien-Archivist) und die Definition neuer CASE_TYPEs kann die gesamte L0/L1/L3-Grundlogik auf neue Anwendungsfälle gespiegelt werden.
          </p>
          <p className="text-foreground font-semibold text-lg">
            GEZy OS ist die Blaupause für die Strukturierung jeder komplexen Herausforderung.
          </p>
        </div>
      </div>
    </section>
  );
}
