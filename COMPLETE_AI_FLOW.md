# 📸 GEZY OS - Complete AI Flow Documentation

## Photo → OCR → Interview → Document → Feedback Loop

---

## 🎯 Kompletter Workflow

```
┌─────────────────┐
│  1. PHOTO       │  User macht Foto vom Dokument (Handy/Desktop)
└────────┬────────┘
         │
         v
┌─────────────────┐
│  2. OCR/NLP     │  Gemini/OpenAI extrahiert Text + Entitäten
│  - Text Extract │  - Betrag, Datum, Aktenzeichen
│  - Entities     │  - Absender, Empfänger
│  - Confidence   │  - Fristen, Schlüsselphrasen
└────────┬────────┘
         │
         v
┌─────────────────┐
│  3. INTERVIEW   │  8 intelligente Fragen
│  - Adaptive Qs  │  - Wohnsituation
│  - Follow-ups   │  - Nachweise
│  - Sentiment    │  - Emotionale Verfassung
└────────┬────────┘
         │
         v
┌─────────────────┐
│  4. VALIDATION  │  Due Diligence Checks
│  - Consistency  │  - Widersprüche?
│  - Evidence     │  - Beweise ausreichend?
│  - Timeline     │  - Timeline plausibel?
└────────┬────────┘
         │
         v
┌─────────────────┐
│  5. DOCUMENT    │  Personalisiertes Schreiben
│  Generation     │  - Widerspruch/Klage/Anfrage
│  - Templates    │  - Basiert auf allen Daten
│  - AI-powered   │  - Gemini/OpenAI/Claude
└────────┬────────┘
         │
         v
┌─────────────────┐
│  6. EDIT/REVISE │  User kann Änderungen anfordern
│  - Feedback     │  "Bitte formeller"
│  - Re-generate  │  → AI überarbeitet
│  - Manual Edit  │  → User kann auch selbst editieren
└────────┬────────┘
         │
         v
┌─────────────────┐
│  7. FEEDBACK    │  User bewertet Qualität
│  - 1-5 Stars    │  → Fließt in Training ein
│  - Outcome      │  → Success/Rejected?
│  - Suggestions  │  → Verbesserungsvorschläge
└─────────────────┘
```

---

## 📱 1. PHOTO CAPTURE

### Frontend
```typescript
<Input
  type="file"
  accept="image/*"
  capture="environment"  // Öffnet Kamera auf Mobilgeräten
  onChange={handlePhotoCapture}
/>
```

### Features
- ✅ Direkter Kamera-Zugriff auf Smartphones
- ✅ Oder File-Upload vom Desktop
- ✅ Preview vor Absenden
- ✅ Unterstützte Formate: JPG, PNG, HEIC
- ✅ Max. Größe: 10 MB (configurable per Tier)

### User Experience
```
1. User klickt "Foto aufnehmen"
2. Kamera öffnet sich (oder File-Dialog)
3. Foto wird gemacht
4. Preview wird angezeigt
5. User klickt "Weiter zur Analyse"
```

---

## 🔍 2. OCR & NLP EXTRACTION

### API Call
```typescript
const result = await trpc.ai.analyzeDocument.mutateAsync({
  fileBuffer: base64EncodedImage,
  mimeType: 'image/jpeg'
});
```

### Backend Processing
```typescript
// server/ai-services.ts
export async function analyzeDocument(
  fileBuffer: Buffer,
  mimeType: string,
  userId: number
): Promise<ExtractedDocumentData> {

  // 1. OCR with Gemini Vision or OpenAI GPT-4V
  const ocrText = await callVisionAPI(fileBuffer);

  // 2. Entity Extraction (NER)
  const entities = extractEntities(ocrText);
  // → Personen: ["Max Mustermann", "ARD ZDF"]
  // → Beträge: ["315,00 EUR"]
  // → Daten: ["28.01.2025"]

  // 3. Document Classification
  const documentType = classifyDocument(ocrText, entities);
  // → "Beitragsbescheid" | "Mahnung" | "Vollstreckung"

  // 4. Confidence Scoring
  const confidence = {
    overall: 0.92,
    documentType: 0.95,
    amountExtraction: 0.98,
    dateExtraction: 0.89
  };

  // 5. Anomaly Detection
  const flags = detectAnomalies(entities, documentType);
  // → "Frist läuft in 5 Tagen ab!" (ERROR)
  // → "Ungewöhnlich hoher Betrag" (WARNING)

  return { /* ... extracted data ... */ };
}
```

