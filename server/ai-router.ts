/**
 * tRPC Router for AI Services
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import {
  analyzeDocument,
  generateInterviewQuestions,
  analyzeInterviewSession,
  performDueDiligence,
  generateRecommendations,
  type InterviewSession,
  type InterviewResponse,
} from "./ai-services";
import {
  generatePersonalizedDocument,
  collectFeedback,
  reviseDocument,
  type DocumentFeedback,
} from "./ai-document-generator";
import { getDb } from "./db";
import { cases } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const aiRouter = router({
  /**
   * Analyze uploaded document with OCR and NLP
   */
  analyzeDocument: protectedProcedure
    .input(z.object({
      fileBuffer: z.string(), // Base64 encoded
      mimeType: z.string(),
      caseId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.fileBuffer, 'base64');

      const extractedData = await analyzeDocument(
        buffer,
        input.mimeType,
        ctx.user.id
      );

      return extractedData;
    }),

  /**
   * Start intelligent interview session
   */
  startInterview: protectedProcedure
    .input(z.object({
      caseId: z.number(),
      extractedData: z.any(), // ExtractedDocumentData from analyzeDocument
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Get case details
      const caseData = await db.select()
        .from(cases)
        .where(eq(cases.id, input.caseId))
        .limit(1);

      if (!caseData.length || caseData[0].userId !== ctx.user.id) {
        throw new Error('Case not found or access denied');
      }

      // Generate questions
      const questions = generateInterviewQuestions(
        input.extractedData,
        caseData[0].caseType
      );

      // Create session
      const session: InterviewSession = {
        sessionId: `session_${Date.now()}_${ctx.user.id}`,
        userId: ctx.user.id,
        caseId: input.caseId,
        currentQuestionIndex: 0,
        responses: [],
        sentimentAnalysis: {
          emotional_state: 'calm',
          stress_level: 5,
          coherence_score: 1.0
        },
        realityPerception: {
          internal_consistency: 1.0,
          evidence_alignment: 0.5,
          temporal_coherence: 1.0,
          suggestions: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        session,
        questions,
        currentQuestion: questions[0]
      };
    }),

  /**
   * Submit interview response
   */
  submitResponse: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      questionId: z.string(),
      answer: z.any(),
      confidence: z.number().min(0).max(10).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Store session in database or cache
      // For now, return mock response

      const response: InterviewResponse = {
        questionId: input.questionId,
        answer: input.answer,
        timestamp: new Date(),
        confidence: input.confidence
      };

      return {
        success: true,
        response,
        nextQuestionId: getNextQuestionId(input.questionId, input.answer)
      };
    }),

  /**
   * Complete interview and get analysis
   */
  completeInterview: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      caseId: z.number(),
      responses: z.array(z.object({
        questionId: z.string(),
        answer: z.any(),
        timestamp: z.date(),
        confidence: z.number().optional()
      })),
      extractedData: z.any(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Build complete session
      const session: InterviewSession = {
        sessionId: input.sessionId,
        userId: ctx.user.id,
        caseId: input.caseId,
        currentQuestionIndex: input.responses.length,
        responses: input.responses,
        sentimentAnalysis: {
          emotional_state: 'calm',
          stress_level: 5,
          coherence_score: 0.85
        },
        realityPerception: {
          internal_consistency: 0.85,
          evidence_alignment: 0.75,
          temporal_coherence: 0.80,
          suggestions: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Analyze session
      const analyzedSession = analyzeInterviewSession(session);

      // Perform due diligence
      const dueDiligenceReport = await performDueDiligence(
        input.extractedData,
        analyzedSession,
        ctx.user.id
      );

      // Generate recommendations
      const recommendations = generateRecommendations(
        dueDiligenceReport,
        analyzedSession
      );

      return {
        session: analyzedSession,
        dueDiligence: dueDiligenceReport,
        recommendations
      };
    }),

  /**
   * Get AI recommendations for existing case
   */
  getRecommendations: protectedProcedure
    .input(z.object({
      caseId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      // Get case
      const caseData = await db.select()
        .from(cases)
        .where(eq(cases.id, input.caseId))
        .limit(1);

      if (!caseData.length || caseData[0].userId !== ctx.user.id) {
        throw new Error('Case not found or access denied');
      }

      // TODO: Load actual interview session and extracted data from database
      // For now, return mock recommendations

      const mockSession: InterviewSession = {
        sessionId: 'mock',
        userId: ctx.user.id,
        caseId: input.caseId,
        currentQuestionIndex: 8,
        responses: [],
        sentimentAnalysis: {
          emotional_state: 'calm',
          stress_level: 6,
          coherence_score: 0.80
        },
        realityPerception: {
          internal_consistency: 0.85,
          evidence_alignment: 0.70,
          temporal_coherence: 0.75,
          suggestions: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockExtractedData = {
        documentType: "Beitragsbescheid",
        issuer: "ARD ZDF Deutschlandradio",
        amount: 315,
        currency: "EUR",
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        entities: { persons: [], organizations: [], locations: [], dates: [], amounts: [] },
        fullText: "",
        keyPhrases: [],
        confidence: { overall: 0.90, documentType: 0.95, amountExtraction: 0.98, dateExtraction: 0.89 },
        flags: []
      };

      const dueDiligence = await performDueDiligence(
        mockExtractedData,
        mockSession,
        ctx.user.id
      );

      const recommendations = generateRecommendations(dueDiligence, mockSession);

      return {
        dueDiligence,
        recommendations
      };
    }),

  /**
   * Generate personalized legal document (Widerspruch, Klage, etc.)
   */
  generateDocument: protectedProcedure
    .input(z.object({
      extractedData: z.any(),
      interviewSession: z.any(),
      dueDiligence: z.any(),
      documentType: z.enum(['widerspruch', 'klage', 'anfrage']),
      userApiKey: z.object({
        provider: z.enum(['gemini', 'openai', 'anthropic']),
        key: z.string()
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get user profile with tier info
      // TODO: Fetch from database
      const userProfile = {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email || '',
        address: undefined,
        tier: 'pro' as const, // TODO: Get from subscription table
        apiKey: input.userApiKey
      };

      const document = await generatePersonalizedDocument(
        input.extractedData,
        input.interviewSession,
        input.dueDiligence,
        userProfile,
        input.documentType
      );

      // TODO: Save to database

      return document;
    }),

  /**
   * Revise document based on user feedback
   */
  reviseDocument: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      userFeedback: z.string(),
      originalDocument: z.any(),
      context: z.any(),
    }))
    .mutation(async ({ input, ctx }) => {
      const revised = await reviseDocument(
        input.originalDocument,
        input.userFeedback,
        input.context
      );

      // TODO: Save revision to database

      return revised;
    }),

  /**
   * Submit feedback on generated document
   */
  submitFeedback: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      rating: z.number().min(1).max(5),
      wasHelpful: z.boolean(),
      wasUsed: z.boolean(),
      outcome: z.enum(['success', 'partial', 'rejected', 'pending']).optional(),
      improvementSuggestions: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const feedback: Omit<DocumentFeedback, 'createdAt'> = {
        ...input,
        userId: ctx.user.id,
      };

      await collectFeedback(feedback);

      return { success: true };
    }),
});

function getNextQuestionId(currentQuestionId: string, answer: any): string | null {
  // Follow-up logic
  if (currentQuestionId === 'q3_living_situation' &&
      typeof answer === 'string' &&
      answer.includes('Ausland')) {
    return 'q4_abroad_period';
  }

  // Default: next sequential question
  const match = currentQuestionId.match(/\d+/);
  const currentNum = match ? parseInt(match[0]) : 0;
  const nextNum = currentNum + 1;

  if (nextNum <= 8) {
    return `q${nextNum}_`;
  }

  return null; // Interview complete
}
