// PATHPILOT — AUTHORITATIVE BACKEND-SYNCED APPLICATION CONTEXT
// Directive: PP-PHASE-B-DATA-SYNC
// Standard: Authoritative SQLite state for authenticated students; local preview fallback only when signed out.

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState
} from 'react';
import type { ReactNode } from 'react';
import type {
  AppState,
  UserProfile,
  DailyTask,
  AssessmentResult,
  MentorBooking,
  ActivityEvent,
  AIChatMessage,
  AIChatSession,
  StudentSkillRecord,
  SkillGapSummary,
  StudentRoadmapState,
  RoadmapSummaryItem,
  CareerCatalogItem,
  ServerStudentState,
  SkillUpdateItem,
  RoadmapUpdatePayload
} from '../types/state';
import { StorageAdapter, CURRENT_SCHEMA_VERSION, INITIAL_APP_STATE } from '../services/storageAdapter';
import {
  ApiRequestError,
  fetchCareersCatalog,
  fetchStudentState,
  patchStudentProfile,
  putStudentCareerGoal,
  putStudentRoadmap,
  putStudentSavedCareers,
  putStudentSkills
} from '../services/studentApi';

export type AppAction =
  | { type: 'HYDRATE_STATE'; payload: AppState }
  | { type: 'HYDRATE_SERVER_STUDENT'; payload: ServerStudentState }
  | { type: 'RESET_SESSION_STATE' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_TARGET_GOAL'; payload: string | null }
  | { type: 'TOGGLE_SAVED_CAREER'; payload: string }
  | { type: 'CREATE_TASK'; payload: DailyTask }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<DailyTask> } }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_ROADMAP_PROGRESS'; payload: { taskId: string; status: string } }
  | { type: 'UPDATE_ASSESSMENT_SCORE'; payload: { assessmentId: string; score: number } }
  | { type: 'SAVE_ASSESSMENT_RESULT'; payload: AssessmentResult }
  | { type: 'SAVE_MENTOR_BOOKING'; payload: MentorBooking }
  | { type: 'CANCEL_MENTOR_BOOKING'; payload: string }
  | { type: 'RECORD_ACTIVITY'; payload: ActivityEvent }
  | { type: 'ADD_AI_MESSAGE'; payload: { sessionId?: string; message: AIChatMessage } }
  | { type: 'CREATE_AI_SESSION'; payload: { id: string; title: string } }
  | { type: 'SET_ACTIVE_AI_SESSION'; payload: string };

function mapServerRoadmapToProgressMap(roadmap: StudentRoadmapState | null): Record<string, string> {
  if (!roadmap) return {};
  const map: Record<string, string> = {};
  for (const taskId of roadmap.completedTasks) {
    map[taskId] = 'done';
  }
  for (const phaseId of roadmap.completedPhases) {
    map[`${phaseId}-status`] = 'completed';
  }
  return map;
}

function buildAuthenticatedBaselineAppState(serverState: ServerStudentState, current: AppState): AppState {
  const sp = serverState.profile;
  return {
    ...current,
    version: CURRENT_SCHEMA_VERSION,
    updatedAt: Date.now(),
    profile: {
      id: sp.userId,
      firstName: sp.firstName,
      lastName: sp.lastName,
      educationLevel: sp.educationLevel || 'Student',
      interests: sp.interests,
      strengths: sp.strengths,
      goal: sp.targetGoal,
      onboardingCompleted: sp.onboardingCompleted,
      streakDays: sp.streakDays,
      weeklyTargetHours: sp.weeklyTargetHours,
      completedHoursThisWeek: sp.completedHoursThisWeek
    },
    activeGoal: sp.targetGoal,
    savedCareers: sp.savedCareers,
    assessmentScores: { ...serverState.skillMap },
    roadmapProgress: mapServerRoadmapToProgressMap(serverState.activeRoadmap),
    roadmapPhases: serverState.activeRoadmap?.phases
  };
}

