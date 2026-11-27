// PATHPILOT — AUTHORITATIVE STUDENT DATA SYNCHRONIZATION SERVICE
// Directive: PP-PHASE-B-DATA-SYNC
// Single source of truth across Profile, Career Goal, Skills, Gaps, and Roadmaps.

import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError.js';
import {
  CAREER_CATALOG,
  enrichRoadmapPhases,
  resolveCareerMeta,
  type RoadmapPhaseSpec
} from '../careers/careerCatalog.js';

export type SkillClassification = 'VERIFIED' | 'DEVELOPING' | 'WEAK';

export interface StudentSkillRecord {
  skillKey: string;
  name: string;
  score: number;
  classification: SkillClassification;
  careerSlug: string | null;
  updatedAt: string;
}

export interface StudentSkillGapItem {
  skill: string;
  skillKey: string;
  requiredScore: number;
  currentScore: number | null;
  classification: SkillClassification | 'UNASSESSED';
  gap: number | null;
  priority: 'Critical' | 'High' | 'Medium' | 'None';
  reason: string;
  time: string;
  resource: string;
  project: string;
  category: 'Technical' | 'Product' | 'Leadership';
}

export interface SkillGapSummary {
  careerSlug: string | null;
  targetCareer: string | null;
  readinessPercent: number | null;
  assessedCount: number;
  totalRequiredCount: number;
  criticalCount: number;
  highCount: number;
  items: StudentSkillGapItem[];
}

export interface StudentRoadmapPhaseView extends RoadmapPhaseSpec {
  status: 'completed' | 'active' | 'locked';
  completedTaskIds: string[];
}

export interface StudentRoadmapState {
  careerSlug: string;
  careerTitle: string;
  hasStarted: boolean;
  currentPhaseId: string;
  completedPhases: string[];
  completedTasks: string[];
  totalTasks: number;
  progressPercent: number;
  updatedAt: string | null;
  phases: StudentRoadmapPhaseView[];
}

export interface RoadmapSummaryItem {
  careerSlug: string;
  currentPhaseId: string;
  completedPhases: string[];
  completedTasks: string[];
  updatedAt: string;
}

export interface StudentProfileDTO {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  targetGoal: string | null;
  careerSlug: string | null;
  educationLevel: string | null;
  onboardingCompleted: boolean;
  streakDays: number;
  weeklyTargetHours: number;
  completedHoursThisWeek: number;
  interests: string[];
  strengths: string[];
  savedCareers: string[];
  updatedAt: string;
}

export interface StudentStatePayload {
  profile: StudentProfileDTO;
  skills: StudentSkillRecord[];
  skillMap: Record<string, number>;
  skillGaps: SkillGapSummary;
  activeRoadmap: StudentRoadmapState | null;
  roadmapsByCareer: RoadmapSummaryItem[];
}

export function classifySkillScore(score: number): SkillClassification {
  if (score >= 70) return 'VERIFIED';
  if (score >= 40) return 'DEVELOPING';
  return 'WEAK';
}