### AI Provider Integration

**Option A: Google Gemini Vision**
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });

const result = await model.generateContent([
  "Extract all text from this document. Identify: sender, recipient, amount, dates, case number",
  {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType
    }
  }
]);
```

**Option B: OpenAI GPT-4 Vision**
```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey });

const response = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "Extract all text and key information" },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64}` }
        }
      ]
    }
  ]
});
```

### Extracted Data Structure
```typescript
interface ExtractedDocumentData {
  documentType: string;           // "Beitragsbescheid"
  issuer: string;                 // "ARD ZDF Deutschlandradio"
  recipientName: string;          // "Max Mustermann"
  recipientAddress: string;       // "Musterstr. 123, 12345 Berlin"
  amount: number;                 // 315.00
  currency: string;               // "EUR"
  issueDate: string;              // "2024-12-15"
  dueDate: string;                // "2025-01-28"
  caseNumber: string;             // "2024-1234567"

  entities: {
    persons: string[];            // ["Max Mustermann"]
    organizations: string[];      // ["ARD ZDF Deutschlandradio"]
    locations: string[];          // ["Berlin", "Köln"]
    dates: string[];              // ["15.12.2024", "28.01.2025"]
    amounts: string[];            // ["315,00 EUR"]
  };

  confidence: {
    overall: 0.92,                // 92% Gesamt-Konfidenz
    documentType: 0.95,
    amountExtraction: 0.98,
    dateExtraction: 0.89
  };

  flags: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    field?: string;
  }>;
}
```

---

## 💬 3. INTELLIGENT INTERVIEW

### Question Generation
```typescript
const questions = generateInterviewQuestions(
  extractedData,
  caseType
);
// → 8 adaptive Fragen basierend auf OCR-Ergebnis
```

### Adaptive Logic Example
```typescript
{
  id: 'q3_living_situation',
  question: 'Haben Sie im genannten Zeitraum an der Adresse gewohnt?',
  type: 'choice',
  options: [
    'Ja, durchgängig',
    'Nein, ich war im Ausland',  // ← Triggers follow-up!
    'Nein, keine eigene Wohnung'
  ],
  followUpLogic: [
    {
      condition: 'Nein, ich war im Ausland',
      nextQuestionId: 'q4_abroad_period'  // ← Jump to this question
    }
  ]
}
```

### Sentiment Analysis (Live)
Während des Interviews:
```typescript
const sentimentAnalysis = {
  emotional_state: 'anxious',     // Based on answers
  stress_level: 7,                // From q6_emotional_state
  coherence_score: 0.85           // Internal consistency
};
```

---

## ✅ 4. DATA VALIDATION & DUE DILIGENCE

### Reality Perception Checks
```typescript
const realityPerception = {
  // Do answers contradict each other?
  internal_consistency: 0.85,     // 85% consistent

  // Do answers match OCR data?
  evidence_alignment: 0.75,       // 75% alignment

  // Does timeline make sense?
  temporal_coherence: 0.80,       // 80% coherent

  // Smart suggestions
  suggestions: [
    "Aussagen weichen leicht von Dokumenten ab",
    "Bitte laden Sie Auslandsbescheinigung hoch"
  ]
};
```

### Due Diligence Report
6 automatische Checks:
1. **Frist-Check**: Deadline urgency
2. **Betragsprüfung**: Amount plausibility
3. **Dokumenten-Authentizität**: OCR confidence
4. **Beweislage**: Evidence strength
5. **Aussagenkonsistenz**: Internal consistency
6. **Emotionale Bereitschaft**: Stress level

**Output:**
```typescript
{
  overallScore: 78,  // 0-100
  checks: [/* 6 checks with pass/warning/fail */],
  legalAssessment: {
    successProbability: 0.75,      // 75% Erfolgswahrscheinlichkeit
    estimatedDuration: "2-4 Wochen",
    requiredDocuments: ["Bescheid", "Meldebescheinigung"],
    estimatedCost: { min: 0, max: 50, currency: "EUR" }
  }
}
```

---

## 📄 5. DOCUMENT GENERATION

### Template Selection
```typescript
const template = selectTemplate('widerspruch', context);
```

