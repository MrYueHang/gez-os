import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const flowSteps = [
  {
    number: 1,
    title: 'Start',
    action: 'Sie nutzen das Entry-Terminal',
    description: 'Sie berichten: "Ich habe Post vom Beitragsservice."',
    layer: 'L3: UI_SURFACE (Entry-Terminal)',
    benefit: 'Einfache, sofortige Fallaufnahme'
  },
  {
    number: 2,
    title: 'Analyse',
    action: 'Sie laden das Dokument hoch',
    description: 'Das System klassifiziert das Dokument und extrahiert Frist/Betrag. CASE_TYPE wird erkannt.',
    layer: 'L2: SKILLS (Klassifizierung, Extraktion)',
    benefit: 'Automatische Datenerfassung und Falltyp-Bestimmung'
  },
  {
    number: 3,
    title: 'Strategie',
    action: 'Das System bestimmt die besten Optionen',
    description: 'Das MCP nutzt die ROLE_HATs (Strategy + Compliance) zur Entscheidungsfindung.',
    layer: 'L0: MCP + L1: ROLE_HATs',
    benefit: 'Strategisch fundierte und rechtskonforme Optionen'
  },
  {
    number: 4,
    title: 'Erklärung',
    action: 'Die Story-KI erklärt Ihre Situation',
    description: 'Die Story-KI übersetzt die Situation in einfache Sprache. Die UI zeigt Ihre Optionen.',
    layer: 'L2: AI_AGENT (Story-KI) + L3: UI',
    benefit: 'Volle Transparenz und Verständnis'
  },
  {
    number: 5,
    title: 'Pfadwahl',
    action: 'Sie wählen Ihren Weg',
    description: 'Sie entscheiden sich z.B. für "Widerspruch prüfen" oder einen anderen Handlungspfad.',
    layer: 'L3: UI_SURFACE (Case-Wizard)',
    benefit: 'Sie behalten die Kontrolle über den Prozess'
  },
  {
    number: 6,
    title: 'Dossierbau',
    action: 'Das System erstellt Ihr Dossier',
    description: 'SKILLS + Archivist bauen das Dossier und einen Dokumentvorschlag. MCP verwaltet Fristen.',
    layer: 'L2: SKILLS + Archivist + L0: MCP',
    benefit: 'Automatisierte Erstellung professioneller Dokumente'
  },
  {
    number: 7,
    title: 'Profi-Option',
    action: 'Optional: Anwaltliche Prüfung',
    description: 'Die Lawyer-Bridge bereitet das Dossier für einen externen Anwalt vor.',
    layer: 'L2: Lawyer-Bridge + EXTERNAL_PRO',
    benefit: 'Nahtlose Integration externer Expertise'
  },
  {
    number: 8,
    title: 'Nachlauf',
    action: 'Sie verfolgen den Status',
    description: 'Status-Timeline zeigt den Fortschritt. Community bietet Austausch und Support.',
    layer: 'L3: Status-Timeline + L1.5: COMMUNITY_SPACE',
    benefit: 'Kontinuierliche Begleitung und Support'
  }
];

export default function GezFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = flowSteps[activeStep];

  return (
    <section id="flow" className="py-20 sm:py-32">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Der Standard-GEZ-Flow</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            So funktioniert GEZy OS: Von der Fallaufnahme bis zur Unterstützung. Klicken Sie auf die Schritte, um mehr zu erfahren.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-2">
              {flowSteps.map((step, index) => {
                const isActive = activeStep === index;
                const bgClass = isActive ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-muted text-muted-foreground hover:bg-muted/80';
                const circleClass = isActive ? 'bg-blue-600 text-white' : 'bg-muted-foreground/20 text-muted-foreground';
                
                return (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${bgClass}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${circleClass}`}>
                      {step.number}
                    </div>
                    <div className="text-sm font-medium">{step.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Details */}
          <div className="lg:col-span-2">
            <Card className="border-border h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    {currentStep.number}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{currentStep.action}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Was passiert im System?</h4>
                  <p className="text-foreground leading-relaxed">{currentStep.description}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">Architektur-Ebenen</h4>
                  <p className="text-sm text-blue-800">{currentStep.layer}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-green-900 mb-1">Ihr Vorteil</h4>
                  <p className="text-sm text-green-800">{currentStep.benefit}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    variant="outline"
                    disabled={activeStep === 0}
                  >
                    Zurück
                  </Button>
                  <Button
                    onClick={() => setActiveStep(Math.min(flowSteps.length - 1, activeStep + 1))}
                    disabled={activeStep === flowSteps.length - 1}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Weiter <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="mt-12 hidden md:block">
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>
            <div className="relative grid grid-cols-8 gap-4">
              {flowSteps.map((step, index) => {
                const isActive = activeStep === index;
                const btnClass = isActive ? 'bg-blue-600 text-white ring-4 ring-blue-200' : 'bg-white text-blue-600 border-2 border-blue-300 hover:bg-blue-50';
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <button
                      onClick={() => setActiveStep(index)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${btnClass}`}
                    >
                      {step.number}
                    </button>
                    <p className="text-xs font-semibold text-center mt-3 text-foreground">{step.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