export function normalizeSkillKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function safeParseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function safeParseSkillJsonMap(raw: string | null | undefined): Record<string, number> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const result: Record<string, number> = {};
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      const cleanName = key.trim();
      if (cleanName && typeof val === 'number' && Number.isFinite(val)) {
        result[cleanName] = Math.max(0, Math.min(100, Math.round(val)));
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function resolveMergedStudentSkills(
  studentSkillRows: Array<{
    skillKey: string;
    name: string;
    score: number;
    classification: string;
    careerSlug: string | null;
    updatedAt: Date;
  }> = [],
  legacySkillProfile?: { skillsJson: string; updatedAt: Date } | null
): {
  records: StudentSkillRecord[];
  skillMap: Record<string, number>;
} {
  const byKey = new Map<string, StudentSkillRecord>();

  // Legacy Record<string, number> preserved cleanly for pre-seeded accounts & Phase A compatibility
  if (legacySkillProfile) {
    const legacyMap = safeParseSkillJsonMap(legacySkillProfile.skillsJson);
    const fallbackTimestamp = legacySkillProfile.updatedAt.toISOString();
    for (const [name, score] of Object.entries(legacyMap)) {
      const skillKey = normalizeSkillKey(name);
      byKey.set(skillKey, {
        skillKey,
        name,
        score,
        classification: classifySkillScore(score),
        careerSlug: null,
        updatedAt: fallbackTimestamp
      });
    }
  }

  // Normalized StudentSkill rows take precedence (carry career association & exact updatedAt)
  for (const row of studentSkillRows) {
    const score = Math.max(0, Math.min(100, Math.round(row.score)));
    const skillKey = normalizeSkillKey(row.skillKey || row.name);
    byKey.set(skillKey, {
      skillKey,
      name: row.name.trim(),
      score,
      classification: classifySkillScore(score),
      careerSlug: row.careerSlug || null,
      updatedAt: row.updatedAt.toISOString()
    });
  }

  const records = Array.from(byKey.values()).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const skillMap: Record<string, number> = {};
  for (const rec of records) {
    skillMap[rec.name] = rec.score;
  }

  return { records, skillMap };
}

export function calculateSkillGaps(
  targetCareer: string | null,
  skills: StudentSkillRecord[]
): SkillGapSummary {
  const meta = resolveCareerMeta(targetCareer);
  if (!targetCareer || !meta) {
    return {
      careerSlug: null,
      targetCareer: targetCareer || null,
      readinessPercent: null,
      assessedCount: 0,
      totalRequiredCount: 0,
      criticalCount: 0,
      highCount: 0,
      items: []
    };
  }

  const skillByKey = new Map<string, StudentSkillRecord>();
  for (const s of skills) {
    skillByKey.set(normalizeSkillKey(s.name), s);
  }

  let assessedCount = 0;
  let scoreWeightSum = 0;
  let requiredWeightSum = 0;

  const items: StudentSkillGapItem[] = meta.skillRequirements.map((req) => {
    const matched = skillByKey.get(normalizeSkillKey(req.name));
    requiredWeightSum += req.requiredScore;

    if (!matched) {
      return {
        skill: req.name,
        skillKey: normalizeSkillKey(req.name),
        requiredScore: req.requiredScore,
        currentScore: null,
        classification: 'UNASSESSED',
        gap: null,
        priority: 'High',
        reason: `No recorded proficiency yet for ${req.name}. Assess or record your current level to quantify the gap against the ${req.requiredScore}% benchmark.`,
        time: req.time,
        resource: req.resource,
        project: req.project,
        category: req.category
      };
    }

    assessedCount += 1;
    scoreWeightSum += Math.min(matched.score, req.requiredScore);
    const gap = Math.max(0, req.requiredScore - matched.score);
    const priority: StudentSkillGapItem['priority'] =
      gap >= 25 ? 'Critical' : gap >= 15 ? 'High' : gap > 0 ? 'Medium' : 'None';

    const reason =
      gap === 0
        ? `Meets target benchmark (${matched.score}/100 >= ${req.requiredScore}/100).`
        : `${matched.classification} at ${matched.score}/100; requires +${gap} pts to reach ${req.requiredScore}/100 for ${meta.title}.`;

    return {
      skill: req.name,
      skillKey: matched.skillKey,
      requiredScore: req.requiredScore,
      currentScore: matched.score,
      classification: matched.classification,
      gap,
      priority,
      reason,
      time: req.time,
      resource: req.resource,
      project: req.project,
      category: req.category
    };
  });

  // Sort: assessed gaps descending by magnitude, then unassessed high-priority requirements
  items.sort((a, b) => {
    const gapA = a.gap ?? a.requiredScore;
    const gapB = b.gap ?? b.requiredScore;
    return gapB - gapA;
  });

  const criticalCount = items.filter((i) => i.priority === 'Critical').length;
  const highCount = items.filter((i) => i.priority === 'High').length;
  const readinessPercent =
    requiredWeightSum > 0 ? Math.min(100, Math.round((scoreWeightSum / requiredWeightSum) * 100)) : 0;

  return {
    careerSlug: meta.slug,
    targetCareer: meta.title,
    readinessPercent,
    assessedCount,
    totalRequiredCount: items.length,
    criticalCount,
    highCount,
    items
  };
}

export function resolveStudentRoadmapState(
  careerInput: string | null,
  progressRows: Array<{
    careerSlug: string;
    currentPhaseId: string;
    completedPhases?: string;
    completedTasks: string;
    updatedAt: Date;
  }>,
  careersWithTemplates: Array<{
    slug: string;
    title: string;
    templates: Array<{ phasesJson: string }>;
  }>
): StudentRoadmapState | null {
  const meta = resolveCareerMeta(careerInput);
  if (!meta) return null;

  const dbCareer = careersWithTemplates.find(
    (c) => c.slug.toLowerCase() === meta.slug || resolveCareerMeta(c.title)?.slug === meta.slug
  );
  const templatePhases = enrichRoadmapPhases(meta.slug, dbCareer?.templates[0]?.phasesJson);
  const matchingProgress = progressRows.find(
    (p) => p.careerSlug.toLowerCase() === meta.slug || resolveCareerMeta(p.careerSlug)?.slug === meta.slug
  );

  const validTaskIds = new Set(templatePhases.flatMap((p) => p.tasks.map((t) => t.id)));
  const rawCompletedTasks = matchingProgress ? safeParseJsonArray(matchingProgress.completedTasks) : [];
  const completedTasks = Array.from(new Set(rawCompletedTasks.filter((id) => validTaskIds.has(id))));

  const rawCompletedPhases = matchingProgress ? safeParseJsonArray(matchingProgress.completedPhases) : [];
  const completedPhaseSet = new Set(rawCompletedPhases);

  // Derive completed phases automatically if all phase tasks are checked off
  for (const phase of templatePhases) {
    if (phase.tasks.length > 0 && phase.tasks.every((t) => completedTasks.includes(t.id))) {
      completedPhaseSet.add(phase.id);
    }
  }

  const completedPhases = templatePhases.map((p) => p.id).filter((id) => completedPhaseSet.has(id));

  let resolvedCurrentPhaseId = matchingProgress?.currentPhaseId || templatePhases[0]?.id || 'phase-1';
  if (!templatePhases.some((p) => p.id === resolvedCurrentPhaseId)) {
    resolvedCurrentPhaseId = templatePhases[0]?.id || 'phase-1';
  }
  // Advance pointer to first non-completed phase when current phase is already marked complete
  if (completedPhaseSet.has(resolvedCurrentPhaseId)) {
    const nextIncomplete = templatePhases.find((p) => !completedPhaseSet.has(p.id));
    if (nextIncomplete) {
      resolvedCurrentPhaseId = nextIncomplete.id;
    }
  }

  let activeAssigned = false;
  const phases: StudentRoadmapPhaseView[] = templatePhases.map((phase) => {
    const completedTaskIds = phase.tasks.map((t) => t.id).filter((id) => completedTasks.includes(id));
    let status: 'completed' | 'active' | 'locked';

    if (completedPhaseSet.has(phase.id)) {
      status = 'completed';
    } else if (!activeAssigned && phase.id === resolvedCurrentPhaseId) {
      status = 'active';
      activeAssigned = true;
    } else if (!activeAssigned && completedPhases.length === templatePhases.length) {
      status = 'completed';
    } else {
      status = 'locked';
    }

    return {
      ...phase,
      status,
      completedTaskIds
    };
  });

  // Fallback: ensure first incomplete phase is active if stored currentPhaseId fell behind or skipped
  if (!activeAssigned) {
    const firstIncompleteIdx = phases.findIndex((p) => p.status !== 'completed');
    if (firstIncompleteIdx >= 0) {
      phases[firstIncompleteIdx].status = 'active';
      resolvedCurrentPhaseId = phases[firstIncompleteIdx].id;
    }
  }

  const totalTasks = templatePhases.reduce((sum, p) => sum + p.tasks.length, 0);
  const progressPercent = totalTasks > 0 ? Math.min(100, Math.round((completedTasks.length / totalTasks) * 100)) : 0;

  return {
    careerSlug: meta.slug,
    careerTitle: dbCareer?.title || meta.title,
    hasStarted: Boolean(matchingProgress),
    currentPhaseId: resolvedCurrentPhaseId,
    completedPhases,
    completedTasks,
    totalTasks,
    progressPercent,
    updatedAt: matchingProgress?.updatedAt.toISOString() || null,
    phases
  };
}

async function ensureRoadmapProgressRow(
  tx: Prisma.TransactionClient,
  userId: string,
  careerSlug: string
): Promise<void> {
  const existing = await tx.roadmapProgress.findUnique({
    where: { userId_careerSlug: { userId, careerSlug } }
  });
  if (!existing) {
    await tx.roadmapProgress.create({
      data: {
        userId,
        careerSlug,
        currentPhaseId: 'phase-1',
        completedPhases: '[]',
        completedTasks: '[]'
      }
    });
  }
}

export async function syncCareerGoalInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  rawCareer: string | null
): Promise<{ canonicalGoal: string | null; careerSlug: string | null }> {
  if (rawCareer === null || rawCareer.trim().length === 0) {
    await tx.profile.update({
      where: { userId },
      data: { targetGoal: null }
    });
    return { canonicalGoal: null, careerSlug: null };
  }

  const meta = resolveCareerMeta(rawCareer);
  if (!meta) {
    throw new ValidationError(
      `Unsupported target career '${rawCareer}'. Must match one of the ${CAREER_CATALOG.length} canonical PathPilot careers.`,
      [{ field: 'targetCareer', issue: 'Invalid career selection' }]
    );
  }

  await tx.profile.update({
    where: { userId },
    data: { targetGoal: meta.title }
  });

  // Preserve any existing historical RoadmapProgress for other careers;
  // lazily initialize only if switching to a career with zero prior progress.
  await ensureRoadmapProgressRow(tx, userId, meta.slug);

  return { canonicalGoal: meta.title, careerSlug: meta.slug };
}

