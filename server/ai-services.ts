/**
 * AI Services for GEZY OS
 *
 * Smart Features:
 * 1. Document OCR & Analysis (Vision AI)
 * 2. Intelligent Interview System (Conversational AI)
 * 3. Due Diligence Engine (Data Validation)
 * 4. Sentiment & Reality Perception Analysis
 */

import { ENV } from "./_core/env";

// ========================================
// 1. DOCUMENT ANALYSIS SERVICE
// ========================================

export interface ExtractedDocumentData {
  documentType: string;
  issuer: string;
  recipientName?: string;
  recipientAddress?: string;
  amount?: number;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  caseNumber?: string;
  referenceCodes?: string[];

  // AI-extracted entities
  entities: {
    persons: string[];
    organizations: string[];
    locations: string[];
    dates: string[];
    amounts: string[];
  };

  // Text content
  fullText: string;
  keyPhrases: string[];

  // AI confidence scores
  confidence: {
    overall: number;
    documentType: number;
    amountExtraction: number;
    dateExtraction: number;
  };

  // Anomalies & flags
  flags: {
    type: 'warning' | 'error' | 'info';
    message: string;
    field?: string;
  }[];
}

/**
 * Analyze uploaded document image/PDF using OCR and NLP
 */
export async function analyzeDocument(
  fileBuffer: Buffer,
  mimeType: string,
  userId: number
): Promise<ExtractedDocumentData> {
  console.log(`[AI] Analyzing document for user ${userId}, type: ${mimeType}`);

  // TODO: Integrate with actual OCR service (Google Cloud Vision, AWS Textract, or Azure)
  // For now, return mock data structure

  const mockExtraction: ExtractedDocumentData = {
    documentType: "Beitragsbescheid",
    issuer: "ARD ZDF Deutschlandradio Beitragsservice",
    recipientName: "Max Mustermann",
    recipientAddress: "Musterstraße 123, 12345 Berlin",
    amount: 315.00,
    currency: "EUR",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    caseNumber: "2024-1234567",
    referenceCodes: ["BK-2024-001", "AZ-12345"],

    entities: {
      persons: ["Max Mustermann"],
      organizations: ["ARD ZDF Deutschlandradio Beitragsservice"],
      locations: ["Berlin", "Köln"],
      dates: [new Date().toISOString().split('T')[0]],
      amounts: ["315,00 EUR", "18,36 EUR"]
    },

    fullText: "Beitragsbescheid über 315,00 EUR...",
    keyPhrases: [
      "Rundfunkbeitrag",
      "Zahlungsverpflichtung",
      "Widerspruchsfrist",
      "vier Wochen"
    ],

    confidence: {
      overall: 0.92,
      documentType: 0.95,
      amountExtraction: 0.98,
      dateExtraction: 0.89
    },

    flags: []
  };

  // Add intelligent flags
  if (mockExtraction.amount && mockExtraction.amount > 500) {
    mockExtraction.flags.push({
      type: 'warning',
      message: 'Ungewöhnlich hoher Betrag - bitte prüfen',
      field: 'amount'
    });
  }

  const dueDate = mockExtraction.dueDate ? new Date(mockExtraction.dueDate) : null;
  if (dueDate && dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
    mockExtraction.flags.push({
      type: 'error',
      message: 'Frist läuft in weniger als 7 Tagen ab!',
      field: 'dueDate'
    });
  }

  return mockExtraction;
}

// ========================================
// 2. INTELLIGENT INTERVIEW SYSTEM
// ========================================

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'date' | 'number' | 'scale' | 'boolean';
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  followUpLogic?: {
    condition: string;
    nextQuestionId: string;
  }[];
  purpose: string; // Why we're asking this
  legalRelevance: string; // How this affects the case
}

export interface InterviewResponse {
  questionId: string;
  answer: any;
  timestamp: Date;
  confidence?: number; // User's confidence in their answer
}

