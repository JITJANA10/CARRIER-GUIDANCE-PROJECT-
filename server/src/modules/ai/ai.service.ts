// PATHPILOT — GEMINI AI MENTOR INTELLIGENCE ENGINE
// Directive: PP-AI-PHASE-A-EXEC-2026-01 & PP-AI-KEY-CONFIG-2026-02
// Standard: Strictly Google Gemini, server-side only, DB-grounded context, zero fabricated defaults

import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { logger } from '../../shared/utils/logger.js';
import { sanitizeGeminiError } from '../../config/gemini.js';

export interface SkillMetric {
  name: string;
  score: number;
}

export interface AIMessageContext {
  studentId?: string | null;
  studentName: string | null;
  targetCareer: string | null;
  currentPhase: string | null;
  hasSkillProfile: boolean;
  hasRoadmap: boolean;
  verifiedSkills: SkillMetric[];
  developingSkills: SkillMetric[];
  missingSkills: SkillMetric[];
}

export interface AIMessageResult {
  reply: string;
  suggestedFollowUps: string[];
  isFallback: boolean;
  model: string;
}

const GREETING_PATTERN = /^(hi|hello|hey|hey there|good morning|good afternoon|good evening|greetings|howdy|yo)([\s,!.]*(pathpilot|mentor|ai)?)?[\s!?.]*$/i;

function isCasualGreeting(message: string): boolean {
  return GREETING_PATTERN.test(message.trim());
}

function formatSkillMetrics(skills: SkillMetric[], emptyLabel: string): string {
  if (skills.length === 0) return emptyLabel;
  return skills.map((s) => `${s.name} (${s.score}/100)`).join(', ');
}

function normalizeContext(
  raw?: Partial<AIMessageContext> | string | null,
  legacyPhase?: string | number | null
): AIMessageContext {
  if (typeof raw === 'string') {
    const career = raw.trim() || null;
    const phaseLabel =
      legacyPhase !== undefined && legacyPhase !== null && String(legacyPhase).trim().length > 0
        ? `Phase ${String(legacyPhase).replace(/^phase[-\s]*/i, '')}`
        : null;

    return {
      studentId: null,
      studentName: null,
      targetCareer: career,
      currentPhase: phaseLabel,
      hasSkillProfile: false,
      hasRoadmap: Boolean(phaseLabel),
      verifiedSkills: [],
      developingSkills: [],
      missingSkills: []
    };
  }

  const verifiedSkills = Array.isArray(raw?.verifiedSkills) ? raw.verifiedSkills : [];
  const developingSkills = Array.isArray(raw?.developingSkills) ? raw.developingSkills : [];
  const missingSkills = Array.isArray(raw?.missingSkills) ? raw.missingSkills : [];
  const targetCareer = raw?.targetCareer?.trim() || null;
  const currentPhase = raw?.currentPhase?.trim() || null;

  return {
    studentId: raw?.studentId?.trim() || null,
    studentName: raw?.studentName?.trim() || null,
    targetCareer,
    currentPhase,
    hasSkillProfile: Boolean(raw?.hasSkillProfile),
    hasRoadmap: Boolean(raw?.hasRoadmap && currentPhase),
    verifiedSkills,
    developingSkills,
    missingSkills
  };
}

