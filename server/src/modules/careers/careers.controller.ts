// PATHPILOT — CAREERS & ROADMAPS CONTROLLER
// Directive: PP-DEMO-60MIN-EXEC-2026-01

import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError.js';
import { enrichRoadmapPhases, resolveCareerMeta } from './careerCatalog.js';

function getCareerIdParam(rawId: string | string[] | undefined): string {
  if (typeof rawId === 'string' && rawId.trim().length > 0) {
    return rawId;
  }
  throw new ValidationError('Career ID route parameter must be a non-empty string.', [
    { field: 'id', issue: 'Invalid career ID' }
  ]);
}

export async function listCareers(_req: Request, res: Response): Promise<void> {
  const careers = await prisma.career.findMany({
    include: {
      templates: {
        where: { isActive: true },
        take: 1
      }
    }
  });

  const formatted = careers.map((c) => {
    const meta = resolveCareerMeta(c.slug) || resolveCareerMeta(c.title);
    const activeTemplate = c.templates[0];
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      category: c.category,
      salaryRange: c.salaryRange,
      growthRate: c.growthRate,
      description: c.description,
      demand: meta?.demand || 'High',
      openings: meta?.openings || '10,000+ roles',
      primarySkills: meta?.primarySkills || [],
      skillRequirements: meta?.skillRequirements || [],
      activeRoadmap: activeTemplate
        ? {
            id: activeTemplate.id,
            version: activeTemplate.version,
            phases: enrichRoadmapPhases(c.slug, activeTemplate.phasesJson)
          }
        : meta
          ? {
              id: `${c.slug}-default`,
              version: '1.0.0',
              phases: meta.phases
            }
          : null
    };
  });

  sendSuccess(res, formatted);
}

export async function getCareerById(req: Request, res: Response): Promise<void> {
  const id = getCareerIdParam(req.params.id);

  const career = await prisma.career.findUnique({
    where: { id },
    include: {
      templates: {
        where: { isActive: true },
        take: 1
      }
    }
  });

  if (!career) {
    throw new NotFoundError(`Career with ID '${id}' not found.`);
  }

  const meta = resolveCareerMeta(career.slug) || resolveCareerMeta(career.title);
  const activeTemplate = career.templates[0];
  const activeRoadmap = activeTemplate
    ? {
        id: activeTemplate.id,
        version: activeTemplate.version,
        phases: enrichRoadmapPhases(career.slug, activeTemplate.phasesJson)
      }
    : null;

  sendSuccess(res, {
    ...career,
    demand: meta?.demand || 'High',
    openings: meta?.openings || '10,000+ roles',
    primarySkills: meta?.primarySkills || [],
    skillRequirements: meta?.skillRequirements || [],
    activeRoadmap
  });
}