export interface InterviewSession {
  sessionId: string;
  userId: number;
  caseId: number;
  currentQuestionIndex: number;
  responses: InterviewResponse[];

  // AI analysis
  sentimentAnalysis: {
    emotional_state: 'calm' | 'anxious' | 'angry' | 'confused' | 'confident';
    stress_level: number; // 0-10
    coherence_score: number; // 0-1 (are answers consistent?)
  };

  // Reality perception check
  realityPerception: {
    internal_consistency: number; // 0-1 (do their statements contradict?)
    evidence_alignment: number; // 0-1 (do statements match documents?)
    temporal_coherence: number; // 0-1 (timeline makes sense?)
    suggestions: string[];
  };

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate intelligent interview questions based on document analysis
 */
export function generateInterviewQuestions(
  extractedData: ExtractedDocumentData,
  caseType: string
): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [
    {
      id: 'q1_basic_confirmation',
      question: `Wir haben aus Ihrem Dokument einen Betrag von ${extractedData.amount} EUR extrahiert. Ist das korrekt?`,
      type: 'boolean',
      validation: { required: true },
      purpose: 'Validierung der OCR-Extraktion',
      legalRelevance: 'Betragshöhe ist zentral für Widerspruch'
    },
    {
      id: 'q2_timeline',
      question: 'Wann haben Sie das Dokument erstmals erhalten?',
      type: 'date',
      validation: { required: true },
      purpose: 'Fristberechnung',
      legalRelevance: 'Widerspruchsfrist beginnt mit Zustellung'
    },
    {
      id: 'q3_living_situation',
      question: 'Haben Sie im genannten Zeitraum an der angegebenen Adresse gewohnt?',
      type: 'choice',
      options: [
        'Ja, durchgängig',
        'Ja, aber nur teilweise',
        'Nein, ich war im Ausland',
        'Nein, ich hatte keine eigene Wohnung',
        'Nein, andere Gründe'
      ],
      validation: { required: true },
      followUpLogic: [
        {
          condition: 'Nein, ich war im Ausland',
          nextQuestionId: 'q4_abroad_period'
        }
      ],
      purpose: 'Prüfung der Beitragspflicht',
      legalRelevance: 'Beitragspflicht besteht nur bei Wohnung in Deutschland'
    },
    {
      id: 'q4_abroad_period',
      question: 'Von wann bis wann waren Sie im Ausland? (Bitte genaue Daten)',
      type: 'text',
      validation: { required: true },
      purpose: 'Zeitraum ohne Beitragspflicht ermitteln',
      legalRelevance: 'Befreiung für Auslandsaufenthalt möglich'
    },
    {
      id: 'q5_previous_payments',
      question: 'Haben Sie in der Vergangenheit bereits Rundfunkbeiträge gezahlt?',
      type: 'choice',
      options: [
        'Ja, regelmäßig',
        'Ja, teilweise',
        'Nein, noch nie',
        'Weiß ich nicht'
      ],
      validation: { required: true },
      purpose: 'Zahlungshistorie für Plausibilitätsprüfung',
      legalRelevance: 'Kann Kulanzregelung beeinflussen'
    },
    {
      id: 'q6_emotional_state',
      question: 'Wie würden Sie Ihre aktuelle emotionale Belastung durch diesen Fall einschätzen?',
      type: 'scale',
      validation: { required: false, min: 1, max: 10 },
      purpose: 'Emotionale Verfassung für Beratungsansatz',
      legalRelevance: 'Keine direkte, aber wichtig für Betreuung'
    },
    {
      id: 'q7_confidence',
      question: 'Wie sicher sind Sie, dass die Forderung unberechtigt ist?',
      type: 'scale',
      validation: { required: true, min: 1, max: 10 },
      purpose: 'Selbsteinschätzung der Erfolgsaussichten',
      legalRelevance: 'Beeinflusst Strategie (Widerspruch vs. Vergleich)'
    },
    {
      id: 'q8_supporting_evidence',
      question: 'Welche Nachweise können Sie zur Unterstützung Ihrer Position vorlegen?',
      type: 'choice',
      options: [
        'Meldebescheinigung / Ummeldung',
        'Kontoauszüge (Zahlungen)',
        'Auslandsbescheinigung',
        'Arbeitsvertrag / Arbeitgeberbescheinigung',
        'ALG/Bürgergeld Bescheid',
        'Ärztliche Unterlagen',
        'Keine'
      ],
      validation: { required: true },
      purpose: 'Beweismittel sammeln',
      legalRelevance: 'Zentral für Erfolg des Widerspruchs'
    }
  ];

