# 🤖 GEZY OS - AI Features Dokumentation

## Übersicht

GEZY OS nutzt fortschrittliche KI-Technologien für eine intelligente, benutzerfreundliche Fallaufnahme und -analyse. Das System kombiniert mehrere AI-Komponenten für ein ganzheitliches Verständnis des Rechtsfalls.

---

## 🎯 Kernfunktionen

### 1. **Smart Document Analysis** (OCR + NLP)
**Zweck:** Automatische Extraktion und Validierung von Dokumenteninhalten

**Features:**
- ✅ OCR-Texterkennung für PDF, JPG, PNG
- ✅ Automatische Dokumenttyp-Erkennung (Bescheid, Mahnung, Vollstreckung, etc.)
- ✅ Entitäts-Extraktion:
  - Personen (Absender, Empfänger)
  - Organisationen (Behörden, Inkassobüros)
  - Orte (Adressen, Gerichtsstände)
  - Daten (Ausstellungsdatum, Fristen)
  - Beträge (Forderungshöhe, Teilbeträge)
- ✅ Key-Phrase-Analyse für rechtlich relevante Begriffe
- ✅ Confidence Scoring (Zuverlässigkeit der Extraktion)
- ✅ Automatische Anomalie-Erkennung:
  - Ungewöhnlich hohe Beträge
  - Nahende Fristen (< 7 Tage)
  - Widersprüchliche Daten

**Implementierung:**
```typescript
// server/ai-services.ts
analyzeDocument(fileBuffer, mimeType, userId)
  → ExtractedDocumentData
```

**API Endpoint:**
```typescript
ai.analyzeDocument({ fileBuffer: base64, mimeType, caseId? })
```

---

### 2. **Intelligent Interview System** (Conversational AI)
**Zweck:** Strukturierte Datenerhebung mit adaptiven Fragen und psychologischem Profiling

**Features:**
- ✅ Dynamische Fragenauswahl basierend auf Dokumentenanalyse
- ✅ Adaptive Logik (Follow-up-Fragen je nach Antwort)
- ✅ Verschiedene Fragetypen:
  - Boolean (Ja/Nein)
  - Choice (Multiple Choice)
  - Scale (1-10 Bewertung)
  - Date (Datum)
  - Number (Zahlen)
  - Text (Freitext)
- ✅ Transparenz-Features:
  - Begründung für jede Frage ("Warum fragen wir das?")
  - Rechtliche Relevanz wird erklärt
- ✅ Progress Tracking mit Fortschrittsbalken

**Fragenkatalog (Beispiel):**
1. Betrag-Validierung (OCR-Check)
2. Zeitpunkt des Erhalts (Fristberechnung)
3. Wohnsituation (Beitragspflicht-Prüfung)
4. Auslandsaufenthalt (Follow-up bei "Nein")
5. Zahlungshistorie (Plausibilität)
6. Emotionale Belastung (Stress-Level 1-10)
7. Selbsteinschätzung Erfolgsaussichten (Konfidenz 1-10)
8. Verfügbare Nachweise (Beweismittel)

**Implementierung:**
```typescript
generateInterviewQuestions(extractedData, caseType)
  → InterviewQuestion[]

analyzeInterviewSession(session)
  → InterviewSession (mit Sentiment & Reality Perception)
```

---

### 3. **Sentiment & Reality Perception Analysis**
**Zweck:** Psychologische Einschätzung der Nutzer-Aussagen für optimale Beratung

**Sentiment Analysis:**
- ✅ Emotionaler Zustand:
  - `calm` - Ruhig, sachlich
  - `anxious` - Ängstlich, unsicher
  - `angry` - Wütend, frustriert
  - `confused` - Verwirrt, überfordert
  - `confident` - Selbstsicher, entschlossen
- ✅ Stress-Level (0-10)
- ✅ Kohärenz-Score (Widerspruchsfreiheit der Antworten)

**Reality Perception Check:**
- ✅ **Internal Consistency** (0-1):
  - Widersprechen sich Nutzer-Aussagen intern?
  - Beispiel: "Ich war im Ausland" + "Ich habe Beiträge gezahlt"
- ✅ **Evidence Alignment** (0-1):
  - Stimmen Aussagen mit hochgeladenen Dokumenten überein?
  - Beispiel: Behaupteter Betrag ≠ extrahierter Betrag
- ✅ **Temporal Coherence** (0-1):
  - Ergibt die zeitliche Abfolge Sinn?
  - Beispiel: Dokument erhalten nach angeblicher Frist

**Smart Suggestions:**
```typescript
if (internalConsistency < 0.7)
  → "Einige Angaben scheinen widersprüchlich"

if (evidenceAlignment < 0.6)
  → "Ihre Aussagen weichen von Dokumenten ab"

if (confidence > 8 && evidence < 0.5)
  → "Sie wirken sehr sicher, aber Beweislage ist schwach"
```

---