function buildSystemInstruction(ctx: AIMessageContext): string {
  const unassessedMsg = 'Unavailable (no skill assessment recorded)';

  return `You are PathPilot AI Mentor, a helpful, honest, and technically grounded career advisor.

Authoritative Student Database Profile:
- Authenticated Student ID: ${ctx.studentId ?? 'Unavailable'}
- Student Name: ${ctx.studentName ?? 'Unavailable (do not invent a name)'}
- Target Career Goal: ${ctx.targetCareer ?? 'Not set (null — do not assume or invent a career goal)'}
- Skill Profile Recorded: ${ctx.hasSkillProfile ? 'Yes (use exact scores below)' : 'No (unavailable)'}
- Verified / Mastered Skills (score >= 70): ${ctx.hasSkillProfile ? formatSkillMetrics(ctx.verifiedSkills, 'None recorded at >= 70') : unassessedMsg}
- Developing Skills (score 40-69): ${ctx.hasSkillProfile ? formatSkillMetrics(ctx.developingSkills, 'None recorded in 40-69') : unassessedMsg}
- Weaknesses / Needs Improvement (score < 40): ${ctx.hasSkillProfile ? formatSkillMetrics(ctx.missingSkills, 'None recorded below 40') : unassessedMsg}
- Roadmap Progress Recorded: ${ctx.hasRoadmap ? 'Yes' : 'No (student has not started a roadmap)'}
- Current Roadmap Phase: ${ctx.hasRoadmap && ctx.currentPhase ? ctx.currentPhase : 'Not started (null — do not assume or invent a phase)'}

Strict Rules:
1. Never invent a student name, career goal, skill score, proficiency, weakness, or roadmap phase.
2. Treat the Authoritative Student Database Profile above as the sole truth about this student.
3. Explicitly distinguish Verified (>= 70), Developing (40-69), and Needs Improvement (< 40) skills with their exact scores when Skill Profile Recorded is Yes.
4. When information is unavailable (Not set / No / null), acknowledge transparently that it is missing rather than guessing.
5. Ask concise clarifying questions when essential context (such as an unset career goal or missing skill profile) is needed to tailor advice.
6. Answer simple casual greetings warmly and naturally in 1-2 sentences without turning a greeting into an unsolicited career roadmap, study schedule, or skill lecture.
7. Do not force an unsolicited roadmap when answering a direct or conceptual question.
8. Keep all advice, examples, and learning plans directly aligned to the student's actual Target Career Goal (${ctx.targetCareer ?? 'ask the student to specify one first'}).`;
}

function buildSuggestedFollowUps(ctx: AIMessageContext, greeting: boolean): string[] {
  if (!ctx.targetCareer) {
    return [
      'Which career role are you currently working toward?',
      'Would you like help comparing career options before building a plan?'
    ];
  }

  if (greeting) {
    return [
      `What should I focus on next for ${ctx.targetCareer}?`,
      ctx.missingSkills.length > 0
        ? `How can I strengthen ${ctx.missingSkills[0].name} (${ctx.missingSkills[0].score}/100)?`
        : `What skills matter most for ${ctx.targetCareer}?`
    ];
  }

  const followUps: string[] = [];
  if (ctx.missingSkills.length > 0) {
    const weakest = ctx.missingSkills[0];
    followUps.push(`What hands-on exercises can raise ${weakest.name} from ${weakest.score}/100?`);
  } else if (ctx.developingSkills.length > 0) {
    const dev = ctx.developingSkills[0];
    followUps.push(`How do I advance ${dev.name} (${dev.score}/100) into a verified strength?`);
  } else if (!ctx.hasSkillProfile) {
    followUps.push('How should I benchmark my current skills before planning next steps?');
  }

  followUps.push(`What portfolio projects demonstrate readiness for ${ctx.targetCareer}?`);
  followUps.push(`What are the key interview topics for ${ctx.targetCareer}?`);
  return followUps.slice(0, 3);
}