function appReducer(state: AppState, action: AppAction): AppState {
  const now = Date.now();

  switch (action.type) {
    case 'HYDRATE_STATE':
      return {
        ...action.payload,
        version: CURRENT_SCHEMA_VERSION,
        updatedAt: Math.max(state.updatedAt || 0, action.payload.updatedAt || now)
      };

    case 'HYDRATE_SERVER_STUDENT':
      return buildAuthenticatedBaselineAppState(action.payload, state);

    case 'RESET_SESSION_STATE':
      return {
        ...INITIAL_APP_STATE,
        updatedAt: now
      };

    case 'UPDATE_PROFILE': {
      const updatedProfile = { ...state.profile, ...action.payload };
      const newGoal = action.payload.goal !== undefined ? action.payload.goal : state.activeGoal;
      return {
        ...state,
        profile: updatedProfile,
        activeGoal: newGoal,
        updatedAt: now
      };
    }

    case 'SET_TARGET_GOAL':
      return {
        ...state,
        profile: { ...state.profile, goal: action.payload },
        activeGoal: action.payload,
        updatedAt: now
      };

    case 'TOGGLE_SAVED_CAREER': {
      const id = action.payload;
      const exists = state.savedCareers.includes(id);
      const nextSaved = exists ? state.savedCareers.filter((item) => item !== id) : [...state.savedCareers, id];
      return {
        ...state,
        savedCareers: nextSaved,
        updatedAt: now
      };
    }

    case 'CREATE_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks], updatedAt: now };

    case 'UPDATE_TASK': {
      const { id, updates } = action.payload;
      return { ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)), updatedAt: now };
    }

    case 'TOGGLE_TASK': {
      const id = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== id) return t;
          const nextStatus = t.status === 'done' ? 'todo' : 'done';
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'done' ? new Date().toISOString() : undefined
          };
        }),
        updatedAt: now
      };
    }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload), updatedAt: now };

    case 'UPDATE_ROADMAP_PROGRESS': {
      const { taskId, status } = action.payload;
      return {
        ...state,
        roadmapProgress: { ...state.roadmapProgress, [taskId]: status },
        updatedAt: now
      };
    }

    case 'UPDATE_ASSESSMENT_SCORE': {
      const { assessmentId, score } = action.payload;
      return {
        ...state,
        assessmentScores: { ...state.assessmentScores, [assessmentId]: score },
        updatedAt: now
      };
    }

    case 'SAVE_ASSESSMENT_RESULT':
      return {
        ...state,
        assessmentResults: [action.payload, ...state.assessmentResults],
        assessmentScores: { ...state.assessmentScores, ...action.payload.skillGains },
        updatedAt: now
      };

    case 'SAVE_MENTOR_BOOKING':
      return { ...state, mentorBookings: [action.payload, ...state.mentorBookings], updatedAt: now };

    case 'CANCEL_MENTOR_BOOKING':
      return {
        ...state,
        mentorBookings: state.mentorBookings.map((b) =>
          b.id === action.payload ? { ...b, status: 'cancelled' as const } : b
        ),
        updatedAt: now
      };

    case 'RECORD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities.slice(0, 49)],
        updatedAt: now
      };

    case 'ADD_AI_MESSAGE': {
      const { sessionId, message } = action.payload;
      const targetSessionId = sessionId || state.activeAiSessionId;
      return {
        ...state,
        aiSessions: state.aiSessions.map((s) =>
          s.id === targetSessionId ? { ...s, updatedAt: new Date().toISOString(), messages: [...s.messages, message] } : s
        ),
        updatedAt: now
      };
    }

    case 'CREATE_AI_SESSION': {
      const newSession: AIChatSession = {
        id: action.payload.id,
        title: action.payload.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      return { ...state, aiSessions: [newSession, ...state.aiSessions], activeAiSessionId: newSession.id, updatedAt: now };
    }

    case 'SET_ACTIVE_AI_SESSION':
      return { ...state, activeAiSessionId: action.payload, updatedAt: now };

    default:
      return state;
  }
}

export interface AuthSessionBinding {
  token: string | null;
  isStudent: boolean;
  studentState: ServerStudentState | null;
  onUnauthorized?: () => void;
}