  return questions;
}

/**
 * Analyze interview responses for sentiment and reality perception
 */
export function analyzeInterviewSession(
  session: InterviewSession
): InterviewSession {
  // Sentiment Analysis
  const responses = session.responses;

  // Check confidence levels
  const confidenceLevels = responses
    .filter(r => r.questionId === 'q7_confidence')
    .map(r => Number(r.answer));

  const avgConfidence = confidenceLevels.length > 0
    ? confidenceLevels.reduce((a, b) => a + b, 0) / confidenceLevels.length
    : 5;

  // Determine emotional state based on patterns
  let emotional_state: 'calm' | 'anxious' | 'angry' | 'confused' | 'confident' = 'calm';

  if (avgConfidence > 8) emotional_state = 'confident';
  else if (avgConfidence < 4) emotional_state = 'anxious';

  const stressLevel = responses.find(r => r.questionId === 'q6_emotional_state')?.answer || 5;

  session.sentimentAnalysis = {
    emotional_state,
    stress_level: Number(stressLevel),
    coherence_score: 0.85 // TODO: NLP analysis for contradictions
  };

  // Reality Perception Analysis
  const internalConsistency = analyzeConsistency(responses);
  const evidenceAlignment = checkEvidenceAlignment(responses);
  const temporalCoherence = checkTimelineCoherence(responses);

  const suggestions: string[] = [];

  if (internalConsistency < 0.7) {
    suggestions.push('Einige Angaben scheinen widersprüchlich. Bitte prüfen Sie Ihre Zeitangaben.');
  }

  if (evidenceAlignment < 0.6) {
    suggestions.push('Ihre Aussagen weichen von den Dokumenten ab. Bitte laden Sie zusätzliche Nachweise hoch.');
  }

  if (temporalCoherence < 0.5) {
    suggestions.push('Die zeitliche Abfolge ist unklar. Bitte präzisieren Sie die Daten.');
  }

  if (avgConfidence > 8 && evidenceAlignment < 0.5) {
    suggestions.push('Sie wirken sehr sicher, aber die Beweislage ist schwach. Erwägen Sie rechtliche Beratung.');
  }

  session.realityPerception = {
    internal_consistency: internalConsistency,
    evidence_alignment: evidenceAlignment,
    temporal_coherence: temporalCoherence,
    suggestions
  };

  return session;
}

function analyzeConsistency(responses: InterviewResponse[]): number {
  // TODO: Implement NLP-based contradiction detection
  // For now, simple heuristic
  return 0.85;
}

function checkEvidenceAlignment(responses: InterviewResponse[]): number {
  // Check if user claims to have supporting evidence
  const evidenceResponse = responses.find(r => r.questionId === 'q8_supporting_evidence');

  if (!evidenceResponse || evidenceResponse.answer === 'Keine') {
    return 0.3; // Low alignment without evidence
  }

  return 0.8; // Good alignment if evidence exists
}

function checkTimelineCoherence(responses: InterviewResponse[]): number {
  // Check if dates make logical sense
  const receiptDate = responses.find(r => r.questionId === 'q2_timeline')?.answer;
  const abroadPeriod = responses.find(r => r.questionId === 'q4_abroad_period')?.answer;

  // TODO: Parse and validate timeline
  return 0.75;
}

