/**
 * AI Document Generator
 *
 * Generates personalized legal documents based on:
 * - OCR extracted data
 * - Interview responses
 * - User profile
 * - Case context
 */

import type {
  ExtractedDocumentData,
  InterviewSession,
  DueDiligenceReport
} from "./ai-services";

// ========================================
// DOCUMENT TEMPLATES
// ========================================

export interface DocumentTemplate {
  type: 'widerspruch' | 'klage' | 'anfrage' | 'beschwerde' | 'antrag';
  sections: DocumentSection[];
  variables: string[]; // Placeholders like {{userName}}, {{amount}}
}

export interface DocumentSection {
  title?: string;
  content: string;
  required: boolean;
  conditionalLogic?: {
    condition: string; // e.g., "hasAbroadEvidence"
    showIfTrue: boolean;
  };
}

export interface GeneratedDocument {
  title: string;
  content: string; // Full text
  contentHtml: string; // HTML formatted
  metadata: {
    generatedAt: Date;
    userId: number;
    caseId: number;
    documentType: string;
    aiProvider: 'gemini' | 'openai' | 'anthropic';
    promptTokens: number;
    completionTokens: number;
    estimatedCost: number;
  };
  feedback: {
    qualityScore: number; // 0-1 (AI self-assessment)
    suggestions: string[];
    warnings: string[];
  };
}

// ========================================
// MAIN GENERATOR
// ========================================

export async function generatePersonalizedDocument(
  extractedData: ExtractedDocumentData,
  interviewSession: InterviewSession,
  dueDiligence: DueDiligenceReport,
  userProfile: {
    id: number;
    name: string;
    email: string;
    address?: string;
    tier: 'free' | 'pro' | 'plus' | 'premium' | 'vip';
    apiKey?: {
      provider: 'gemini' | 'openai' | 'anthropic';
      key: string;
    };
  },
  documentType: 'widerspruch' | 'klage' | 'anfrage'
): Promise<GeneratedDocument> {

  console.log(`[AI Document Generator] Generating ${documentType} for user ${userProfile.id}`);

  // Build context from all data sources
  const context = buildContext(extractedData, interviewSession, dueDiligence, userProfile);

  // Select appropriate template
  const template = selectTemplate(documentType, context);

  // Generate document using AI
  const generatedText = await callAIProvider(
    userProfile,
    template,
    context
  );

  // Post-process and format
  const document = formatDocument(generatedText, documentType, context);

  // Quality check
  const qualityCheck = await performQualityCheck(document, context);

  return {
    ...document,
    feedback: qualityCheck,
    metadata: {
      generatedAt: new Date(),
      userId: userProfile.id,
      caseId: interviewSession.caseId,
      documentType,
      aiProvider: userProfile.apiKey?.provider || 'gemini',
      promptTokens: 0, // TODO: Track from API response
      completionTokens: 0,
      estimatedCost: 0
    }
  };
}

// ========================================
// CONTEXT BUILDER
// ========================================

function buildContext(
  extractedData: ExtractedDocumentData,
  interview: InterviewSession,
  dueDiligence: DueDiligenceReport,
  userProfile: any
) {
  // Extract key facts from interview
  const facts: Record<string, any> = {};

  interview.responses.forEach(response => {
    facts[response.questionId] = response.answer;
  });

  return {
    // User info
    userName: userProfile.name,
    userEmail: userProfile.email,
    userAddress: userProfile.address || "N/A",

    // Document data
    issuer: extractedData.issuer,
    documentType: extractedData.documentType,
    amount: extractedData.amount,
    currency: extractedData.currency || 'EUR',
    issueDate: extractedData.issueDate,
    dueDate: extractedData.dueDate,
    caseNumber: extractedData.caseNumber,

    // Interview facts
    documentReceived: facts['q2_timeline'],
    livingSituation: facts['q3_living_situation'],
    abroadPeriod: facts['q4_abroad_period'],
    previousPayments: facts['q5_previous_payments'],
    stressLevel: facts['q6_emotional_state'],
    confidence: facts['q7_confidence'],
    evidence: facts['q8_supporting_evidence'],

    // Analysis results
    successProbability: dueDiligence.legalAssessment.successProbability,
    requiredDocuments: dueDiligence.legalAssessment.requiredDocuments,
    estimatedDuration: dueDiligence.legalAssessment.estimatedDuration,

    // Sentiment
    emotionalState: interview.sentimentAnalysis.emotional_state,

    // Reality checks
    consistency: interview.realityPerception.internal_consistency,
    evidenceAlignment: interview.realityPerception.evidence_alignment,
    suggestions: interview.realityPerception.suggestions,

    // Flags
    hasUrgentDeadline: extractedData.flags.some(f => f.type === 'error'),
    hasHighAmount: extractedData.flags.some(f => f.field === 'amount'),
  };
}

