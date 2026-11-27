// PATHPILOT — UNIFIED STATE DATA CONTRACTS
// Directive: PP-FE-PHASE-01
// Standard: Strongly typed, local-first centralized schema

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  educationLevel: string; // Used as current role/title throughout prototype
  interests: string[];
  strengths: string[];
  goal: string | null;
  onboardingCompleted: boolean;
  avatar?: string;
  streakDays?: number;
  weeklyTargetHours?: number;
  completedHoursThisWeek?: number;
}

export type TaskDifficulty = 'Easy' | 'Medium' | 'Hard';
export type TaskImpact = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory = 'skill' | 'project' | 'review' | 'soft-skill';

export interface DailyTask {
  id: string;
  title: string;
  desc?: string;
  time: number; // Duration in minutes
  difficulty?: TaskDifficulty;
  reason?: string;
  impact?: TaskImpact;
  status: TaskStatus;
  type?: TaskCategory;
  role?: string;
  tag?: string;
  linkedCareer?: string;
  createdAt: string;
  completedAt?: string;
}

export interface RoadmapTask {
  id: string;
  name: string;
  type: 'learn' | 'project' | 'task';
  time: string;
  status?: 'todo' | 'done';
}

export interface RoadmapPhase {
  id: string;
  number: string;
  title: string;
  goal: string;
  status: 'completed' | 'active' | 'locked';
  skills: string[];
  estimatedTime: string;
  difficulty: TaskDifficulty;
  why: string;
  dependencies: string;
  outcome: string;
  tasks: RoadmapTask[];
}

export interface CareerRequirement {
  name: string;
  targetScore: number;
  time: string;
  resource: string;
  project: string;
  impact: TaskImpact;
  category: 'Technical' | 'Product' | 'Leadership';
}

export interface CareerSpec {
  id: string;
  title: string;
  category: 'Engineering' | 'Product & Data' | 'Security & Cloud';
  salaryRange: string;
  hiringGrowth: string;
  description: string;
  primarySkills: string[];
  topEmployers: string[];
  requirements?: Record<string, CareerRequirement>;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  scorePercentage: number;
  completedAt: string;
  skillGains: Record<string, number>;
  metrics?: {
    wpm?: number;
    accuracy?: number;
    correctAnswers?: number;
    totalQuestions?: number;
  };
}

export interface MentorBooking {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorRole: string;
  scheduledTime: string;
  topic?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'task_completed' | 'task_created' | 'assessment_taken' | 'goal_updated' | 'mentor_booked' | 'roadmap_advanced';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AIChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export interface AIChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIChatMessage[];
}

export type SkillClassification = 'VERIFIED' | 'DEVELOPING' | 'WEAK';

export interface StudentSkillRecord {
  skillKey: string;
  name: string;
  score: number;
  classification: SkillClassification;
  careerSlug: string | null;
  updatedAt: string;
}

export interface SkillUpdateItem {
  name: string;
  score: number;
  careerSlug?: string | null;
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

export interface StudentRoadmapPhase extends RoadmapPhase {
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
  phases: StudentRoadmapPhase[];
}

export interface RoadmapSummaryItem {
  careerSlug: string;
  currentPhaseId: string;
  completedPhases: string[];
  completedTasks: string[];
  updatedAt: string;
}

export interface RoadmapUpdatePayload {
  careerSlug?: string;
  toggleTaskId?: string;
  completed?: boolean;
  completePhaseId?: string;
  currentPhaseId?: string;
  completedTasks?: string[];
  completedPhases?: string[];
}

export interface CareerCatalogSkillRequirement {
  name: string;
  requiredScore: number;
  time: string;
  resource: string;
  project: string;
  category: 'Technical' | 'Product' | 'Leadership';
}

export interface CareerCatalogItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  salaryRange: string;
  growthRate: string;
  description: string;
  demand: 'Very High' | 'High' | 'Medium';
  openings: string;
  primarySkills: string[];
  skillRequirements: CareerCatalogSkillRequirement[];
  activeRoadmap: {
    id: string;
    version: string;
    phases: RoadmapPhase[];
  } | null;
}

export interface ServerStudentProfile {
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

export interface ServerStudentState {
  profile: ServerStudentProfile;
  skills: StudentSkillRecord[];
  skillMap: Record<string, number>;
  skillGaps: SkillGapSummary;
  activeRoadmap: StudentRoadmapState | null;
  roadmapsByCareer: RoadmapSummaryItem[];
}

export interface AppState {
  version: number;
  updatedAt: number;
  profile: UserProfile;
  savedCareers: string[];
  tasks: DailyTask[];
  activeGoal: string | null;
  roadmapProgress: Record<string, string>;
  roadmapPhases?: RoadmapPhase[];
  assessmentScores: Record<string, number>;
  assessmentResults: AssessmentResult[];
  mentorBookings: MentorBooking[];
  activities: ActivityEvent[];
  aiSessions: AIChatSession[];
  activeAiSessionId: string;
}
