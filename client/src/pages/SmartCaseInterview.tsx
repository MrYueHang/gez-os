import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Brain,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  TrendingUp,
  Shield,
  Target,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";

interface InterviewQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'date' | 'number' | 'scale' | 'boolean';
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
  purpose: string;
  legalRelevance: string;
}

interface InterviewResponse {
  questionId: string;
  answer: any;
  timestamp: Date;
  confidence?: number;
}

export default function SmartCaseInterview() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Interview state
  const [currentStep, setCurrentStep] = useState<'upload' | 'analysis' | 'interview' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // tRPC mutations
  const analyzeDocMutation = trpc.ai.analyzeDocument.useMutation();
  const startInterviewMutation = trpc.ai.startInterview.useMutation();
  const completeInterviewMutation = trpc.ai.completeInterview.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Bitte melden Sie sich an, um das AI-Interview zu nutzen.
            </p>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Zur Anmeldung
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setCurrentStep('analysis');

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (!base64) {
        toast.error('Fehler beim Lesen der Datei');
        setCurrentStep('upload');
        return;
      }

      try {
        const result = await analyzeDocMutation.mutateAsync({
          fileBuffer: base64,
          mimeType: file.type,
        });

        setExtractedData(result);
        toast.success('Dokument erfolgreich analysiert!');

        // Auto-proceed to interview
        setTimeout(() => startInterviewSession(result), 1000);
      } catch (error: any) {
        toast.error('Fehler bei der Analyse: ' + error.message);
        setCurrentStep('upload');
      }
    };

    reader.readAsDataURL(file);
  };

  const startInterviewSession = async (extractedData: any) => {
    try {
      // Create a temporary case for this interview
      // TODO: Actually create case in database
      const mockCaseId = Date.now();

      const result = await startInterviewMutation.mutateAsync({
        caseId: mockCaseId,
        extractedData,
      });

      setSessionId(result.session.sessionId);
      setQuestions(result.questions);
      setCurrentStep('interview');
    } catch (error: any) {
      toast.error('Fehler beim Starten des Interviews: ' + error.message);
    }
  };

  const handleAnswerSubmit = () => {
    if (currentAnswer === null || currentAnswer === undefined || currentAnswer === '') {
      toast.error('Bitte beantworten Sie die Frage');
      return;
    }

    const response: InterviewResponse = {
      questionId: questions[currentQuestionIndex].id,
      answer: currentAnswer,
      timestamp: new Date(),
    };

    setResponses([...responses, response]);
    setCurrentAnswer(null);

    // Check if interview is complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeInterview();
    }
  };

  const completeInterview = async () => {
    try {
      const finalResponses = [
        ...responses,
        {
          questionId: questions[currentQuestionIndex].id,
          answer: currentAnswer,
          timestamp: new Date(),
        }
      ];

      const result = await completeInterviewMutation.mutateAsync({
        sessionId,
        caseId: Date.now(),
        responses: finalResponses,
        extractedData,
      });

      setAnalysisResults(result);
      setCurrentStep('results');
      toast.success('Interview abgeschlossen!');
    } catch (error: any) {
      toast.error('Fehler beim Abschließen: ' + error.message);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    switch (question.type) {
      case 'boolean':
        return (
          <RadioGroup value={currentAnswer?.toString()} onValueChange={(v) => setCurrentAnswer(v === 'true')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="yes" />
              <Label htmlFor="yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="no" />
              <Label htmlFor="no">Nein</Label>
            </div>
          </RadioGroup>
        );

      case 'choice':
        return (
          <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 (Niedrig)</span>
              <span className="font-semibold text-lg text-foreground">{currentAnswer || 5}</span>
              <span>10 (Hoch)</span>
            </div>
            <Slider
              value={[currentAnswer || 5]}
              onValueChange={(v) => setCurrentAnswer(v[0])}
              min={1}
              max={10}
              step={1}
            />
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={currentAnswer || ''}
            onChange={(e) => setCurrentAnswer(e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentAnswer || ''}
            onChange={(e) => setCurrentAnswer(Number(e.target.value))}
            min={question.validation?.min}
            max={question.validation?.max}
          />
        );

      default: // text
        return (
          <Input
            type="text"
            value={currentAnswer || ''}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Ihre Antwort..."
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Smart Fall-Interview</h1>
                <p className="text-sm text-muted-foreground">
                  KI-gestützte Fallaufnahme mit intelligenter Analyse
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Zurück
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <Progress
            value={
              currentStep === 'upload' ? 25 :
              currentStep === 'analysis' ? 50 :
              currentStep === 'interview' ? 75 :
              100
            }
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>1. Upload</span>
            <span>2. Analyse</span>
            <span>3. Interview</span>
            <span>4. Ergebnis</span>
          </div>
        </div>

        {/* Step 1: Upload Document */}
        {currentStep === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dokument hochladen
              </CardTitle>
              <CardDescription>
                Laden Sie Ihren Bescheid, Ihre Mahnung oder ein anderes Dokument hoch.
                Unsere KI wird es automatisch analysieren.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Dokument auswählen</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF, JPG oder PNG (max. 10 MB)
                </p>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-sm">Was passiert mit Ihrem Dokument?</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>OCR-Texterkennung extrahiert alle relevanten Daten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>NLP-Analyse erkennt Fristen, Beträge und wichtige Klauseln</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Automatische Plausibilitätsprüfung der Forderung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Verschlüsselte Speicherung nach DSGVO-Standards</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Analysis in Progress */}
        {currentStep === 'analysis' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 animate-pulse" />
                Dokument wird analysiert...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>OCR-Texterkennung läuft...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-200" />
                  <span>Entitäten werden extrahiert...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400" />
                  <span>Plausibilitätscheck läuft...</span>
                </div>
              </div>

              {extractedData && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Analyse abgeschlossen! Gefunden: {extractedData.documentType},
                    Betrag: {extractedData.amount} {extractedData.currency}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Interview */}
        {currentStep === 'interview' && questions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Frage {currentQuestionIndex + 1} von {questions.length}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentQuestionIndex / questions.length) * 100)}% abgeschlossen
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-4 block">
                  {questions[currentQuestionIndex].question}
                </Label>
                {renderQuestion()}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-600" />
                  <div className="text-sm">
                    <p className="font-semibold">Warum fragen wir das?</p>
                    <p className="text-muted-foreground">{questions[currentQuestionIndex].purpose}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-semibold">Rechtliche Relevanz:</p>
                    <p className="text-muted-foreground">{questions[currentQuestionIndex].legalRelevance}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {currentQuestionIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  >
                    Zurück
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={handleAnswerSubmit}
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Weiter' : 'Abschließen'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results & Recommendations */}
        {currentStep === 'results' && analysisResults && (
          <div className="space-y-6">
            {/* Due Diligence Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Due Diligence Report
                </CardTitle>
                <CardDescription>
                  Gesamtscore: {Math.round(analysisResults.dueDiligence.overallScore)}/100
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResults.dueDiligence.checks.map((check: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                    {check.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {check.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                    {check.status === 'fail' && <AlertCircle className="w-5 h-5 text-red-600" />}
                    <div className="flex-1">
                      <h4 className="font-semibold">{check.name}</h4>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                      {check.details && (
                        <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold">{check.score}/100</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  KI-Empfehlungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResults.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold">{rec.title}</h3>
                      <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                        {Math.round(rec.confidence * 100)}% Konfidenz
                      </span>
                    </div>
                    <p className="text-muted-foreground">{rec.description}</p>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-green-700">Vorteile:</h4>
                        <ul className="text-sm space-y-1">
                          {rec.pros.map((pro: string, j: number) => (
                            <li key={j} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 mt-0.5 text-green-600" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-red-700">Nachteile:</h4>
                        <ul className="text-sm space-y-1">
                          {rec.cons.map((con: string, j: number) => (
                            <li key={j} className="flex items-start gap-1">
                              <AlertCircle className="w-3 h-3 mt-0.5 text-red-600" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Nächste Schritte:</h4>
                      <ol className="text-sm space-y-1 list-decimal list-inside">
                        {rec.nextSteps.map((step: string, j: number) => (
                          <li key={j}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => navigate("/dashboard")}>
                Zum Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Neuen Fall starten
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