export async function getStudentStatePayload(userId: string): Promise<StudentStatePayload> {
  const [user, careers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skillProfile: true,
        studentSkills: true,
        progress: { orderBy: { updatedAt: 'desc' } }
      }
    }),
    prisma.career.findMany({
      include: {
        templates: {
          where: { isActive: true },
          take: 1
        }
      }
    })
  ]);

  if (!user) {
    throw new NotFoundError('Authenticated student account not found.');
  }

  const profileRow =
    user.profile ||
    (await prisma.profile.create({
      data: {
        userId: user.id,
        firstName: user.email.split('@')[0] || 'Student',
        lastName: ''
      }
    }));

  const targetGoalRaw = profileRow.targetGoal?.trim() || null;
  const resolvedMeta = resolveCareerMeta(targetGoalRaw);
  const targetGoal = resolvedMeta ? resolvedMeta.title : targetGoalRaw;
  const careerSlug = resolvedMeta?.slug || null;

  const { records: skills, skillMap } = resolveMergedStudentSkills(user.studentSkills, user.skillProfile);
  const skillGaps = calculateSkillGaps(targetGoal, skills);
  const activeRoadmap = resolveStudentRoadmapState(targetGoal, user.progress, careers);

  const profile: StudentProfileDTO = {
    id: profileRow.id,
    userId: user.id,
    email: user.email,
    firstName: profileRow.firstName,
    lastName: profileRow.lastName,
    name: `${profileRow.firstName} ${profileRow.lastName}`.trim() || user.email,
    targetGoal,
    careerSlug,
    educationLevel: profileRow.educationLevel,
    onboardingCompleted: profileRow.onboardingCompleted,
    streakDays: profileRow.streakDays,
    weeklyTargetHours: profileRow.weeklyTargetHours,
    completedHoursThisWeek: profileRow.completedHoursThisWeek,
    interests: safeParseJsonArray(profileRow.interestsJson),
    strengths: safeParseJsonArray(profileRow.strengthsJson),
    savedCareers: safeParseJsonArray(profileRow.savedCareersJson),
    updatedAt: profileRow.updatedAt.toISOString()
  };

  const roadmapsByCareer: RoadmapSummaryItem[] = user.progress.map((p) => ({
    careerSlug: p.careerSlug,
    currentPhaseId: p.currentPhaseId,
    completedPhases: safeParseJsonArray(p.completedPhases),
    completedTasks: safeParseJsonArray(p.completedTasks),
    updatedAt: p.updatedAt.toISOString()
  }));

  return {
    profile,
    skills,
    skillMap,
    skillGaps,
    activeRoadmap,
    roadmapsByCareer
  };
}