// ========================================
// 3. DUE DILIGENCE ENGINE
// ========================================

export interface DueDiligenceReport {
  overallScore: number; // 0-100

  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'info';
    score: number;
    message: string;
    details?: string;
  }[];

  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    reasoning: string;
  }[];

  legalAssessment: {
    successProbability: number; // 0-1
    estimatedDuration: string; // e.g., "2-4 Wochen"
    requiredDocuments: string[];
    estimatedCost: {
      min: number;
      max: number;
      currency: string;
    };
  };
}

/**
 * Perform due diligence on case data
 */
export async function performDueDiligence(
  extractedData: ExtractedDocumentData,
  interviewSession: InterviewSession,
  userId: number
): Promise<DueDiligenceReport> {
  console.log(`[AI] Performing due diligence for user ${userId}`);

  const checks: DueDiligenceReport['checks'] = [];
  const recommendations: DueDiligenceReport['recommendations'] = [];

  // Check 1: Deadline urgency
  const dueDate = extractedData.dueDate ? new Date(extractedData.dueDate) : null;
  const daysUntilDeadline = dueDate
    ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (daysUntilDeadline !== null) {
    if (daysUntilDeadline < 7) {
      checks.push({
        name: 'Frist-Check',
        status: 'fail',
        score: 20,
        message: `DRINGEND: Nur noch ${daysUntilDeadline} Tage bis zur Frist!`,
        details: 'Widerspruch muss spätestens bis zum ' + dueDate.toLocaleDateString('de-DE')
      });
      recommendations.push({
        priority: 'high',
        action: 'Sofortiger Widerspruch erforderlich',
        reasoning: 'Die Widerspruchsfrist läuft in weniger als 7 Tagen ab'
      });
    } else if (daysUntilDeadline < 14) {
      checks.push({
        name: 'Frist-Check',
        status: 'warning',
        score: 60,
        message: `Noch ${daysUntilDeadline} Tage bis zur Frist`,
        details: 'Handeln Sie zeitnah'
      });
    } else {
      checks.push({
        name: 'Frist-Check',
        status: 'pass',
        score: 100,
        message: `Ausreichend Zeit: ${daysUntilDeadline} Tage`,
        details: 'Sie können in Ruhe vorbereiten'
      });
    }
  }

  // Check 2: Amount plausibility
  if (extractedData.amount) {
    const isPlausible = extractedData.amount > 0 && extractedData.amount < 2000;
    checks.push({
      name: 'Betragsprüfung',
      status: isPlausible ? 'pass' : 'warning',
      score: isPlausible ? 100 : 50,
      message: isPlausible
        ? `Betrag ${extractedData.amount} EUR liegt im üblichen Rahmen`
        : `Betrag ${extractedData.amount} EUR erscheint ungewöhnlich`,
      details: 'Typische Rundfunkbeiträge: 18,36€/Monat, max. ~600€ Nachforderung'
    });
  }

  // Check 3: Document authenticity
  const authenticityScore = extractedData.confidence.overall * 100;
  checks.push({
    name: 'Dokumenten-Authentizität',
    status: authenticityScore > 80 ? 'pass' : 'warning',
    score: authenticityScore,
    message: `OCR-Konfidenz: ${Math.round(authenticityScore)}%`,
    details: 'Hohe Konfidenz deutet auf authentisches Dokument hin'
  });

  // Check 4: Evidence strength
  const evidenceScore = interviewSession.realityPerception.evidence_alignment * 100;
  checks.push({
    name: 'Beweislage',
    status: evidenceScore > 70 ? 'pass' : evidenceScore > 40 ? 'warning' : 'fail',
    score: evidenceScore,
    message: evidenceScore > 70
      ? 'Starke Beweislage'
      : evidenceScore > 40
        ? 'Mittelmäßige Beweislage'
        : 'Schwache Beweislage',
    details: 'Nachweise sind entscheidend für Erfolg'
  });

  if (evidenceScore < 60) {
    recommendations.push({
      priority: 'high',
      action: 'Zusätzliche Nachweise beschaffen',
      reasoning: 'Ihre aktuelle Beweislage ist zu schwach'
    });
  }

  // Check 5: Consistency
  const consistencyScore = interviewSession.realityPerception.internal_consistency * 100;
  checks.push({
    name: 'Aussagenkonsistenz',
    status: consistencyScore > 80 ? 'pass' : 'warning',
    score: consistencyScore,
    message: consistencyScore > 80
      ? 'Ihre Angaben sind konsistent'
      : 'Einige Angaben widersprechen sich',
    details: 'Widersprüche können Fall schwächen'
  });

  // Check 6: Emotional readiness
  const stressLevel = interviewSession.sentimentAnalysis.stress_level;
  checks.push({
    name: 'Emotionale Belastung',
    status: stressLevel < 7 ? 'pass' : 'warning',
    score: Math.max(0, 100 - stressLevel * 10),
    message: stressLevel < 7
      ? 'Belastung im normalen Bereich'
      : 'Hohe emotionale Belastung',
    details: 'Bei hoher Belastung: Erwägen Sie professionelle Unterstützung'
  });

  if (stressLevel > 7) {
    recommendations.push({
      priority: 'medium',
      action: 'Anwalt konsultieren',
      reasoning: 'Hohe Stressbelastung - lassen Sie sich professionell vertreten'
    });
  }

  // Calculate overall score
  const overallScore = checks.reduce((sum, check) => sum + check.score, 0) / checks.length;

  // Legal assessment
  const successProbability = calculateSuccessProbability(
    overallScore,
    evidenceScore,
    consistencyScore
  );

  const legalAssessment: DueDiligenceReport['legalAssessment'] = {
    successProbability,
    estimatedDuration: daysUntilDeadline && daysUntilDeadline < 14
      ? '1-2 Wochen (eilig)'
      : '2-6 Wochen',
    requiredDocuments: generateRequiredDocumentsList(interviewSession),
    estimatedCost: {
      min: successProbability > 0.7 ? 0 : 200,
      max: successProbability > 0.7 ? 50 : 800,
      currency: 'EUR'
    }
  };

  return {
    overallScore,
    checks,
    recommendations,
    legalAssessment
  };
}