### 4. **Due Diligence Engine** (Smart Data Validation)
**Zweck:** Automatisierte Plausibilitätsprüfung und Risikobewertung

**Checks:**
1. **Frist-Check:**
   - ❌ FAIL: < 7 Tage bis Frist (dringend!)
   - ⚠️ WARNING: < 14 Tage
   - ✅ PASS: > 14 Tage

2. **Betragsprüfung:**
   - Plausibilität (Rundfunkbeitrag: 18,36€/Monat, max. ~600€)
   - Ungewöhnliche Beträge werden geflaggt

3. **Dokumenten-Authentizität:**
   - OCR-Konfidenz > 80% → PASS
   - < 80% → WARNING (möglicherweise Fälschung)

4. **Beweislage:**
   - > 70% → Starke Beweislage
   - 40-70% → Mittelmäßig
   - < 40% → Schwach (Empfehlung: Anwalt)

5. **Aussagenkonsistenz:**
   - > 80% → Konsistent
   - < 80% → Widersprüche gefunden

6. **Emotionale Bereitschaft:**
   - Stress-Level < 7 → PASS
   - >= 7 → WARNING (Anwalt empfohlen)

**Output:**
```typescript
{
  overallScore: 75,  // 0-100
  checks: [/* detailed checks */],
  recommendations: [/* prioritized actions */],
  legalAssessment: {
    successProbability: 0.72,  // 72%
    estimatedDuration: "2-4 Wochen",
    requiredDocuments: ["Bescheid", "Meldebescheinigung", ...],
    estimatedCost: { min: 0, max: 50, currency: "EUR" }
  }
}
```

---

### 5. **AI Recommendation Engine**
**Zweck:** Personalisierte Handlungsempfehlungen basierend auf Analyse

**Empfehlungstypen:**

#### A) **Widerspruch einlegen** (Erfolgswahrscheinlichkeit > 50%)
**Vorteile:**
- Keine Kosten
- Suspensiveffekt (Forderung ruht)
- Chance auf vollständige Aufhebung

**Nachteile:**
- Zeitaufwand
- Erfolg nicht garantiert
- Bei Ablehnung: Nächste Stufe ist Klage

**Nächste Schritte:**
1. Widerspruch mit Vorlage erstellen
2. Alle Nachweise beifügen
3. Einschreiben mit Rückschein versenden
4. Frist notieren

---

#### B) **Anwalt konsultieren** (Stress > 7 ODER Erfolg < 40% ODER Score < 60)
**Vorteile:**
- Professionelle Vertretung
- Höhere Erfolgschancen
- Kein eigener Zeitaufwand
- Ggf. Kostenübernahme durch Rechtsschutz

**Nachteile:**
- Kosten (200-800 EUR)
- Termin erforderlich
- Nicht bei Bagatellfällen empfohlen

---

#### C) **Vergleich vorschlagen** (Erfolg 30-70%)
**Vorteile:**
- Schnelle Lösung
- Planungssicherheit
- Keine Gerichtskosten
- Oft Kulanzregelungen möglich

**Nachteile:**
- Teilweise Zahlung wahrscheinlich
- Kein vollständiger Erfolg
- Präzedenzfall für künftige Fälle

---

## 🔧 Technische Implementation

### Backend (Node.js + TypeScript)

**Datei-Struktur:**
```
server/
├── ai-services.ts      # Core AI logic
├── ai-router.ts        # tRPC API endpoints
└── routers.ts          # Integration in main router
```

**API Endpoints:**
```typescript
ai.analyzeDocument()         // OCR + NLP
ai.startInterview()          // Interview starten
ai.submitResponse()          // Antwort einreichen
ai.completeInterview()       // Interview abschließen + Analyse
ai.getRecommendations()      // Empfehlungen für bestehenden Fall
```

---

### Frontend (React 19 + TypeScript)

**Komponente:**
```
client/src/pages/SmartCaseInterview.tsx
```

**User Flow:**
1. **Upload** → Dokument hochladen
2. **Analysis** → KI analysiert (OCR, NLP, Entitäten)
3. **Interview** → 8 adaptive Fragen
4. **Results** → Due Diligence Report + Empfehlungen

**UI Features:**
- ✅ Progress Bar (25% → 50% → 75% → 100%)
- ✅ Real-time Feedback (Warum fragen wir das?)
- ✅ Transparenz-Indikatoren (Rechtliche Relevanz)
- ✅ Adaptive Inputs (Boolean, Choice, Scale, Date, Text)
- ✅ Visual Report (Checks mit Icons, Scores, Details)

---

## 📊 Datenfluss