export interface ProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  educationLevel?: string | null;
  onboardingCompleted?: boolean;
  streakDays?: number;
  weeklyTargetHours?: number;
  completedHoursThisWeek?: number;
  interests?: string[];
  strengths?: string[];
  savedCareers?: string[];
  targetGoal?: string | null;
}

export async function updateStudentProfileData(
  userId: string,
  input: ProfileUpdateInput
): Promise<StudentStatePayload> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.profile.findUnique({ where: { userId } });
    if (!existing) {
      throw new NotFoundError('Student profile not found.');
    }

    const data: Prisma.ProfileUpdateInput = {};
    if (input.firstName !== undefined) data.firstName = input.firstName.trim();
    if (input.lastName !== undefined) data.lastName = input.lastName.trim();
    if (input.educationLevel !== undefined) data.educationLevel = input.educationLevel ? input.educationLevel.trim() : null;
    if (input.onboardingCompleted !== undefined) data.onboardingCompleted = input.onboardingCompleted;
    if (input.streakDays !== undefined) data.streakDays = input.streakDays;
    if (input.weeklyTargetHours !== undefined) data.weeklyTargetHours = input.weeklyTargetHours;
    if (input.completedHoursThisWeek !== undefined) data.completedHoursThisWeek = input.completedHoursThisWeek;
    if (input.interests !== undefined) data.interestsJson = JSON.stringify(Array.from(new Set(input.interests.map((s) => s.trim()).filter(Boolean))));
    if (input.strengths !== undefined) data.strengthsJson = JSON.stringify(Array.from(new Set(input.strengths.map((s) => s.trim()).filter(Boolean))));
    if (input.savedCareers !== undefined) data.savedCareersJson = JSON.stringify(Array.from(new Set(input.savedCareers.map((s) => s.trim()).filter(Boolean))));

    if (Object.keys(data).length > 0) {
      await tx.profile.update({ where: { userId }, data });
    }

    if (input.targetGoal !== undefined) {
      await syncCareerGoalInTx(tx, userId, input.targetGoal);
    }
  });

  return getStudentStatePayload(userId);
}

