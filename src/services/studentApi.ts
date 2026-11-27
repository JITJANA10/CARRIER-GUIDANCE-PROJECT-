// PATHPILOT — AUTHORITATIVE BACKEND SYNCHRONIZATION CLIENT
// Directive: PP-PHASE-B-DATA-SYNC

import type {
  CareerCatalogItem,
  RoadmapUpdatePayload,
  ServerStudentState,
  SkillUpdateItem
} from '../types/state';

const API_BASE = 'http://localhost:3001/api/v1';

export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number, code: string = 'API_ERROR') {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  let parsed: any = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }

  if (!res.ok || !parsed?.success) {
    const message = parsed?.error?.message || `Request failed with status ${res.status}`;
    const code = parsed?.error?.code || 'API_ERROR';
    throw new ApiRequestError(message, res.status, code);
  }

  return parsed.data as T;
}

export function fetchCareersCatalog(): Promise<CareerCatalogItem[]> {
  return requestJson<CareerCatalogItem[]>('/careers');
}

export function fetchStudentState(token: string): Promise<ServerStudentState> {
  return requestJson<ServerStudentState>('/student/state', { method: 'GET' }, token);
}

export function patchStudentProfile(
  token: string,
  payload: Record<string, unknown>
): Promise<ServerStudentState> {
  return requestJson<ServerStudentState>(
    '/student/profile',
    {
      method: 'PATCH',
      body: JSON.stringify(payload)
    },
    token
  );
}

export function putStudentCareerGoal(
  token: string,
  targetCareer: string | null
): Promise<ServerStudentState> {
  return requestJson<ServerStudentState>(
    '/student/career-goal',
    {
      method: 'PUT',
      body: JSON.stringify({ targetCareer })
    },
    token
  );
}

export function putStudentSavedCareers(
  token: string,
  payload: { savedCareers?: string[]; toggleCareerSlug?: string }
): Promise<ServerStudentState> {
  return requestJson<ServerStudentState>(
    '/student/saved-careers',
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
}

export function putStudentSkills(
  token: string,
  skills: SkillUpdateItem[]
): Promise<ServerStudentState> {
  return requestJson<ServerStudentState>(
    '/student/skills',
    {
      method: 'PUT',
      body: JSON.stringify({ skills })
    },
    token
  );
}

export function putStudentRoadmap(
  token: string,
  payload: RoadmapUpdatePayload
): Promise<ServerStudentState> {
  return requestJson<ServerStudentState>(
    '/student/roadmap',
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
}