### AI Prompt Construction
```typescript
const prompt = `
Du bist ein juristischer Assistent. Erstelle einen Widerspruch basierend auf:

KONTEXT:
- Person: Max Mustermann
- Bescheid von: ARD ZDF Deutschlandradio
- Betrag: 315,00 EUR
- Grund: War im Ausland (01.01.2024 - 30.10.2024)

SITUATION:
- Nachweise: Auslandsbescheinigung vorhanden
- Erfolgswahrscheinlichkeit: 85%
- Emotionaler Zustand: Selbstsicher

ANFORDERUNGEN:
1. Formell korrekt (DIN 5008)
2. Sachlich und respektvoll
3. Klare Begründung
4. Verweis auf Nachweise
5. Konkreter Antrag

Erstelle einen vollständigen Widerspruch.
`;
```

### AI Provider Call
```typescript
// Mit User's eigenem API-Key (VIP/Premium)
const document = await callGemini(prompt, userApiKey);

// ODER mit Shared API (Free/Pro - limitiert)
const document = await callSharedGemini(prompt);
```

### Generated Document Structure
```typescript
{
  title: "Widerspruch - Beitragsbescheid - 2024-1234567",
  content: `
Max Mustermann
Musterstraße 123
12345 Berlin
max@example.com

ARD ZDF Deutschlandradio Beitragsservice
...

Betreff: Widerspruch gegen Beitragsbescheid vom 15.12.2024

Sehr geehrte Damen und Herren,

hiermit lege ich Widerspruch gegen den Bescheid vom 15.12.2024
über 315,00 EUR ein.

BEGRÜNDUNG:
Im genannten Zeitraum vom 01.01.2024 bis 30.10.2024 befand ich
mich im Ausland und hatte keine Wohnung in Deutschland. Gemäß
§ 2 Abs. 1 RBStV besteht daher keine Beitragspflicht.

NACHWEISE:
- Auslandsbescheinigung
- Meldebescheinigung

ANTRAG:
Ich beantrage, den Bescheid aufzuheben und von der Forderung
Abstand zu nehmen.

Mit freundlichen Grüßen
Max Mustermann
  `,
  contentHtml: "...",  // HTML-formatierte Version

  metadata: {
    generatedAt: new Date(),
    userId: 123,
    caseId: 456,
    documentType: "widerspruch",
    aiProvider: "gemini",
    promptTokens: 450,
    completionTokens: 680,
    estimatedCost: 0.023  // EUR
  },

  feedback: {
    qualityScore: 0.92,   // AI self-assessment
    suggestions: [],
    warnings: []
  }
}
```

---

## ✏️ 6. EDIT & REVISION LOOP

### User Requests Revision
```typescript
const revisedDoc = await trpc.ai.reviseDocument.mutateAsync({
  documentId: 456,
  userFeedback: "Bitte formeller formulieren und rechtliche Grundlagen zitieren",
  originalDocument: generatedDocument,
  context: {}
});
```

### AI Re-generates
```typescript
const revisionPrompt = `
Ursprüngliches Dokument:
${originalDocument.content}

Benutzer-Feedback:
"Bitte formeller formulieren und rechtliche Grundlagen zitieren"

Überarbeite das Dokument entsprechend. Füge Paragrafen hinzu:
- § 2 Abs. 1 RBStV (Beitragspflicht)
- § 3 Abs. 1 RBStV (Wohnung)

Verwende formellere Sprache.
`;

const revised = await callAI(revisionPrompt);
```

### Manual Editing
User kann auch direkt im Textarea editieren:
```tsx
<Textarea
  value={editedDocument}
  onChange={(e) => setEditedDocument(e.target.value)}
  rows={20}
/>
```

---

## ⭐ 7. FEEDBACK LOOP

### User Feedback Collection
```typescript
await trpc.ai.submitFeedback.mutateAsync({
  documentId: 456,
  rating: 5,                    // 1-5 stars
  wasHelpful: true,
  wasUsed: true,
  outcome: 'success',           // Did it work?
  improvementSuggestions: "Perfekt! Danke"
});
```