export async function updateStudentCareerGoal(
  userId: string,
  targetCareer: string | null
): Promise<StudentStatePayload> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.profile.findUnique({ where: { userId } });
    if (!existing) {
      throw new NotFoundError('Student profile not found.');
    }
    await syncCareerGoalInTx(tx, userId, targetCareer);
  });

  return getStudentStatePayload(userId);
}

export async function updateStudentSavedCareers(
  userId: string,
  options: { savedCareers?: string[]; toggleCareerSlug?: string }
): Promise<StudentStatePayload> {
  await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundError('Student profile not found.');
    }

    let nextSaved = safeParseJsonArray(profile.savedCareersJson);
    if (options.savedCareers !== undefined) {
      nextSaved = Array.from(new Set(options.savedCareers.map((c) => c.trim()).filter(Boolean)));
    } else if (options.toggleCareerSlug) {
      const clean = options.toggleCareerSlug.trim();
      nextSaved = nextSaved.includes(clean)
        ? nextSaved.filter((item) => item !== clean)
        : [...nextSaved, clean];
    }

    await tx.profile.update({
      where: { userId },
      data: { savedCareersJson: JSON.stringify(nextSaved) }
    });
  });

  return getStudentStatePayload(userId);
}

export interface UpsertSkillItemInput {
  name: string;
  score: number;
  careerSlug?: string | null;
}