export interface AppContextType {
  profile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  savedCareers: string[];
  toggleSavedCareer: (careerId: string) => Promise<boolean>;
  roadmapProgress: Record<string, string>;
  updateRoadmapProgress: (taskId: string, status: string) => Promise<boolean>;
  assessmentScores: Record<string, number>;
  updateAssessmentScore: (assessmentId: string, score: number) => Promise<boolean>;

  tasks: DailyTask[];
  createTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<DailyTask>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  activeGoal: string | null;
  setTargetGoal: (goal: string | null) => Promise<boolean>;

  assessmentResults: AssessmentResult[];
  saveAssessmentResult: (result: Omit<AssessmentResult, 'id' | 'completedAt'>) => void;

  mentorBookings: MentorBooking[];
  saveMentorBooking: (booking: Omit<MentorBooking, 'id' | 'createdAt' | 'status'>) => void;
  cancelMentorBooking: (bookingId: string) => void;

  activities: ActivityEvent[];
  recordActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;

  aiSessions: AIChatSession[];
  activeAiSessionId: string;
  addAiMessage: (message: Omit<AIChatMessage, 'id' | 'timestamp'>, sessionId?: string) => void;
  createAiSession: (title?: string) => string;
  setActiveAiSessionId: (sessionId: string) => void;