### Feedback Processing
```typescript
export async function collectFeedback(feedback: DocumentFeedback) {
  console.log('[Feedback Loop] Received:', feedback);

  if (feedback.rating >= 4 && feedback.outcome === 'success') {
    // ✅ Positive example → Use for AI fine-tuning
    await addToTrainingDataset(feedback);
  }

  if (feedback.rating <= 2) {
    // ❌ Negative feedback → Flag for manual review
    await flagForReview(feedback);
  }

  // Update quality metrics
  await updateAIModelMetrics(feedback);
}
```

### Continuous Improvement
```typescript
// Aggregate feedback over time
const metrics = {
  avgRating: 4.3,
  successRate: 0.78,        // 78% of documents were used successfully
  commonIssues: [
    "Zu informeller Ton",
    "Fehlende Paragrafen-Zitate"
  ],
  improvementSuggestions: [
    "Add more legal citations",
    "Use more formal language"
  ]
};

// Feed into next AI training iteration
await finetuneModel(metrics);
```

---

## 💰 Cost & Tier Management

### API Cost Calculation
```typescript
const cost = calculateCost(provider, promptTokens, completionTokens);

// Gemini Pricing (example)
const GEMINI_INPUT_COST = 0.000125 / 1000;   // per token
const GEMINI_OUTPUT_COST = 0.000375 / 1000;

const totalCost = (promptTokens * GEMINI_INPUT_COST) +
                  (completionTokens * GEMINI_OUTPUT_COST);
// → ~0.02€ per document
```

### Tier Limits

| Tier | API | Dokumente/Monat | Cost |
|------|-----|-----------------|------|
| **FREE** | Shared | 3 | GEZY zahlt |
| **PRO** | Shared/Optional Eigene | 20 | GEZY zahlt / User zahlt |
| **PLUS** | Eigene empfohlen | 100 | User zahlt |
| **PREMIUM** | Eigene empfohlen | ∞ | User zahlt |
| **VIP** | **Eigene PFLICHT** | ∞ | User zahlt |

### User API Key Storage
```typescript
// Encrypted storage in database
interface UserApiKey {
  userId: number;
  provider: 'gemini' | 'openai' | 'anthropic';
  encryptedKey: string;      // AES-256 encrypted
  monthlyLimit: number;      // User-set budget
  currentUsage: number;      // This month
  isActive: boolean;
}
```

---

## 🔐 Security & Privacy

### Data Handling
- ✅ **Photos**: Uploaded via HTTPS, stored encrypted (S3)
- ✅ **OCR Text**: Temporarily cached, deleted after 24h
- ✅ **Interview Data**: Encrypted at rest
- ✅ **Generated Docs**: User-owned, encrypted
- ✅ **API Keys**: AES-256 encrypted, never logged

### DSGVO Compliance
```typescript
export async function deleteUserData(userId: number) {
  // User can request complete data deletion
  await db.delete(userPhotos).where(eq(userPhotos.userId, userId));
  await db.delete(interviewSessions).where(eq(interviewSessions.userId, userId));
  await db.delete(generatedDocuments).where(eq(generatedDocuments.userId, userId));
  await db.delete(userApiKeys).where(eq(userApiKeys.userId, userId));
}
```

---

## 📊 Analytics & Monitoring

### Metrics to Track
```typescript
interface AIMetrics {
  // Performance
  avgOcrConfidence: 0.92,
  avgDocumentQuality: 0.88,
  avgProcessingTime: 23.5,      // seconds

  // User Satisfaction
  avgRating: 4.3,
  usageRate: 0.85,              // 85% actually used generated doc
  successRate: 0.78,            // 78% had positive outcome

  // Costs
  avgCostPerDocument: 0.023,    // EUR
  totalMonthlySpend: 142.50,    // EUR

  // Errors
  ocrFailureRate: 0.03,         // 3%
  documentGenerationErrors: 0.01
}
```

---

## 🚀 Next Steps for Production

### 1. Integrate Real OCR APIs
- [ ] Google Gemini Vision API
- [ ] OpenAI GPT-4 Vision
- [ ] Azure Computer Vision (fallback)

### 2. Fine-tune AI Models
- [ ] Collect 1000+ successful documents
- [ ] Fine-tune Gemini on legal language
- [ ] A/B test different prompts

### 3. Expand Beyond GEZ
- [ ] Mietrecht templates
- [ ] Arbeitsrecht templates
- [ ] Familienrecht templates
- [ ] Custom templates per Tier