// ========================================
// TEMPLATE SELECTOR
// ========================================

function selectTemplate(
  documentType: string,
  context: Record<string, any>
): DocumentTemplate {

  if (documentType === 'widerspruch') {
    return getWiderspruchTemplate(context);
  }

  // Fallback generic template
  return {
    type: 'widerspruch',
    sections: [],
    variables: []
  };
}

function getWiderspruchTemplate(context: any): DocumentTemplate {
  const sections: DocumentSection[] = [
    {
      title: "Absender",
      content: `{{userName}}
{{userAddress}}
{{userEmail}}`,
      required: true
    },
    {
      title: "Empfänger",
      content: `{{issuer}}`,
      required: true
    },
    {
      title: "Betreff",
      content: `Widerspruch gegen {{documentType}} vom {{issueDate}}, Aktenzeichen: {{caseNumber}}`,
      required: true
    },
    {
      content: `Sehr geehrte Damen und Herren,

hiermit lege ich Widerspruch gegen den Bescheid vom {{issueDate}} über {{amount}} {{currency}} ein.`,
      required: true
    },
    {
      title: "Begründung",
      content: `Die Forderung ist aus folgenden Gründen unberechtigt:

{{reasoningBlock}}`,
      required: true
    },
    {
      title: "Nachweise",
      content: `Zur Untermauerung meines Widerspruchs füge ich folgende Nachweise bei:

{{evidenceList}}`,
      required: true,
      conditionalLogic: {
        condition: 'hasEvidence',
        showIfTrue: true
      }
    },
    {
      title: "Antrag",
      content: `Ich beantrage, den Bescheid vom {{issueDate}} aufzuheben und von der Forderung Abstand zu nehmen.`,
      required: true
    },
    {
      content: `Mit freundlichen Grüßen

{{userName}}

Anlagen:
{{attachmentsList}}`,
      required: true
    }
  ];

  return {
    type: 'widerspruch',
    sections,
    variables: [
      'userName', 'userAddress', 'userEmail', 'issuer', 'documentType',
      'issueDate', 'amount', 'currency', 'caseNumber', 'reasoningBlock',
      'evidenceList', 'attachmentsList'
    ]
  };
}

// ========================================
// AI PROVIDER INTEGRATION
// ========================================

async function callAIProvider(
  userProfile: any,
  template: DocumentTemplate,
  context: Record<string, any>
): Promise<string> {

  const provider = userProfile.apiKey?.provider || 'gemini';
  const apiKey = userProfile.apiKey?.key;

  // Build AI prompt
  const prompt = buildPrompt(template, context);

  if (provider === 'gemini') {
    return callGemini(prompt, apiKey);
  } else if (provider === 'openai') {
    return callOpenAI(prompt, apiKey);
  } else if (provider === 'anthropic') {
    return callClaude(prompt, apiKey);
  }

  // Fallback: Template filling without AI
  return fillTemplate(template, context);
}

function buildPrompt(template: DocumentTemplate, context: Record<string, any>): string {
  return `Du bist ein juristischer Assistent. Erstelle einen professionellen Widerspruch basierend auf folgenden Informationen:

KONTEXT:
- Person: ${context.userName}
- Adresse: ${context.userAddress}
- Bescheid von: ${context.issuer}
- Dokumenttyp: ${context.documentType}
- Betrag: ${context.amount} ${context.currency}
- Ausstellungsdatum: ${context.issueDate}
- Aktenzeichen: ${context.caseNumber}

SITUATION:
- Wohnsituation: ${context.livingSituation}
${context.abroadPeriod ? `- Auslandsaufenthalt: ${context.abroadPeriod}` : ''}
- Frühere Zahlungen: ${context.previousPayments}
- Verfügbare Nachweise: ${context.evidence}

ANALYSE:
- Erfolgswahrscheinlichkeit: ${Math.round(context.successProbability * 100)}%
- Interne Konsistenz: ${Math.round(context.consistency * 100)}%
- Beweislage-Alignment: ${Math.round(context.evidenceAlignment * 100)}%

ANFORDERUNGEN:
1. Formell korrekt (Absender, Empfänger, Betreff, Datum)
2. Sachlich und respektvoll im Ton
3. Klare Begründung basierend auf den Fakten
4. Verweis auf relevante Nachweise
5. Konkrete Anträge

Erstelle einen vollständigen Widerspruch. Nutze die Informationen intelligent und füge rechtlich relevante Argumente hinzu.
Formatiere das Dokument professionell.`;
}