  // Authoritative Phase B backend-synced state
  isAuthenticatedStudent: boolean;
  isSyncedWithServer: boolean;
  isSyncLoading: boolean;
  isSyncSaving: boolean;
  syncError: string | null;
  clearSyncError: () => void;
  careersCatalog: CareerCatalogItem[];
  isCatalogLoading: boolean;
  catalogError: string | null;
  refreshCareersCatalog: () => Promise<void>;
  skillRecords: StudentSkillRecord[];
  skillGaps: SkillGapSummary | null;
  activeRoadmap: StudentRoadmapState | null;
  roadmapsByCareer: RoadmapSummaryItem[];
  refreshStudentState: () => Promise<void>;
  updateSkills: (updates: SkillUpdateItem[]) => Promise<boolean>;
  toggleRoadmapTask: (taskId: string, completed?: boolean) => Promise<boolean>;
  completeRoadmapPhase: (phaseId: string) => Promise<boolean>;
  bindAuthSession: (binding: AuthSessionBinding) => void;
  rawState: AppState;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, () => StorageAdapter.loadState());

  const [isAuthenticatedStudent, setIsAuthenticatedStudent] = useState(false);
  const [isSyncedWithServer, setIsSyncedWithServer] = useState(false);
  const [isSyncLoading, setIsSyncLoading] = useState(false);
  const [isSyncSaving, setIsSyncSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [careersCatalog, setCareersCatalog] = useState<CareerCatalogItem[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [skillRecords, setSkillRecords] = useState<StudentSkillRecord[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapSummary | null>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<StudentRoadmapState | null>(null);
  const [roadmapsByCareer, setRoadmapsByCareer] = useState<RoadmapSummaryItem[]>([]);

  const stateRef = useRef<AppState>(state);
  stateRef.current = state;

  const authBindingRef = useRef<{ token: string | null; isStudent: boolean; onUnauthorized?: () => void }>({
    token: null,
    isStudent: false
  });

  // Persist to localStorage ONLY in unauthenticated guest preview mode
  useEffect(() => {
    if (!authBindingRef.current.isStudent) {
      StorageAdapter.saveState(state);
    }
  }, [state]);

  // Cross-tab sync applies ONLY in guest preview mode
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (authBindingRef.current.isStudent) return;
      if (e.key === 'pathpilot_state_v1' && e.newValue) {
        const incoming = StorageAdapter.deserialize(e.newValue);
        if (incoming && incoming.updatedAt > (stateRef.current.updatedAt || 0)) {
          dispatch({ type: 'HYDRATE_STATE', payload: incoming });
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  const refreshCareersCatalog = useCallback(async () => {
    setIsCatalogLoading(true);
    setCatalogError(null);
    try {
      const items = await fetchCareersCatalog();
      setCareersCatalog(items);
    } catch (err: any) {
      setCatalogError(err?.message || 'Unable to load career catalog from backend.');
    } finally {
      setIsCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCareersCatalog();
  }, [refreshCareersCatalog]);

  const applyServerStudentState = useCallback((serverState: ServerStudentState) => {
    StorageAdapter.clearState();
    setSkillRecords(serverState.skills);
    setSkillGaps(serverState.skillGaps);
    setActiveRoadmap(serverState.activeRoadmap);
    setRoadmapsByCareer(serverState.roadmapsByCareer);
    dispatch({ type: 'HYDRATE_SERVER_STUDENT', payload: serverState });
    setIsSyncedWithServer(true);
    setSyncError(null);
  }, []);

  const bindAuthSession = useCallback(
    (binding: AuthSessionBinding) => {
      authBindingRef.current = {
        token: binding.token,
        isStudent: binding.isStudent,
        onUnauthorized: binding.onUnauthorized
      };
      setIsAuthenticatedStudent(binding.isStudent);

      if (binding.isStudent && binding.studentState) {
        applyServerStudentState(binding.studentState);
      } else {
        StorageAdapter.clearState();
        setSkillRecords([]);
        setSkillGaps(null);
        setActiveRoadmap(null);
        setRoadmapsByCareer([]);
        setIsSyncedWithServer(false);
        setSyncError(null);
        dispatch({ type: 'RESET_SESSION_STATE' });
      }
    },
    [applyServerStudentState]
  );

  const executeServerSync = useCallback(
    async (operation: (token: string) => Promise<ServerStudentState>): Promise<boolean> => {
      const { token, isStudent, onUnauthorized } = authBindingRef.current;
      if (!isStudent || !token) return false;

      setIsSyncSaving(true);
      setSyncError(null);
      try {
        const nextState = await operation(token);
        applyServerStudentState(nextState);
        return true;
      } catch (err: any) {
        if (err instanceof ApiRequestError && err.status === 401) {
          onUnauthorized?.();
          setSyncError('Your session has expired. Please sign in again.');
          return false;
        }
        setSyncError(err?.message || 'Failed to synchronize changes with PathPilot backend.');
        return false;
      } finally {
        setIsSyncSaving(false);
      }
    },
    [applyServerStudentState]
  );

  const refreshStudentState = useCallback(async () => {
    const { token, isStudent, onUnauthorized } = authBindingRef.current;
    if (!isStudent || !token) return;

    setIsSyncLoading(true);
    setSyncError(null);
    try {
      const latest = await fetchStudentState(token);
      applyServerStudentState(latest);
    } catch (err: any) {
      if (err instanceof ApiRequestError && err.status === 401) {
        onUnauthorized?.();
        setSyncError('Your session has expired. Please sign in again.');
      } else {
        setSyncError(err?.message || 'Unable to synchronize student profile from backend.');
      }
    } finally {
      setIsSyncLoading(false);
    }
  }, [applyServerStudentState]);

  const clearSyncError = useCallback(() => setSyncError(null), []);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>): Promise<boolean> => {
      if (authBindingRef.current.isStudent && authBindingRef.current.token) {
        const payload: Record<string, unknown> = {};
        if (data.firstName !== undefined) payload.firstName = data.firstName;
        if (data.lastName !== undefined) payload.lastName = data.lastName;
        if (data.educationLevel !== undefined) payload.educationLevel = data.educationLevel;
        if (data.onboardingCompleted !== undefined) payload.onboardingCompleted = data.onboardingCompleted;
        if (data.streakDays !== undefined) payload.streakDays = data.streakDays;
        if (data.weeklyTargetHours !== undefined) payload.weeklyTargetHours = data.weeklyTargetHours;
        if (data.completedHoursThisWeek !== undefined) payload.completedHoursThisWeek = data.completedHoursThisWeek;
        if (data.interests !== undefined) payload.interests = data.interests;
        if (data.strengths !== undefined) payload.strengths = data.strengths;
        if (data.goal !== undefined) payload.targetGoal = data.goal;
        return executeServerSync((t) => patchStudentProfile(t, payload));
      }

      dispatch({ type: 'UPDATE_PROFILE', payload: data });
      return true;
    },
    [executeServerSync]
  );

  const setTargetGoal = useCallback(
    async (goal: string | null): Promise<boolean> => {
      if (authBindingRef.current.isStudent && authBindingRef.current.token) {
        const ok = await executeServerSync((t) => putStudentCareerGoal(t, goal));
        if (ok && goal) {
          dispatch({
            type: 'RECORD_ACTIVITY',
            payload: {
              id: `act_${Date.now()}`,
              type: 'goal_updated',
              description: `Target career synced to: ${goal}`,
              timestamp: 'Just now'
            }
          });
        }
        return ok;
      }

      dispatch({ type: 'SET_TARGET_GOAL', payload: goal });
      return true;
    },
    [executeServerSync]
  );

  const toggleSavedCareer = useCallback(
    async (careerSlugOrId: string): Promise<boolean> => {
      if (authBindingRef.current.isStudent && authBindingRef.current.token) {
        return executeServerSync((t) => putStudentSavedCareers(t, { toggleCareerSlug: careerSlugOrId }));
      }
      dispatch({ type: 'TOGGLE_SAVED_CAREER', payload: careerSlugOrId });
      return true;
    },
    [executeServerSync]
  );

  const updateSkills = useCallback(
    async (updates: SkillUpdateItem[]): Promise<boolean> => {
      if (authBindingRef.current.isStudent && authBindingRef.current.token) {
        return executeServerSync((t) => putStudentSkills(t, updates));
      }
      for (const item of updates) {
        dispatch({ type: 'UPDATE_ASSESSMENT_SCORE', payload: { assessmentId: item.name, score: item.score } });
      }
      return true;
    },
    [executeServerSync]
  );

  const updateAssessmentScore = useCallback(
    async (assessmentId: string, score: number): Promise<boolean> => {
      if (authBindingRef.current.isStudent && authBindingRef.current.token) {
        return updateSkills([{ name: assessmentId, score }]);
      }
      dispatch({ type: 'UPDATE_ASSESSMENT_SCORE', payload: { assessmentId, score } });
      return true;
    },
    [updateSkills]
  );

  const sendRoadmapUpdate = useCallback(
    async (payload: RoadmapUpdatePayload): Promise<boolean> => {
      return executeServerSync((t) => putStudentRoadmap(t, payload));
    },
    [executeServerSync]
  );

  const toggleRoadmapTask = useCallback(
    async (taskId: string, completed?: boolean): Promise<boolean> => {
      if (authBindingRef.current.isStudent && authBindingRef.current.token) {
        const ok = await sendRoadmapUpdate({
          careerSlug: activeRoadmap?.careerSlug,
          toggleTaskId: taskId,
          ...(completed !== undefined ? { completed } : {})
        });
        if (ok) {
          dispatch({
            type: 'RECORD_ACTIVITY',
            payload: {
              id: `act_${Date.now()}`,
              type: 'roadmap_advanced',
              description: `Updated roadmap milestone: ${taskId}`,
              timestamp: 'Just now'
            }
          });
        }
        return ok;
      }

      const nextStatus = completed === undefined ? (stateRef.current.roadmapProgress[taskId] === 'done' ? 'todo' : 'done') : completed ? 'done' : 'todo';
      dispatch({ type: 'UPDATE_ROADMAP_PROGRESS', payload: { taskId, status: nextStatus } });
      return true;
    },
    [activeRoadmap?.careerSlug, sendRoadmapUpdate]
  );

  const completeRoadmapPhase = useCallback(
    async (phaseId: string): Promise<boolean> => {
      if (authBindingRef.current.isStudent && authBindingRef.current.token) {
        const ok = await sendRoadmapUpdate({
          careerSlug: activeRoadmap?.careerSlug,
          completePhaseId: phaseId
        });
        if (ok) {
          dispatch({
            type: 'RECORD_ACTIVITY',
            payload: {
              id: `act_${Date.now()}`,
              type: 'roadmap_advanced',
              description: `Completed roadmap phase: ${phaseId}`,
              timestamp: 'Just now'
            }
          });
        }
        return ok;
      }

      dispatch({ type: 'UPDATE_ROADMAP_PROGRESS', payload: { taskId: `${phaseId}-status`, status: 'completed' } });
      return true;
    },
    [activeRoadmap?.careerSlug, sendRoadmapUpdate]
  );

  const updateRoadmapProgress = useCallback(
    async (taskId: string, status: string): Promise<boolean> => {
      if (authBindingRef.current.isStudent && authBindingRef.current.token) {
        if (taskId.endsWith('-status') && status === 'completed') {
          return completeRoadmapPhase(taskId.replace(/-status$/, ''));
        }
        return toggleRoadmapTask(taskId, status === 'done');
      }
      dispatch({ type: 'UPDATE_ROADMAP_PROGRESS', payload: { taskId, status } });
      return true;
    },
    [completeRoadmapPhase, toggleRoadmapTask]
  );

  const createTask = useCallback((taskData: Omit<DailyTask, 'id' | 'createdAt'>): string => {
    const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTask: DailyTask = { ...taskData, id, createdAt: new Date().toISOString() };
    dispatch({ type: 'CREATE_TASK', payload: newTask });
    return id;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<DailyTask>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const saveAssessmentResult = useCallback((resultData: Omit<AssessmentResult, 'id' | 'completedAt'>) => {
    const newResult: AssessmentResult = {
      ...resultData,
      id: `res_${Date.now()}`,
      completedAt: new Date().toISOString()
    };
    dispatch({ type: 'SAVE_ASSESSMENT_RESULT', payload: newResult });
  }, []);

  const saveMentorBooking = useCallback((bookingData: Omit<MentorBooking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: MentorBooking = {
      ...bookingData,
      id: `book_${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'SAVE_MENTOR_BOOKING', payload: newBooking });
  }, []);

  const cancelMentorBooking = useCallback((bookingId: string) => {
    dispatch({ type: 'CANCEL_MENTOR_BOOKING', payload: bookingId });
  }, []);

  const recordActivity = useCallback((eventData: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = { ...eventData, id: `act_${Date.now()}`, timestamp: 'Just now' };
    dispatch({ type: 'RECORD_ACTIVITY', payload: newEvent });
  }, []);

  const addAiMessage = useCallback((messageData: Omit<AIChatMessage, 'id' | 'timestamp'>, sessionId?: string) => {
    const newMessage: AIChatMessage = {
      ...messageData,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    dispatch({ type: 'ADD_AI_MESSAGE', payload: { sessionId, message: newMessage } });
  }, []);

  const createAiSession = useCallback((title: string = 'New Strategic Session'): string => {
    const newId = `session_${Date.now()}`;
    dispatch({ type: 'CREATE_AI_SESSION', payload: { id: newId, title } });
    return newId;
  }, []);

  const setActiveAiSessionId = useCallback((sessionId: string) => {
    dispatch({ type: 'SET_ACTIVE_AI_SESSION', payload: sessionId });
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile: state.profile,
        updateProfile,
        savedCareers: state.savedCareers,
        toggleSavedCareer,
        roadmapProgress: state.roadmapProgress,
        updateRoadmapProgress,
        assessmentScores: state.assessmentScores,
        updateAssessmentScore,

        tasks: state.tasks,
        createTask,
        updateTask,
        toggleTask,
        deleteTask,

        activeGoal: state.activeGoal,
        setTargetGoal,

        assessmentResults: state.assessmentResults,
        saveAssessmentResult,

        mentorBookings: state.mentorBookings,
        saveMentorBooking,
        cancelMentorBooking,

        activities: state.activities,
        recordActivity,

        aiSessions: state.aiSessions,
        activeAiSessionId: state.activeAiSessionId,
        addAiMessage,
        createAiSession,
        setActiveAiSessionId,

        isAuthenticatedStudent,
        isSyncedWithServer,
        isSyncLoading,
        isSyncSaving,
        syncError,
        clearSyncError,
        careersCatalog,
        isCatalogLoading,
        catalogError,
        refreshCareersCatalog,
        skillRecords,
        skillGaps,
        activeRoadmap,
        roadmapsByCareer,
        refreshStudentState,
        updateSkills,
        toggleRoadmapTask,
        completeRoadmapPhase,
        bindAuthSession,
        rawState: state
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