### 4. Mobile App
- [ ] Native iOS/Android
- [ ] Direct camera integration
- [ ] Offline OCR (on-device)
- [ ] Push notifications for deadlines

---

## 📖 User Journey Example

**Scenario:** Maria hat einen Rundfunkbeitrag-Bescheid über 315€ erhalten. Sie war aber im Ausland.

### Step 1: Photo (30 Sekunden)
- Maria öffnet GEZY OS auf dem Handy
- Klickt "Smart Case Interview"
- Macht Foto vom Bescheid
- Klickt "Weiter"

### Step 2: OCR (5 Sekunden)
- KI extrahiert:
  - Betrag: 315,00 EUR
  - Aussteller: ARD ZDF
  - Frist: 28.01.2025 (noch 15 Tage!)
- Konfidenz: 94%

### Step 3: Interview (2 Minuten)
8 Fragen:
1. Betrag korrekt? → Ja
2. Wann erhalten? → 15.12.2024
3. An Adresse gewohnt? → **Nein, war im Ausland**
4. [Follow-up] Auslandszeitraum? → 01.01 - 30.10.2024
5. Früher gezahlt? → Nein
6. Stress-Level? → 6/10
7. Wie sicher unberechtigt? → 9/10
8. Nachweise? → Auslandsbescheinigung

### Step 4: Validation (3 Sekunden)
- ✅ Frist: OK (15 Tage)
- ✅ Aussagen: Konsistent
- ✅ Beweislage: Stark (Auslandsbescheinigung)
- ⚡ Erfolgswahrscheinlichkeit: **85%**

### Step 5: Document Generation (8 Sekunden)
- KI erstellt professionellen Widerspruch
- Basiert auf:
  - Maria's Angaben
  - OCR-Daten
  - § 2 RBStV (Beitragspflicht nur bei Wohnung in DE)
- Qualitäts-Score: 92%

### Step 6: Review & Edit (1 Minute)
- Maria liest Entwurf
- Findet gut, aber: "Bitte Paragrafen-Nummer ergänzen"
- KI überarbeitet
- Jetzt perfekt!

### Step 7: Download & Send (1 Minute)
- Maria lädt PDF herunter
- Druckt aus
- Sendet per Einschreiben

### Step 8: Feedback (30 Sekunden)
- **Ergebnis 2 Wochen später:** Bescheid zurückgenommen! ✅
- Maria gibt 5 Sterne
- "Hat perfekt funktioniert, danke!"

**Gesamt: 5 Minuten statt 2 Stunden Recherche + Schreiben** 🎉

---

## 🎓 Training Data Collection

### Good Examples (for Fine-tuning)
Criteria:
- Rating ≥ 4 stars
- Outcome = 'success'
- wasUsed = true

→ Add to training dataset

### Bad Examples (for Improvement)
Criteria:
- Rating ≤ 2 stars
- User requested many revisions

→ Flag for manual review & improvement

### Continuous Learning Loop
```
User Feedback → Aggregate Metrics → Identify Patterns →
Update Prompts/Templates → Fine-tune Model → Deploy →
Measure Improvement → Repeat
```

---

## 🌍 Expansion Roadmap

### Phase 1: GEZ Focus (Current)
- Rundfunkbeitrag
- Bescheide, Mahnungen, Vollstreckungen

### Phase 2: Mietrecht
- Mieterhöhungen
- Nebenkostenabrechnungen
- Kündigungen

### Phase 3: Arbeitsrecht
- Kündigungsschutzklagen
- Abfindungen
- Arbeitszeugnisse

### Phase 4: Alle Rechtsgebiete
- 50+ Dokumenttypen
- Custom Templates
- Multi-Language Support

---

## 💡 Innovation Ideas

### AI-Powered Features (Future)
- **Präzedenzfall-Suche**: AI findet ähnliche erfolgreiche Fälle
- **Outcome Prediction**: Basierend auf Millionen Fällen
- **Auto-Follow-Up**: KI erinnert an Fristen & nächste Schritte
- **Voice Interview**: Statt Tippen → Sprechen
- **Multi-Document Analysis**: Mehrere Bescheide gleichzeitig
- **Legal Chatbot**: 24/7 Fragen beantworten

---

Dieses System ist **production-ready** (mit echten OCR APIs) und skaliert auf **Millionen User**! 🚀
