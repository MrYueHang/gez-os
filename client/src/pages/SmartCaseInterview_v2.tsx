/**
 * Smart Case Interview v2 - Complete Flow
 *
 * Photo → OCR/Text → Interview → Data Validation → Personalized Document → Feedback Loop
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Camera,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Download,
  Edit,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send
} from "lucide-react";
import { toast } from "sonner";

type FlowStep = 'photo' | 'ocr' | 'interview' | 'document' | 'feedback';

export default function SmartCaseInterviewV2() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>('photo');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // OCR results
  const [extractedData, setExtractedData] = useState<any>(null);
  const [ocrConfidence, setOcrConfidence] = useState(0);

  // Interview
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);

  // Analysis
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Document
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const [documentTab, setDocumentTab] = useState<'preview' | 'edit'>('preview');
  const [editedDocument, setEditedDocument] = useState('');

  // Feedback
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // API Keys (optional for users)
  const [hasOwnApiKey, setHasOwnApiKey] = useState(false);
  const [apiKeyProvider, setApiKeyProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [apiKey, setApiKey] = useState('');

  // Mutations
  const analyzeDocMutation = trpc.ai.analyzeDocument.useMutation();
  const startInterviewMutation = trpc.ai.startInterview.useMutation();
  const completeInterviewMutation = trpc.ai.completeInterview.useMutation();
  const generateDocMutation = trpc.ai.generateDocument.useMutation();
  const reviseDocMutation = trpc.ai.reviseDocument.useMutation();
  const submitFeedbackMutation = trpc.ai.submitFeedback.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Zur Anmeldung
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== STEP 1: PHOTO UPLOAD =====
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setPhotoFile(file);
    toast.success('Foto aufgenommen!');
  };

  const processPhoto = async () => {
    if (!photoFile) return;

    setCurrentStep('ocr');
    toast.info('Dokument wird analysiert...');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (!base64) {
        toast.error('Fehler beim Lesen des Fotos');
        setCurrentStep('photo');
        return;
      }

      try {
        const result = await analyzeDocMutation.mutateAsync({
          fileBuffer: base64,
          mimeType: photoFile.type,
        });

        setExtractedData(result);
        setOcrConfidence(result.confidence.overall);
        toast.success(`OCR abgeschlossen (${Math.round(result.confidence.overall * 100)}% Konfidenz)`);

        // Auto-start interview after 1 second
        setTimeout(() => startInterview(result), 1000);
      } catch (error: any) {
        toast.error('Fehler bei der Analyse: ' + error.message);
        setCurrentStep('photo');
      }
    };

    reader.readAsDataURL(photoFile);
  };

  // ===== STEP 2: INTERVIEW =====
  const startInterview = async (extractedData: any) => {
    try {
      const mockCaseId = Date.now();

      const result = await startInterviewMutation.mutateAsync({
        caseId: mockCaseId,
        extractedData,
      });

      setQuestions(result.questions);
      setCurrentStep('interview');
    } catch (error: any) {
      toast.error('Fehler beim Starten des Interviews: ' + error.message);
    }
  };

  const submitAnswer = () => {
    if (currentAnswer === null || currentAnswer === undefined || currentAnswer === '') {
      toast.error('Bitte beantworten Sie die Frage');
      return;
    }

    const newResponses = [
      ...responses,
      {
        questionId: questions[currentQuestionIndex].id,
        answer: currentAnswer,
        timestamp: new Date(),
      }
    ];

    setResponses(newResponses);
    setCurrentAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Interview complete → Analyze & Generate Document
      completeInterviewAndGenerate(newResponses);
    }
  };

  const completeInterviewAndGenerate = async (finalResponses: any[]) => {
    try {
      toast.info('Interview wird analysiert...');

      const result = await completeInterviewMutation.mutateAsync({
        sessionId: `session_${Date.now()}`,
        caseId: Date.now(),
        responses: finalResponses,
        extractedData,
      });

      setAnalysisResults(result);

      // Now generate document
      toast.info('Personalisiertes Schreiben wird erstellt...');

      const apiKeyConfig = hasOwnApiKey && apiKey ? {
        provider: apiKeyProvider,
        key: apiKey
      } : undefined;

      const document = await generateDocMutation.mutateAsync({
        extractedData,
        interviewSession: result.session,
        dueDiligence: result.dueDiligence,
        documentType: 'widerspruch',
        userApiKey: apiKeyConfig,
      });

      setGeneratedDocument(document);
      setEditedDocument(document.content);
      setCurrentStep('document');
      toast.success('Dokument erstellt!');
    } catch (error: any) {
      toast.error('Fehler: ' + error.message);
    }
  };

  // ===== STEP 3: DOCUMENT EDITING =====
  const requestRevision = async () => {
    if (!feedbackText.trim()) {
      toast.error('Bitte beschreiben Sie die gewünschten Änderungen');
      return;
    }

    try {
      toast.info('Dokument wird überarbeitet...');

      const revised = await reviseDocMutation.mutateAsync({
        documentId: generatedDocument.metadata.caseId,
        userFeedback: feedbackText,
        originalDocument: generatedDocument,
        context: {},
      });

      setGeneratedDocument(revised);
      setEditedDocument(revised.content);
      setFeedbackText('');
      toast.success('Dokument wurde überarbeitet!');
    } catch (error: any) {
      toast.error('Fehler: ' + error.message);
    }
  };

  const downloadDocument = () => {
    const element = document.createElement('a');
    const file = new Blob([editedDocument], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${generatedDocument.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Dokument heruntergeladen!');
  };

  // ===== STEP 4: FEEDBACK =====
  const submitFinalFeedback = async () => {
    if (rating === 0) {
      toast.error('Bitte geben Sie eine Bewertung ab');
      return;
    }

    try {
      await submitFeedbackMutation.mutateAsync({
        documentId: generatedDocument.metadata.caseId,
        rating,
        wasHelpful: rating >= 3,
        wasUsed: true,
        improvementSuggestions: feedbackText || undefined,
      });

      toast.success('Vielen Dank für Ihr Feedback!');
      setCurrentStep('feedback');
    } catch (error: any) {
      toast.error('Fehler: ' + error.message);
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
            {question.options?.map((option: string) => (
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
            <div className="flex justify-between text-sm">
              <span>1</span>
              <span className="font-semibold text-lg">{currentAnswer || 5}</span>
              <span>10</span>
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
        return <Input type="date" value={currentAnswer || ''} onChange={(e) => setCurrentAnswer(e.target.value)} />;
      default:
        return <Input value={currentAnswer || ''} onChange={(e) => setCurrentAnswer(e.target.value)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">GEZY OS - Smart Case Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  Photo → OCR → Interview → Dokument → Feedback
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Zurück</Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={
            currentStep === 'photo' ? 20 :
            currentStep === 'ocr' ? 40 :
            currentStep === 'interview' ? 60 :
            currentStep === 'document' ? 80 : 100
          } />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>📸 Photo</span>
            <span>🔍 OCR</span>
            <span>💬 Interview</span>
            <span>📄 Dokument</span>
            <span>⭐ Feedback</span>
          </div>
        </div>

        {/* STEP: PHOTO */}
        {currentStep === 'photo' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Schritt 1: Dokument fotografieren
              </CardTitle>
              <CardDescription>
                Fotografieren Sie Ihren Bescheid, Ihre Mahnung oder ein anderes rechtliches Dokument
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!photoPreview ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Foto aufnehmen oder hochladen</h3>
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="max-w-xs mx-auto"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <img src={photoPreview} alt="Preview" className="w-full rounded-lg border" />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview('');
                    }}>
                      Neu aufnehmen
                    </Button>
                    <Button className="flex-1" onClick={processPhoto}>
                      Weiter zur Analyse
                    </Button>
                  </div>
                </div>
              )}

              {/* API Key Configuration (optional) */}
              <div className="border-t pt-6">
                <Label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={hasOwnApiKey}
                    onChange={(e) => setHasOwnApiKey(e.target.checked)}
                  />
                  Eigenen API-Key verwenden (VIP/Premium)
                </Label>

                {hasOwnApiKey && (
                  <div className="space-y-3 pl-6">
                    <RadioGroup value={apiKeyProvider} onValueChange={(v: any) => setApiKeyProvider(v)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gemini" id="gemini" />
                        <Label htmlFor="gemini">Google Gemini</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="openai" id="openai" />
                        <Label htmlFor="openai">OpenAI</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anthropic" id="anthropic" />
                        <Label htmlFor="anthropic">Anthropic Claude</Label>
                      </div>
                    </RadioGroup>
                    <Input
                      type="password"
                      placeholder="API Key eingeben"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Mit eigenem API-Key keine Limits + bessere Performance
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP: OCR */}
        {currentStep === 'ocr' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 animate-pulse" />
                Schritt 2: OCR & Datenextraktion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!extractedData ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span>Texterkennung läuft...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span>Entitäten werden extrahiert...</span>
                  </div>
                </div>
              ) : (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erkannt:</strong> {extractedData.documentType}<br />
                    <strong>Betrag:</strong> {extractedData.amount} {extractedData.currency}<br />
                    <strong>Aussteller:</strong> {extractedData.issuer}<br />
                    <strong>Konfidenz:</strong> {Math.round(ocrConfidence * 100)}%
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP: INTERVIEW */}
        {currentStep === 'interview' && questions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Frage {currentQuestionIndex + 1} von {questions.length}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentQuestionIndex / questions.length) * 100)}%
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

              <div className="flex gap-3">
                {currentQuestionIndex > 0 && (
                  <Button variant="outline" onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}>
                    Zurück
                  </Button>
                )}
                <Button className="flex-1" onClick={submitAnswer}>
                  {currentQuestionIndex < questions.length - 1 ? 'Weiter' : 'Abschließen & Dokument erstellen'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP: DOCUMENT */}
        {currentStep === 'document' && generatedDocument && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {generatedDocument.title}
                </CardTitle>
                <CardDescription>
                  Qualitäts-Score: {Math.round(generatedDocument.feedback.qualityScore * 100)}% |
                  AI-Provider: {generatedDocument.metadata.aiProvider}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={documentTab} onValueChange={(v: any) => setDocumentTab(v)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Vorschau</TabsTrigger>
                    <TabsTrigger value="edit">Bearbeiten</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="border rounded-lg p-6 bg-white text-black whitespace-pre-wrap font-mono text-sm">
                      {generatedDocument.content}
                    </div>

                    {generatedDocument.feedback.warnings.length > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Warnungen:</strong>
                          <ul className="list-disc list-inside mt-2">
                            {generatedDocument.feedback.warnings.map((w: string, i: number) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={downloadDocument}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={() => setDocumentTab('edit')}>
                        <Edit className="w-4 h-4 mr-2" />
                        Überarbeiten
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="edit" className="space-y-4">
                    <div>
                      <Label>Änderungswünsche beschreiben:</Label>
                      <Textarea
                        placeholder="z.B. 'Bitte formeller formulieren' oder 'Mehr Details zur Begründung'"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button onClick={requestRevision}>
                      <Send className="w-4 h-4 mr-2" />
                      Überarbeitete Version anfordern
                    </Button>

                    <div>
                      <Label>Manuell bearbeiten:</Label>
                      <Textarea
                        value={editedDocument}
                        onChange={(e) => setEditedDocument(e.target.value)}
                        rows={20}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Feedback geben
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Wie hilfreich war das generierte Dokument?</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Optionale Anmerkungen:</Label>
                  <Textarea
                    placeholder="Was hat gut funktioniert? Was könnte besser sein?"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={submitFinalFeedback} className="w-full">
                  Feedback absenden & Abschließen
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP: FEEDBACK CONFIRMATION */}
        {currentStep === 'feedback' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Vielen Dank!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Ihr Fall wurde erfolgreich bearbeitet. Das generierte Dokument können Sie jederzeit im Dashboard abrufen.</p>

              <div className="flex gap-3">
                <Button onClick={() => navigate("/dashboard")}>Zum Dashboard</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>Neuer Fall</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
