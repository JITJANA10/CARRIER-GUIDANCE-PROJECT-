// PATHPILOT — LOCAL STORAGE ADAPTER & MIGRATION ENGINE
// Directive: PP-FE-PHASE-01
// Standard: Local-first persistence, resilient schema versioning & migration

import type { AppState, UserProfile } from '../types/state';

export const STORAGE_KEY = 'pathpilot_state_v1';
export const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_monica_austin',
  firstName: 'Monica',
  lastName: 'Austin',
  educationLevel: 'Middle UX Designer',
  interests: ['Product Strategy', 'Data Analytics', 'UX / Interaction Design'],
  strengths: ['Analytical Problem Solving', 'Prototyping & Wireframing'],
  goal: 'Product Manager',
  onboardingCompleted: true,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  streakDays: 5,
  weeklyTargetHours: 5,
  completedHoursThisWeek: 3.5,
};

export const INITIAL_APP_STATE: AppState = {
  version: CURRENT_SCHEMA_VERSION,
  updatedAt: Date.now(),
  profile: DEFAULT_PROFILE,
  savedCareers: ['product-manager', 'ux-lead'],
  tasks: [
    {
      id: 'task-1',
      title: 'Healthy: Clickable Mobile Prototype',
      desc: 'Create clickable prototype for mobile app using variables',
      time: 35,
      difficulty: 'Medium',
      reason: 'Strengthens UX prototyping and micro-interaction portfolio deliverable.',
      impact: 'High',
      status: 'todo',
      type: 'project',
      role: 'Senior UX Designer',
      tag: 'Prototyping',
      linkedCareer: 'Product Manager',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'task-2',
      title: 'Conduct Usability Testing Session',
      desc: 'Conduct a usability testing session for a website',
      time: 25,
      difficulty: 'Medium',
      reason: 'Validates customer workflow and qualitative design hypotheses.',
      impact: 'Medium',
      status: 'in_progress',
      type: 'skill',
      role: 'Senior UX Designer',
      tag: 'Prototyping',
      linkedCareer: 'Product Manager',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'task-3',
      title: 'Accessibility Audit & Contrast Fixes',
      desc: 'Improve the accessibility of a web application session for keyboard navigation',
      time: 20,
      difficulty: 'Easy',
      reason: 'Ensures WCAG 2.1 AA compliance across interface elements.',
      impact: 'Medium',
      status: 'done',
      type: 'review',
      role: 'Senior UX Designer',
      tag: 'Prototyping',
      linkedCareer: 'Product Manager',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      completedAt: new Date(Date.now() - 14400000).toISOString()
    }
  ],
  activeGoal: 'Product Manager',
  roadmapProgress: {
    'p1-t1': 'done'
  },
  assessmentScores: {
    'sql': 65,
    'typing': 72,
    'product': 80
  },
  assessmentResults: [
    {
      id: 'res-typing-initial',
      assessmentId: 'typing-speed',
      assessmentTitle: 'Typing Speed & Cognitive Fluency',
      scorePercentage: 72,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      skillGains: { typing: 72 },
      metrics: { wpm: 72, accuracy: 98 }
    }
  ],
  mentorBookings: [],
  activities: [
    {
      id: 'act-1',
      type: 'task_completed',
      description: 'You completed task: Accessibility Audit & Contrast Fixes',
      timestamp: 'Today, 10:45 AM'
    },
    {
      id: 'act-2',
      type: 'assessment_taken',
      description: 'Completed Typing Benchmark: 72 WPM (98% Accuracy)',
      timestamp: 'Yesterday, 3:20 PM'
    },
    {
      id: 'act-3',
      type: 'roadmap_advanced',
      description: 'Unlocked Phase 01: Data Manipulation & Analytics',
      timestamp: '2 days ago'
    }
  ],
  aiSessions: [
    {
      id: 'session-default',
      title: 'Strategic Career Advisor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'm1',
          role: 'assistant',
          text: 'Hello Monica. I am PathPilot AI, your strategic career advisor. Based on your target goal to become a Product Manager, I have analyzed your skill gap profile and current phase. How can I assist your career progression today?',
          timestamp: '10:42 AM'
        }
      ]
    }
  ],
  activeAiSessionId: 'session-default'
};

// In-memory fallback if localStorage is blocked by privacy mode or security policies
let memoryFallbackStore: string | null = null;

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__pathpilot_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Migration engine: converts older/legacy/partial states into the current AppState schema.
 */