export async function upsertStudentSkillsData(
  userId: string,
  items: UpsertSkillItemInput[]
): Promise<StudentStatePayload> {
  await prisma.$transaction(async (tx) => {
    const existingProfile = await tx.skillProfile.findUnique({ where: { userId } });
    const existingRows = await tx.studentSkill.findMany({ where: { userId } });

    const { records } = resolveMergedStudentSkills(existingRows, existingProfile);
    const mergedMap = new Map<string, { name: string; score: number }>();
    for (const r of records) {
      mergedMap.set(r.skillKey, { name: r.name, score: r.score });
    }

    for (const item of items) {
      const cleanName = item.name.trim();
      const skillKey = normalizeSkillKey(cleanName);
      const roundedScore = Math.round(item.score);
      const classification = classifySkillScore(roundedScore);
      const resolvedCareer = item.careerSlug ? resolveCareerMeta(item.careerSlug)?.slug || item.careerSlug.trim() : null;

      await tx.studentSkill.upsert({
        where: { userId_skillKey: { userId, skillKey } },
        update: {
          name: cleanName,
          score: roundedScore,
          classification,
          ...(item.careerSlug !== undefined ? { careerSlug: resolvedCareer } : {})
        },
        create: {
          userId,
          skillKey,
          name: cleanName,
          score: roundedScore,
          classification,
          careerSlug: resolvedCareer
        }
      });

      mergedMap.set(skillKey, { name: cleanName, score: roundedScore });
    }

    const legacyJsonObj: Record<string, number> = {};
    for (const entry of mergedMap.values()) {
      legacyJsonObj[entry.name] = entry.score;
    }

    await tx.skillProfile.upsert({
      where: { userId },
      update: { skillsJson: JSON.stringify(legacyJsonObj) },
      create: { userId, skillsJson: JSON.stringify(legacyJsonObj) }
    });
  });

  return getStudentStatePayload(userId);
}

export interface RoadmapUpdateInput {
  careerSlug?: string;
  toggleTaskId?: string;
  completed?: boolean;
  completePhaseId?: string;
  currentPhaseId?: string;
  completedTasks?: string[];
  completedPhases?: string[];
}

