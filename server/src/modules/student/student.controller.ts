// PATHPILOT — AUTHENTICATED STUDENT SYNCHRONIZATION CONTROLLER
// Directive: PP-PHASE-B-DATA-SYNC

import type { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess } from '../../shared/utils/response.js';
import { ForbiddenError, UnauthorizedError, ValidationError } from '../../shared/errors/AppError.js';
import {
  getStudentStatePayload,
  updateStudentCareerGoal,
  updateStudentProfileData,
  updateStudentRoadmapData,
  updateStudentSavedCareers,
  upsertStudentSkillsData
} from './student.service.js';

const profileUpdateSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name cannot be empty').max(80).optional(),
    lastName: z.string().trim().max(80).optional(),
    educationLevel: z.string().trim().max(120).nullable().optional(),
    onboardingCompleted: z.boolean().optional(),
    streakDays: z.number().int().min(0).max(3650).optional(),
    weeklyTargetHours: z.number().int().min(1).max(168).optional(),
    completedHoursThisWeek: z.number().min(0).max(168).optional(),
    interests: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
    strengths: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
    savedCareers: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
    targetGoal: z.string().trim().min(1).max(120).nullable().optional()
  })
  .strict();

const careerGoalSchema = z
  .object({
    targetCareer: z.string().trim().min(1).max(120).nullable()
  })
  .strict();

const savedCareersSchema = z
  .object({
    savedCareers: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
    toggleCareerSlug: z.string().trim().min(1).max(80).optional()
  })
  .strict();

const skillItemSchema = z
  .object({
    name: z.string().trim().min(1, 'Skill name is required').max(80),
    score: z.number().finite().min(0, 'Skill score must be between 0 and 100').max(100, 'Skill score must be between 0 and 100'),
    careerSlug: z.string().trim().min(1).max(80).nullable().optional()
  })
  .strict();

const skillsUpdateSchema = z.union([
  z.object({ skills: z.array(skillItemSchema).min(1, 'At least one skill update is required').max(50) }).strict(),
  skillItemSchema
]);

const roadmapUpdateSchema = z
  .object({
    careerSlug: z.string().trim().min(1).max(80).optional(),
    toggleTaskId: z.string().trim().min(1).max(80).optional(),
    completed: z.boolean().optional(),
    completePhaseId: z.string().trim().min(1).max(80).optional(),
    currentPhaseId: z.string().trim().min(1).max(80).optional(),
    completedTasks: z.array(z.string().trim().min(1).max(80)).max(100).optional(),
    completedPhases: z.array(z.string().trim().min(1).max(80)).max(30).optional()
  })
  .strict();

function requireStudentIdentity(req: Request): string {
  const authUserId = req.user?.id;
  if (!authUserId) {
    throw new UnauthorizedError('Authentication required.');
  }

  const rawParamId = typeof req.params.userId === 'string' ? req.params.userId.trim() : undefined;
  const rawQueryId = typeof req.query.userId === 'string' ? req.query.userId.trim() : undefined;
  const rawBodyId =
    req.body && typeof req.body === 'object' && typeof (req.body as Record<string, unknown>).userId === 'string'
      ? String((req.body as Record<string, unknown>).userId).trim()
      : undefined;

  if (
    (rawParamId && rawParamId !== authUserId) ||
    (rawQueryId && rawQueryId !== authUserId) ||
    (rawBodyId && rawBodyId !== authUserId)
  ) {
    throw new ForbiddenError('Access denied: you cannot access or modify another student profile.', 'FORBIDDEN');
  }

  return authUserId;
}

function parseBodyOrThrow<T>(schema: z.ZodType<T>, rawBody: unknown): T {
  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      issue: issue.message
    }));
    throw new ValidationError('Invalid student synchronization payload.', details);
  }
  return parsed.data;
}

export async function getStudentState(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const state = await getStudentStatePayload(userId);
  sendSuccess(res, state);
}

export async function getStudentProfile(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const state = await getStudentStatePayload(userId);
  sendSuccess(res, {
    profile: state.profile,
    skills: state.skills,
    skillGaps: state.skillGaps
  });
}

export async function patchStudentProfile(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const input = parseBodyOrThrow(profileUpdateSchema, req.body);
  const state = await updateStudentProfileData(userId, input);
  sendSuccess(res, state);
}

export async function getCareerGoal(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const state = await getStudentStatePayload(userId);
  sendSuccess(res, {
    targetGoal: state.profile.targetGoal,
    careerSlug: state.profile.careerSlug,
    skillGaps: state.skillGaps,
    activeRoadmap: state.activeRoadmap
  });
}

export async function putCareerGoal(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const { targetCareer } = parseBodyOrThrow(careerGoalSchema, req.body);
  const state = await updateStudentCareerGoal(userId, targetCareer);
  sendSuccess(res, state);
}

export async function putSavedCareers(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const input = parseBodyOrThrow(savedCareersSchema, req.body);
  if (!input.savedCareers && !input.toggleCareerSlug) {
    throw new ValidationError('Provide savedCareers or toggleCareerSlug.', [
      { field: 'savedCareers', issue: 'At least one field is required' }
    ]);
  }
  const state = await updateStudentSavedCareers(userId, input);
  sendSuccess(res, state);
}

export async function getStudentSkills(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const state = await getStudentStatePayload(userId);
  sendSuccess(res, {
    skills: state.skills,
    skillMap: state.skillMap,
    skillGaps: state.skillGaps
  });
}

export async function putStudentSkills(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const parsed = parseBodyOrThrow(skillsUpdateSchema, req.body);
  const updates = 'skills' in parsed ? parsed.skills : [parsed];
  const state = await upsertStudentSkillsData(userId, updates);
  sendSuccess(res, state);
}

export async function getStudentRoadmap(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const state = await getStudentStatePayload(userId);
  sendSuccess(res, {
    targetGoal: state.profile.targetGoal,
    activeRoadmap: state.activeRoadmap,
    roadmapsByCareer: state.roadmapsByCareer
  });
}

export async function putStudentRoadmap(req: Request, res: Response): Promise<void> {
  const userId = requireStudentIdentity(req);
  const input = parseBodyOrThrow(roadmapUpdateSchema, req.body);
  const state = await updateStudentRoadmapData(userId, input);
  sendSuccess(res, state);
}