export function migrateState(rawObj: any): AppState {
  if (!rawObj || typeof rawObj !== 'object') {
    return { ...INITIAL_APP_STATE, updatedAt: Date.now() };
  }

  // Version 0 / legacy Express payload migration
  const migrated: AppState = {
    version: CURRENT_SCHEMA_VERSION,
    updatedAt: typeof rawObj.updatedAt === 'number' ? rawObj.updatedAt : Date.now(),
    profile: {
      ...DEFAULT_PROFILE,
      ...(rawObj.profile && typeof rawObj.profile === 'object' ? rawObj.profile : {})
    },
    savedCareers: Array.isArray(rawObj.savedCareers) && rawObj.savedCareers.length > 0 
      ? rawObj.savedCareers 
      : INITIAL_APP_STATE.savedCareers,
    tasks: Array.isArray(rawObj.tasks) && rawObj.tasks.length > 0 
      ? rawObj.tasks 
      : INITIAL_APP_STATE.tasks,
    activeGoal: rawObj.profile?.goal || rawObj.activeGoal || INITIAL_APP_STATE.activeGoal,
    roadmapProgress: rawObj.roadmapProgress && typeof rawObj.roadmapProgress === 'object' 
      ? rawObj.roadmapProgress 
      : INITIAL_APP_STATE.roadmapProgress,
    roadmapPhases: Array.isArray(rawObj.roadmapPhases) ? rawObj.roadmapPhases : undefined,
    assessmentScores: rawObj.assessmentScores && typeof rawObj.assessmentScores === 'object' 
      ? rawObj.assessmentScores 
      : INITIAL_APP_STATE.assessmentScores,
    assessmentResults: Array.isArray(rawObj.assessmentResults) && rawObj.assessmentResults.length > 0
      ? rawObj.assessmentResults
      : INITIAL_APP_STATE.assessmentResults,
    mentorBookings: Array.isArray(rawObj.mentorBookings) ? rawObj.mentorBookings : [],
    activities: Array.isArray(rawObj.activities) && rawObj.activities.length > 0
      ? rawObj.activities
      : INITIAL_APP_STATE.activities,
    aiSessions: Array.isArray(rawObj.aiSessions) && rawObj.aiSessions.length > 0
      ? rawObj.aiSessions
      : INITIAL_APP_STATE.aiSessions,
    activeAiSessionId: typeof rawObj.activeAiSessionId === 'string' 
      ? rawObj.activeAiSessionId 
      : INITIAL_APP_STATE.activeAiSessionId
  };

  return migrated;
}

export const StorageAdapter = {
  loadState(): AppState {
    try {
      let raw: string | null = null;
      if (isLocalStorageAvailable()) {
        raw = window.localStorage.getItem(STORAGE_KEY);
      } else {
        raw = memoryFallbackStore;
      }

      if (!raw) {
        // Save initial state so subsequent queries find it
        this.saveState(INITIAL_APP_STATE);
        return INITIAL_APP_STATE;
      }

      const parsed = JSON.parse(raw);
      return migrateState(parsed);
    } catch (err) {
      console.warn('[StorageAdapter] Failed to load or parse stored state. Falling back to clean initial state:', err);
      return { ...INITIAL_APP_STATE, updatedAt: Date.now() };
    }
  },

  saveState(state: AppState): boolean {
    try {
      const stateToSave: AppState = {
        ...state,
        version: CURRENT_SCHEMA_VERSION,
        updatedAt: state.updatedAt || Date.now()
      };
      const serialized = JSON.stringify(stateToSave);

      if (isLocalStorageAvailable()) {
        window.localStorage.setItem(STORAGE_KEY, serialized);
      } else {
        memoryFallbackStore = serialized;
      }
      return true;
    } catch (err) {
      console.error('[StorageAdapter] Synchronous persistence failed (e.g. QuotaExceededError):', err);
      return false;
    }
  },

  deserialize(raw: string): AppState | null {
    try {
      const parsed = JSON.parse(raw);
      return migrateState(parsed);
    } catch {
      return null;
    }
  },

  serialize(state: AppState): string {
    return JSON.stringify(state);
  },

  clearState(): void {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      memoryFallbackStore = null;
    } catch (err) {
      console.warn('[StorageAdapter] Clear failed:', err);
    }
  }
};