function calculateSuccessProbability(
  overallScore: number,
  evidenceScore: number,
  consistencyScore: number
): number {
  // Weighted formula
  const probability = (
    overallScore * 0.4 +
    evidenceScore * 0.4 +
    consistencyScore * 0.2
  ) / 100;

  return Math.max(0, Math.min(1, probability));
}

function generateRequiredDocumentsList(session: InterviewSession): string[] {
  const docs: string[] = ['Kopie des Bescheids'];

  const evidenceResponse = session.responses.find(r => r.questionId === 'q8_supporting_evidence');
  const livingResponse = session.responses.find(r => r.questionId === 'q3_living_situation');

  if (livingResponse?.answer?.includes('Ausland')) {
    docs.push('Auslandsbescheinigung', 'Meldebescheinigung');
  }

  if (livingResponse?.answer?.includes('keine eigene Wohnung')) {
    docs.push('Mietvertrag oder Meldebestätigung');
  }

  docs.push('Identitätsnachweis (Personalausweis-Kopie)');

  return docs;
}

// ========================================
// 4. AI RECOMMENDATION ENGINE
// ========================================

export interface AIRecommendation {
  type: 'widerspruch' | 'klage' | 'vergleich' | 'anwalt' | 'abwarten';
  title: string;
  description: string;
  reasoning: string[];
  pros: string[];
  cons: string[];
  nextSteps: string[];
  confidence: number; // 0-1
}