class GeminiAIService {
  private client: GoogleGenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0) {
      try {
        this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY.trim() });
      } catch {
        logger.error('Failed to initialize GoogleGenAI client with provided key.');
      }
    }
  }

  public async generateMentorAdvice(
    studentMessage: string,
    rawContext?: Partial<AIMessageContext> | null
  ): Promise<AIMessageResult> {
    const ctx = normalizeContext(rawContext);
    const trimmedMessage = studentMessage.trim();

    if (!this.client || !env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim().length === 0) {
      return this.buildFallbackResponse(trimmedMessage, ctx);
    }

    const systemInstruction = buildSystemInstruction(ctx);
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error('TIMED_OUT')), env.GEMINI_TIMEOUT_MS);
      });

      const requestPromise = this.client.models.generateContent({
        model: env.GEMINI_MODEL,
        config: {
          systemInstruction
        },
        contents: [
          { role: 'user', parts: [{ text: trimmedMessage }] }
        ]
      });

      const response: any = await Promise.race([requestPromise, timeoutPromise]);
      clearTimeout(timeoutHandle);
      const replyText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!replyText || replyText.trim().length === 0) {
        throw new Error('Empty response from Gemini API.');
      }

      return {
        reply: replyText.trim(),
        suggestedFollowUps: buildSuggestedFollowUps(ctx, isCasualGreeting(trimmedMessage)),
        isFallback: false,
        model: env.GEMINI_MODEL
      };
    } catch (rawError: unknown) {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      const sanitized = sanitizeGeminiError(rawError);
      logger.warn(
        { errCode: sanitized.code, errMsg: sanitized.message },
        'Gemini API request failed or timed out. Falling back to local intelligence engine.'
      );

      return this.buildFallbackResponse(trimmedMessage, ctx);
    }
  }

  private buildFallbackResponse(
    message: string,
    contextOrCareer?: Partial<AIMessageContext> | string | null,
    legacyPhase?: string | number | null
  ): AIMessageResult {
    const ctx = normalizeContext(contextOrCareer, legacyPhase);
    const greeting = isCasualGreeting(message);
    const lower = message.toLowerCase();

    if (greeting) {
      const salutation = ctx.studentName ? `Hi ${ctx.studentName}!` : 'Hello!';
      const goalPrompt = ctx.targetCareer
        ? `How can I help with your ${ctx.targetCareer} goals today?`
        : "I don't see a target career set in your profile yet—what role or topic would you like to explore today?";

      return {
        reply: `${salutation} ${goalPrompt}`,
        suggestedFollowUps: buildSuggestedFollowUps(ctx, true),
        isFallback: true,
        model: 'pathpilot-intelligence-local'
      };
    }

    const lines: string[] = [];

    if (!ctx.targetCareer) {
      lines.push(
        "Your profile does not currently specify a **target career goal**, so I want to avoid guessing your target track. Which role are you preparing for?"
      );
    } else {
      const stageNote = ctx.hasRoadmap && ctx.currentPhase ? ` (currently in **${ctx.currentPhase}**)` : '';
      lines.push(`Guidance for your **${ctx.targetCareer}** goal${stageNote}:`);
    }

    if (ctx.hasSkillProfile) {
      const allSkills = [...ctx.missingSkills, ...ctx.developingSkills, ...ctx.verifiedSkills];
      const mentionedSkills = allSkills.filter((s) => lower.includes(s.name.toLowerCase()));

      if (mentionedSkills.length > 0) {
        for (const skill of mentionedSkills) {
          if (skill.score < 40) {
            lines.push(
              `- **${skill.name} (${skill.score}/100 — Needs Improvement):** Your recorded score shows this is currently a primary weakness. Prioritize hands-on fundamentals and short daily practice problems before moving to advanced topics.`
            );
          } else if (skill.score < 70) {
            lines.push(
              `- **${skill.name} (${skill.score}/100 — Developing):** You have a baseline foundation. Bridge this gap through applied exercises and portfolio deliverables.`
            );
          } else {
            lines.push(
              `- **${skill.name} (${skill.score}/100 — Verified Strength):** Your recorded score shows strong proficiency; focus on real-world scenarios, edge cases, and interview articulation.`
            );
          }
        }
      }

      if (ctx.missingSkills.length > 0) {
        lines.push(`- **Recorded Skill Gaps (< 40):** ${formatSkillMetrics(ctx.missingSkills, '')}`);
      }
      if (ctx.developingSkills.length > 0) {
        lines.push(`- **Developing Skills (40–69):** ${formatSkillMetrics(ctx.developingSkills, '')}`);
      }
      if (ctx.verifiedSkills.length > 0) {
        lines.push(`- **Verified Strengths (>= 70):** ${formatSkillMetrics(ctx.verifiedSkills, '')}`);
      }
    } else {
      lines.push(
        '- **Skill Profile:** No skill assessment scores are currently recorded in your profile, so I cannot identify verified strengths or skill gaps yet. What is your current comfort level with the core skills for this topic?'
      );
    }

    if (!ctx.hasRoadmap) {
      lines.push(
        '- **Roadmap Progress:** No active roadmap progression is recorded for this career yet.'
      );
    }

    return {
      reply: lines.join('\n'),
      suggestedFollowUps: buildSuggestedFollowUps(ctx, false),
      isFallback: true,
      model: 'pathpilot-intelligence-local'
    };
  }
}

export const geminiAIService = new GeminiAIService();
