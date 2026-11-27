// PATHPILOT — GEMINI AI MENTOR CONTROLLER
// Directive: PP-AI-PHASE-A-EXEC-2026-01

import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { geminiAIService, type AIMessageContext, type SkillMetric } from './ai.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { UnauthorizedError, ValidationError } from '../../shared/errors/AppError.js';
import { enrichRoadmapPhases, resolveCareerMeta } from '../careers/careerCatalog.js';
import { resolveMergedStudentSkills } from '../student/student.service.js';

function slugifyCareer(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function partitionSkillBuckets(
  studentSkills: Array<{
    skillKey: string;
    name: string;
    score: number;
    classification: string;
    careerSlug: string | null;
    updatedAt: Date;
  }>,
  skillProfile?: { skillsJson: string; updatedAt: Date } | null
): {
  hasSkillProfile: boolean;
  verifiedSkills: SkillMetric[];
  developingSkills: SkillMetric[];
  missingSkills: SkillMetric[];
} {
  const { records } = resolveMergedStudentSkills(studentSkills, skillProfile);
  if (records.length === 0) {
    return { hasSkillProfile: false, verifiedSkills: [], developingSkills: [], missingSkills: [] };
  }

  const verifiedSkills: SkillMetric[] = [];
  const developingSkills: SkillMetric[] = [];
  const missingSkills: SkillMetric[] = [];

  for (const rec of records) {
    if (rec.classification === 'VERIFIED') {
      verifiedSkills.push({ name: rec.name, score: rec.score });
    } else if (rec.classification === 'DEVELOPING') {
      developingSkills.push({ name: rec.name, score: rec.score });
    } else {
      missingSkills.push({ name: rec.name, score: rec.score });
    }
  }

  verifiedSkills.sort((a, b) => b.score - a.score);
  developingSkills.sort((a, b) => b.score - a.score);
  missingSkills.sort((a, b) => a.score - b.score);

  return {
    hasSkillProfile: true,
    verifiedSkills,
    developingSkills,
    missingSkills
  };
}

function matchesCareerTitle(targetCareer: string, careerTitle: string, careerSlug: string): boolean {
  const normTarget = targetCareer.trim().toLowerCase();
  const normTitle = careerTitle.trim().toLowerCase();
  if (normTarget === normTitle || normTarget === careerSlug.toLowerCase()) {
    return true;
  }

  const targetSlug = slugifyCareer(targetCareer);
  if (targetSlug === careerSlug.toLowerCase()) {
    return true;
  }

  // Match shortened goal names against canonical seeded titles (e.g. "Data Analyst" -> "Data Analyst / BI Engineer")
  const primarySegment = normTitle.split('/')[0].trim();
  return primarySegment.length > 0 && (primarySegment === normTarget || targetSlug === slugifyCareer(primarySegment));
}

function doesProgressMatchCareerSlug(
  progressSlug: string,
  targetCareer: string,
  matchedCareerSlug: string | null
): boolean {
  const normProgress = progressSlug.trim().toLowerCase();
  if (matchedCareerSlug && normProgress === matchedCareerSlug.toLowerCase()) {
    return true;
  }

  const targetSlug = slugifyCareer(targetCareer);
  if (normProgress === targetSlug) {
    return true;
  }

  // Handle canonical abbreviations like "ai-ml-engineer" <-> "AI / Machine Learning Engineer"
  const progressTokens = normProgress.split('-').filter(Boolean);
  const targetTokens = targetSlug.split('-').filter(Boolean);
  const matchesWithAbbrev = progressTokens.every(
    (tok) =>
      targetTokens.includes(tok) ||
      (tok === 'ml' && targetTokens.includes('machine') && targetTokens.includes('learning'))
  );
  return progressTokens.length > 0 && matchesWithAbbrev;
}

function formatPhaseLabel(careerSlugOrTitle: string, phaseId: string, phasesJson?: string): string | null {
  const trimmed = phaseId.trim();
  if (!trimmed) return null;

  const phaseNumMatch = trimmed.match(/phase-(\d+)/i);
  const baseLabel = phaseNumMatch ? `Phase ${Number(phaseNumMatch[1])}` : trimmed;

  const enrichedPhases = enrichRoadmapPhases(careerSlugOrTitle, phasesJson);
  const matched = enrichedPhases.find((p) => p.id.toLowerCase() === trimmed.toLowerCase());
  if (matched?.title) {
    return `${baseLabel}: ${matched.title}`;
  }

  return baseLabel;
}

async function resolveRoadmapContext(
  targetCareer: string | null,
  progressRows: Array<{ careerSlug: string; currentPhaseId: string }>
): Promise<{ hasRoadmap: boolean; currentPhase: string | null }> {
  if (!targetCareer || progressRows.length === 0) {
    return { hasRoadmap: false, currentPhase: null };
  }

  const careers = await prisma.career.findMany({
    include: {
      templates: {
        where: { isActive: true },
        take: 1
      }
    }
  });

  const targetMeta = resolveCareerMeta(targetCareer);
  const matchedCareer = careers.find(
    (c) => matchesCareerTitle(targetCareer, c.title, c.slug) || (targetMeta && c.slug === targetMeta.slug)
  ) || null;

  const matchedProgress = progressRows.find((p) =>
    doesProgressMatchCareerSlug(p.careerSlug, targetCareer, matchedCareer?.slug || targetMeta?.slug || null)
  );

  if (!matchedProgress) {
    return { hasRoadmap: false, currentPhase: null };
  }

  const phasesJson = matchedCareer?.templates[0]?.phasesJson;
  const currentPhase = formatPhaseLabel(
    matchedCareer?.slug || targetMeta?.slug || targetCareer,
    matchedProgress.currentPhaseId,
    phasesJson
  );

  return {
    hasRoadmap: Boolean(currentPhase),
    currentPhase
  };
}

export async function askAIMentor(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError('Authentication required to access PathPilot AI Mentor.');
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new ValidationError('A non-empty message is required to consult the AI Mentor.', [
      { field: 'message', issue: 'Message cannot be empty' }
    ]);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      skillProfile: true,
      studentSkills: true,
      progress: {
        orderBy: { updatedAt: 'desc' }
      }
    }
  });

  if (!user) {
    throw new UnauthorizedError('Authenticated user record not found.', 'USER_NOT_FOUND');
  }

  const firstName = user.profile?.firstName?.trim() || '';
  const lastName = user.profile?.lastName?.trim() || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;

  const rawGoal = user.profile?.targetGoal?.trim() || '';
  const targetCareer = rawGoal.length > 0 ? rawGoal : null;

  const skillBuckets = partitionSkillBuckets(user.studentSkills, user.skillProfile);
  const roadmapState = await resolveRoadmapContext(targetCareer, user.progress);

  const context: AIMessageContext = {
    studentId: user.id,
    studentName: fullName,
    targetCareer,
    currentPhase: roadmapState.currentPhase,
    hasSkillProfile: skillBuckets.hasSkillProfile,
    hasRoadmap: roadmapState.hasRoadmap,
    verifiedSkills: skillBuckets.verifiedSkills,
    developingSkills: skillBuckets.developingSkills,
    missingSkills: skillBuckets.missingSkills
  };

  const result = await geminiAIService.generateMentorAdvice(message.trim(), context);

  sendSuccess(res, result);
}