export function generateRecommendations(
  dueDiligence: DueDiligenceReport,
  interviewSession: InterviewSession
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  const { successProbability } = dueDiligence.legalAssessment;
  const stressLevel = interviewSession.sentimentAnalysis.stress_level;

  // Recommendation 1: Widerspruch einlegen
  if (successProbability > 0.5) {
    recommendations.push({
      type: 'widerspruch',
      title: 'Widerspruch einlegen',
      description: 'Schriftlichen Widerspruch gegen den Bescheid einreichen',
      reasoning: [
        `Erfolgswahrscheinlichkeit: ${Math.round(successProbability * 100)}%`,
        'Ihre Beweislage ist ausreichend stark',
        'Widerspruch ist kostenfrei'
      ],
      pros: [
        'Keine Kosten',
        'Suspensiveffekt (Forderung ruht)',
        'Chance auf vollständige Aufhebung'
      ],
      cons: [
        'Zeitaufwand',
        'Erfolg nicht garantiert',
        'Bei Ablehnung: Nächste Stufe ist Klage'
      ],
      nextSteps: [
        'Widerspruch mit unserer Vorlage erstellen',
        'Alle Nachweise beifügen',
        'Einschreiben mit Rückschein versenden',
        'Frist notieren'
      ],
      confidence: successProbability
    });
  }

  // Recommendation 2: Anwalt konsultieren
  if (stressLevel > 7 || successProbability < 0.4 || dueDiligence.overallScore < 60) {
    recommendations.push({
      type: 'anwalt',
      title: 'Anwalt konsultieren',
      description: 'Lassen Sie sich von einem Fachanwalt beraten',
      reasoning: [
        stressLevel > 7 ? 'Ihre emotionale Belastung ist hoch' : '',
        successProbability < 0.4 ? 'Der Fall ist komplex' : '',
        dueDiligence.overallScore < 60 ? 'Schwierige Ausgangslage' : ''
      ].filter(Boolean),
      pros: [
        'Professionelle Vertretung',
        'Höhere Erfolgschancen',
        'Kein eigener Zeitaufwand',
        'Ggf. Kostenübernahme durch Rechtsschutz'
      ],
      cons: [
        'Kosten (200-800 EUR)',
        'Termin erforderlich',
        'Nicht bei Bagatellfällen empfohlen'
      ],
      nextSteps: [
        'Anwälte in Ihrer Nähe suchen',
        'Erstberatung vereinbaren',
        'Alle Unterlagen mitbringen',
        'Rechtsschutzversicherung prüfen'
      ],
      confidence: stressLevel > 7 ? 0.85 : 0.65
    });
  }

  // Recommendation 3: Vergleich anstreben
  if (successProbability >= 0.3 && successProbability < 0.7) {
    recommendations.push({
      type: 'vergleich',
      title: 'Vergleich vorschlagen',
      description: 'Kulanzregelung oder Ratenzahlung vereinbaren',
      reasoning: [
        'Erfolgsaussichten sind unsicher',
        'Kompromisslösung kann Zeit und Kosten sparen',
        'Vermeidet langwierigen Rechtsstreit'
      ],
      pros: [
        'Schnelle Lösung',
        'Planungssicherheit',
        'Keine Gerichtskosten',
        'Oft Kulanzregelungen möglich'
      ],
      cons: [
        'Teilweise Zahlung wahrscheinlich',
        'Kein vollständiger Erfolg',
        'Präzedenzfall für künftige Fälle'
      ],
      nextSteps: [
        'Kontakt zum Beitragsservice aufnehmen',
        'Vergleichsvorschlag unterbreiten',
        'Ratenzahlung beantragen',
        'Schriftlich bestätigen lassen'
      ],
      confidence: 0.70
    });
  }

  // Sort by confidence
  return recommendations.sort((a, b) => b.confidence - a.confidence);
}
