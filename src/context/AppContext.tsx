import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface UserProfile {
  firstName: string;
  lastName: string;
  educationLevel: string;
  interests: string[];
  strengths: string[];
  goal: string | null;
  onboardingCompleted: boolean;
}

interface AppContextType {
  profile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;
  savedCareers: string[];
  toggleSavedCareer: (careerId: string) => void;
  roadmapProgress: Record<string, string>;
  updateRoadmapProgress: (taskId: string, status: string) => void;
  assessmentScores: Record<string, number>;
  updateAssessmentScore: (assessmentId: string, score: number) => void;
}

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  educationLevel: 'University / College Student',
  interests: [],
  strengths: [],
  goal: null,
  onboardingCompleted: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [savedCareers, setSavedCareers] = useState<string[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState<Record<string, string>>({});
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});

  // Fetch initial state from backend
  useEffect(() => {
    fetch('http://localhost:3001/api/state')
      .then(res => res.json())
      .then(data => {
        if (data.profile) setProfile(data.profile);
        if (data.savedCareers) setSavedCareers(data.savedCareers);
        if (data.roadmapProgress) setRoadmapProgress(data.roadmapProgress);
        if (data.assessmentScores) setAssessmentScores(data.assessmentScores);
      })
      .catch(err => console.error('Failed to fetch state', err));
  }, []);

  // Generic sync function
  const syncState = (newState: any) => {
    fetch('http://localhost:3001/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newState)
    }).catch(err => console.error('Failed to sync state', err));
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...data };
      syncState({ profile: updated });
      return updated;
    });
  };

  const toggleSavedCareer = (careerId: string) => {
    setSavedCareers(prev => {
      const updated = prev.includes(careerId) ? prev.filter(id => id !== careerId) : [...prev, careerId];
      syncState({ savedCareers: updated });
      return updated;
    });
  };

  const updateRoadmapProgress = (taskId: string, status: string) => {
    setRoadmapProgress(prev => {
      const updated = { ...prev, [taskId]: status };
      syncState({ roadmapProgress: updated });
      return updated;
    });
  };

  const updateAssessmentScore = (assessmentId: string, score: number) => {
    setAssessmentScores(prev => {
      const updated = { ...prev, [assessmentId]: score };
      syncState({ assessmentScores: updated });
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{
      profile, updateProfile,
      savedCareers, toggleSavedCareer,
      roadmapProgress, updateRoadmapProgress,
      assessmentScores, updateAssessmentScore
    }}>
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