export async function updateStudentRoadmapData(
  userId: string,
  input: RoadmapUpdateInput
): Promise<StudentStatePayload> {
  await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundError('Student profile not found.');
    }

    const targetInput = input.careerSlug || profile.targetGoal;
    const meta = resolveCareerMeta(targetInput);
    if (!meta) {
      throw new ValidationError('No valid target career selected to update roadmap progress.', [
        { field: 'careerSlug', issue: 'Select a valid career before updating roadmap progress' }
      ]);
    }

    const dbCareer = await tx.career.findFirst({
      where: { slug: meta.slug },
      include: { templates: { where: { isActive: true }, take: 1 } }
    });
    const phases = enrichRoadmapPhases(meta.slug, dbCareer?.templates[0]?.phasesJson);
    const validPhaseIds = new Set(phases.map((p) => p.id));
    const validTaskIds = new Set(phases.flatMap((p) => p.tasks.map((t) => t.id)));

    const existing = await tx.roadmapProgress.findUnique({
      where: { userId_careerSlug: { userId, careerSlug: meta.slug } }
    });

    const taskSet = new Set(
      (existing ? safeParseJsonArray(existing.completedTasks) : []).filter((id) => validTaskIds.has(id))
    );
    const phaseSet = new Set(
      (existing ? safeParseJsonArray(existing.completedPhases) : []).filter((id) => validPhaseIds.has(id))
    );

    if (input.completedTasks !== undefined) {
      taskSet.clear();
      for (const id of input.completedTasks) {
        if (!validTaskIds.has(id)) {
          throw new ValidationError(`Unknown roadmap milestone '${id}' for career '${meta.title}'.`, [
            { field: 'completedTasks', issue: `Invalid milestone ID: ${id}` }
          ]);
        }
        taskSet.add(id);
      }
    }

    if (input.completedPhases !== undefined) {
      phaseSet.clear();
      for (const id of input.completedPhases) {
        if (!validPhaseIds.has(id)) {
          throw new ValidationError(`Unknown roadmap phase '${id}' for career '${meta.title}'.`, [
            { field: 'completedPhases', issue: `Invalid phase ID: ${id}` }
          ]);
        }
        phaseSet.add(id);
      }
    }

    if (input.toggleTaskId) {
      if (!validTaskIds.has(input.toggleTaskId)) {
        throw new ValidationError(`Unknown roadmap milestone '${input.toggleTaskId}' for career '${meta.title}'.`, [
          { field: 'toggleTaskId', issue: 'Invalid milestone ID' }
        ]);
      }
      const shouldComplete =
        input.completed !== undefined ? input.completed : !taskSet.has(input.toggleTaskId);
      if (shouldComplete) {
        taskSet.add(input.toggleTaskId);
      } else {
        taskSet.delete(input.toggleTaskId);
        // Re-open the owning phase if a completed task is unchecked
        const ownerPhase = phases.find((p) => p.tasks.some((t) => t.id === input.toggleTaskId));
        if (ownerPhase) {
          phaseSet.delete(ownerPhase.id);
        }
      }
    }

    if (input.completePhaseId) {
      if (!validPhaseIds.has(input.completePhaseId)) {
        throw new ValidationError(`Unknown roadmap phase '${input.completePhaseId}' for career '${meta.title}'.`, [
          { field: 'completePhaseId', issue: 'Invalid phase ID' }
        ]);
      }
      phaseSet.add(input.completePhaseId);
      const targetPhase = phases.find((p) => p.id === input.completePhaseId);
      targetPhase?.tasks.forEach((t) => taskSet.add(t.id));
    }

    // Auto-complete any phase whose milestones are all completed
    for (const p of phases) {
      if (p.tasks.length > 0 && p.tasks.every((t) => taskSet.has(t.id))) {
        phaseSet.add(p.id);
      }
    }

    let nextCurrentPhaseId = input.currentPhaseId || existing?.currentPhaseId || phases[0]?.id || 'phase-1';
    if (!validPhaseIds.has(nextCurrentPhaseId)) {
      throw new ValidationError(`Unknown currentPhaseId '${nextCurrentPhaseId}' for career '${meta.title}'.`, [
        { field: 'currentPhaseId', issue: 'Invalid phase ID' }
      ]);
    }

    if (phaseSet.has(nextCurrentPhaseId)) {
      const nextOpenPhase = phases.find((p) => !phaseSet.has(p.id));
      if (nextOpenPhase) {
        nextCurrentPhaseId = nextOpenPhase.id;
      }
    }

    const completedTasksArr = phases
      .flatMap((p) => p.tasks.map((t) => t.id))
      .filter((id) => taskSet.has(id));
    const completedPhasesArr = phases.map((p) => p.id).filter((id) => phaseSet.has(id));

    await tx.roadmapProgress.upsert({
      where: { userId_careerSlug: { userId, careerSlug: meta.slug } },
      update: {
        currentPhaseId: nextCurrentPhaseId,
        completedPhases: JSON.stringify(completedPhasesArr),
        completedTasks: JSON.stringify(completedTasksArr)
      },
      create: {
        userId,
        careerSlug: meta.slug,
        currentPhaseId: nextCurrentPhaseId,
        completedPhases: JSON.stringify(completedPhasesArr),
        completedTasks: JSON.stringify(completedTasksArr)
      }
    });
  });

  return getStudentStatePayload(userId);
}