async function callGemini(prompt: string, apiKey?: string): Promise<string> {
  // TODO: Actual Gemini API integration
  // For now, return template-based generation

  console.log('[AI] Gemini API call (mock)');

  return `[GEMINI GENERATED DOCUMENT]

${prompt}

[This would be the actual AI-generated content]`;
}

async function callOpenAI(prompt: string, apiKey?: string): Promise<string> {
  // TODO: Actual OpenAI API integration

  console.log('[AI] OpenAI API call (mock)');

  return `[OPENAI GENERATED DOCUMENT]

${prompt}

[This would be the actual AI-generated content]`;
}

async function callClaude(prompt: string, apiKey?: string): Promise<string> {
  // TODO: Actual Claude API integration

  console.log('[AI] Claude API call (mock)');

  return `[CLAUDE GENERATED DOCUMENT]

${prompt}

[This would be the actual AI-generated content]`;
}

function fillTemplate(template: DocumentTemplate, context: Record<string, any>): string {
  let document = '';

  // Build reasoning block
  const reasoningBlock = buildReasoningBlock(context);
  const evidenceList = buildEvidenceList(context);
  const attachmentsList = buildAttachmentsList(context);

  const enrichedContext = {
    ...context,
    reasoningBlock,
    evidenceList,
    attachmentsList
  };

  template.sections.forEach(section => {
    // Check conditional logic
    if (section.conditionalLogic) {
      const condition = section.conditionalLogic.condition;
      const shouldShow = evaluateCondition(condition, context);

      if (shouldShow !== section.conditionalLogic.showIfTrue) {
        return; // Skip this section
      }
    }

    if (section.title) {
      document += `\n${section.title}\n${'='.repeat(section.title.length)}\n`;
    }

    let content = section.content;

    // Replace variables
    Object.keys(enrichedContext).forEach(key => {
      const value = enrichedContext[key];
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });

    document += `${content}\n`;
  });

  return document;
}

function buildReasoningBlock(context: any): string {
  const reasons: string[] = [];

  if (context.livingSituation?.includes('Ausland')) {
    reasons.push(`1. Im genannten Zeitraum ${context.abroadPeriod || 'befand ich mich im Ausland'} und hatte keine Wohnung in Deutschland. Gemäß § 2 Abs. 1 RBStV besteht daher keine Beitragspflicht.`);
  }

  if (context.livingSituation?.includes('keine eigene Wohnung')) {
    reasons.push(`2. Ich hatte im genannten Zeitraum keine eigene Wohnung und war somit nicht beitragspflichtig.`);
  }

  if (context.previousPayments === 'Nein, noch nie') {
    reasons.push(`3. Ich habe zu keinem Zeitpunkt Rundfunkbeiträge entrichtet, da mir keine Beitragspflicht bekannt war und keine entsprechende Wohnsituation vorlag.`);
  }

  if (context.hasHighAmount) {
    reasons.push(`4. Der geforderte Betrag von ${context.amount} ${context.currency} erscheint unverhältnismäßig hoch und bedarf einer detaillierten Aufschlüsselung.`);
  }

  if (reasons.length === 0) {
    reasons.push(`Die Forderung ist sachlich und rechtlich nicht nachvollziehbar. Eine detaillierte Prüfung der Unterlagen ergibt, dass keine Zahlungsverpflichtung besteht.`);
  }

  return reasons.join('\n\n');
}

function buildEvidenceList(context: any): string {
  const evidence = context.evidence;

  if (!evidence || evidence === 'Keine') {
    return 'Weitere Nachweise reiche ich nach Aufforderung nach.';
  }

  if (Array.isArray(evidence)) {
    return evidence.map((e, i) => `${i + 1}. ${e}`).join('\n');
  }

  if (typeof evidence === 'string') {
    const items = evidence.split(',').map(e => e.trim());
    return items.map((e, i) => `${i + 1}. ${e}`).join('\n');
  }

  return 'Nachweise liegen vor.';
}

function buildAttachmentsList(context: any): string {
  const attachments: string[] = [];

  if (context.evidence && context.evidence !== 'Keine') {
    if (context.evidence.includes('Meldebescheinigung')) {
      attachments.push('- Meldebescheinigung');
    }
    if (context.evidence.includes('Auslandsbescheinigung')) {
      attachments.push('- Nachweis über Auslandsaufenthalt');
    }
    if (context.evidence.includes('Kontoauszüge')) {
      attachments.push('- Kontoauszüge');
    }
  }

  if (attachments.length === 0) {
    attachments.push('- Kopie des Bescheids');
  }

  return attachments.join('\n');
}