```
┌─────────────────┐
│ User Upload PDF │
└────────┬────────┘
         │
         v
┌─────────────────────┐
│ OCR + NLP Analysis  │  ← analyzeDocument()
│ - Text Extraction   │
│ - Entity Recognition│
│ - Confidence Scores │
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│ Generate Questions  │  ← generateInterviewQuestions()
│ - Adaptive Logic    │
│ - Contextual Qs     │
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│ User Answers 8 Qs   │
│ - Store Responses   │
│ - Track Progress    │
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│ Sentiment Analysis  │  ← analyzeInterviewSession()
│ - Emotional State   │
│ - Stress Level      │
│ - Coherence         │
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│ Reality Check       │
│ - Consistency       │
│ - Evidence Align    │
│ - Temporal Logic    │
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│ Due Diligence       │  ← performDueDiligence()
│ - 6 Checks          │
│ - Overall Score     │
│ - Legal Assessment  │
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│ Recommendations     │  ← generateRecommendations()
│ - Widerspruch       │
│ - Anwalt            │
│ - Vergleich         │
└─────────────────────┘
```

---

## 🚀 Deployment & Integration

### TODO: Production-Ready OCR Integration

Aktuell nutzt das System Mock-Daten. Für Production:

**Option A: Google Cloud Vision API**
```typescript
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();
const [result] = await client.documentTextDetection(fileBuffer);
const fullText = result.fullTextAnnotation?.text;
```

**Option B: AWS Textract**
```typescript
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";

const client = new TextractClient({ region: "eu-central-1" });
const command = new AnalyzeDocumentCommand({
  Document: { Bytes: fileBuffer },
  FeatureTypes: ["FORMS", "TABLES"]
});
const response = await client.send(command);
```

**Option C: Azure Computer Vision**
```typescript
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";

const client = new ComputerVisionClient(credentials, endpoint);
const result = await client.recognizePrintedText(true, fileBuffer);
```

---

## 🔐 Datenschutz & Sicherheit

- ✅ **DSGVO-konform**: Alle Uploads verschlüsselt gespeichert
- ✅ **No Logging**: Sensible Daten werden nicht geloggt
- ✅ **User-scoped**: Jeder User sieht nur eigene Daten
- ✅ **Encryption at Rest**: S3-Verschlüsselung für Dokumente
- ✅ **TLS/SSL**: Verschlüsselte Übertragung
- ✅ **Session-based Auth**: JWT mit httpOnly Cookies

---

## 📈 Metriken & Analytics

**Tracking (optional):**
```typescript
{
  interviewCompletionRate: 0.85,  // 85% schließen ab
  avgInterviewDuration: "4:23",   // 4 Min 23 Sek
  topDropoffQuestion: "q6_emotional_state",
  avgConfidenceScore: 6.8,
  mostCommonIssue: "Auslandsaufenthalt"
}
```

---

## 🎓 Beispiel-Szenario

**User:** Max Mustermann
**Upload:** Beitragsbescheid über 315€

### 1. Document Analysis
```json
{
  "documentType": "Beitragsbescheid",
  "amount": 315.00,
  "dueDate": "2025-01-28",
  "confidence": { "overall": 0.92 },
  "flags": []
}
```

### 2. Interview (8 Fragen)
- Q1: Betrag korrekt? → Ja
- Q2: Erhalten am? → 2024-12-15
- Q3: An Adresse gewohnt? → Nein, im Ausland
- Q4: Auslandszeitraum? → 2024-01-15 bis 2024-10-30
- Q5: Früher gezahlt? → Nein, noch nie
- Q6: Stress-Level? → 7/10
- Q7: Konfidenz unberechtigt? → 9/10
- Q8: Nachweise? → Auslandsbescheinigung

### 3. Analysis
```json
{
  "sentimentAnalysis": {
    "emotional_state": "confident",
    "stress_level": 7,
    "coherence_score": 0.92
  },
  "realityPerception": {
    "internal_consistency": 0.95,
    "evidence_alignment": 0.85,
    "temporal_coherence": 0.90
  }
}
```

### 4. Due Diligence
```json
{
  "overallScore": 82,
  "checks": [
    { "name": "Frist-Check", "status": "pass", "score": 100 },
    { "name": "Beweislage", "status": "pass", "score": 85 },
    { "name": "Aussagenkonsistenz", "status": "pass", "score": 95 }
  ],
  "legalAssessment": {
    "successProbability": 0.85,
    "estimatedCost": { "min": 0, "max": 50 }
  }
}
```

### 5. Empfehlung
**Top Recommendation:** Widerspruch einlegen (Confidence: 85%)
- Starke Beweislage (Auslandsbescheinigung)
- Hohe interne Konsistenz
- Ausreichend Zeit für Vorbereitung

---

## 📚 Weiterführende Ressourcen

- [Google Cloud Vision API Docs](https://cloud.google.com/vision/docs)
- [AWS Textract Docs](https://docs.aws.amazon.com/textract/)
- [Azure Computer Vision](https://learn.microsoft.com/azure/cognitive-services/computer-vision/)
- [Sentiment Analysis Best Practices](https://huggingface.co/docs/transformers/tasks/sequence_classification)

---

## 🤝 Kontakt & Support

Für Fragen zu den AI-Features:
- GitHub Issues: https://github.com/MrYueHang/gez-os/issues
- Email: support@gezy.org