function evaluateCondition(condition: string, context: any): boolean {
  if (condition === 'hasEvidence') {
    return context.evidence && context.evidence !== 'Keine';
  }

  if (condition === 'hasAbroadPeriod') {
    return !!context.abroadPeriod;
  }

  return true;
}

// ========================================
// DOCUMENT FORMATTING
// ========================================

function formatDocument(
  text: string,
  documentType: string,
  context: Record<string, any>
): { title: string; content: string; contentHtml: string } {

  const title = `Widerspruch - ${context.documentType} - ${context.caseNumber}`;

  // Convert to HTML
  const contentHtml = text
    .split('\n')
    .map(line => {
      // Headers
      if (line.match(/^[A-Z][^.!?]*$/)) {
        return `<h3>${line}</h3>`;
      }
      // Paragraphs
      if (line.trim()) {
        return `<p>${line}</p>`;
      }
      return '<br>';
    })
    .join('\n');

  return {
    title,
    content: text,
    contentHtml: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; }
          h3 { color: #333; margin-top: 20px; }
          p { margin: 10px 0; }
        </style>
      </head>
      <body>
        ${contentHtml}
      </body>
      </html>
    `
  };
}

// ========================================
// QUALITY CHECK
// ========================================

async function performQualityCheck(
  document: { content: string },
  context: Record<string, any>
) {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  let qualityScore = 1.0;

  // Check if all required fields are present
  if (!document.content.includes(context.userName)) {
    warnings.push('Ihr Name fehlt im Dokument');
    qualityScore -= 0.2;
  }

  if (!document.content.includes(context.issuer)) {
    warnings.push('Empfänger-Name fehlt');
    qualityScore -= 0.2;
  }

  if (!document.content.includes(String(context.amount))) {
    warnings.push('Betrag wird nicht erwähnt');
    qualityScore -= 0.1;
  }

  // Check length
  if (document.content.length < 500) {
    suggestions.push('Das Dokument könnte ausführlicher sein');
    qualityScore -= 0.1;
  }

  // Check formality
  if (document.content.includes('Du') || document.content.includes('dein')) {
    warnings.push('Informelle Anrede gefunden - sollte "Sie" sein');
    qualityScore -= 0.3;
  }

  // Check for evidence mention
  if (context.evidence && context.evidence !== 'Keine') {
    if (!document.content.toLowerCase().includes('nachweis')) {
      suggestions.push('Nachweise sollten explizit erwähnt werden');
      qualityScore -= 0.1;
    }
  }

  return {
    qualityScore: Math.max(0, qualityScore),
    suggestions,
    warnings
  };
}

// ========================================
// FEEDBACK LOOP
// ========================================

export interface DocumentFeedback {
  documentId: number;
  userId: number;
  rating: number; // 1-5 stars
  wasHelpful: boolean;
  wasUsed: boolean;
  outcome?: 'success' | 'partial' | 'rejected' | 'pending';
  improvementSuggestions?: string;
  createdAt: Date;
}

/**
 * Collect user feedback on generated document
 * This feeds back into AI training/fine-tuning
 */
export async function collectFeedback(
  feedback: Omit<DocumentFeedback, 'createdAt'>
): Promise<void> {
  console.log('[Feedback Loop] Received feedback:', feedback);

  // TODO: Store in database
  // TODO: If rating < 3, flag for review
  // TODO: Aggregate feedback for AI model improvement

  if (feedback.rating >= 4 && feedback.wasUsed && feedback.outcome === 'success') {
    console.log('[Feedback Loop] Positive outcome - adding to training data');
    // This is a successful example - can be used for fine-tuning
  }

  if (feedback.rating <= 2) {
    console.log('[Feedback Loop] Negative feedback - flagging for review');
    // Flag for manual review and improvement
  }
}

/**
 * Iterative improvement: User can request revisions
 */
export async function reviseDocument(
  originalDocument: GeneratedDocument,
  userFeedback: string,
  context: Record<string, any>
): Promise<GeneratedDocument> {
  console.log('[Revision] User requested changes:', userFeedback);

  // Build revision prompt
  const revisionPrompt = `
Ursprüngliches Dokument:
${originalDocument.content}

Benutzer-Feedback:
${userFeedback}

Bitte überarbeite das Dokument entsprechend dem Feedback. Behalte die formelle Struktur bei, aber integriere die gewünschten Änderungen.
`;

  // Call AI with revision prompt
  // TODO: Actual implementation

  return {
    ...originalDocument,
    content: originalDocument.content + '\n\n[REVISED VERSION WOULD BE HERE]',
    metadata: {
      ...originalDocument.metadata,
      generatedAt: new Date()
    }
  };
}
