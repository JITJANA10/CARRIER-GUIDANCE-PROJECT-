// PATHPILOT — AUTHENTICATION & AUTHORITATIVE STUDENT STATE HYDRATION CONTEXT
// Directive: PP-MENTOR-DASHBOARD-2026-01 & PP-PHASE-B-DATA-SYNC

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAppContext } from './AppContext';
import { fetchStudentState } from '../services/studentApi';

export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

export interface AuthProfile {
  id: string;
  firstName: string;
  lastName: string;
  targetGoal?: string | null;
  educationLevel?: string | null;
  onboardingCompleted?: boolean;
  streakDays?: number;
  weeklyTargetHours?: number;
  completedHoursThisWeek?: number;
  interests?: string[];
  strengths?: string[];
  savedCareers?: string[];
}

export interface AuthMentorProfile {
  id: string;
  userId?: string | null;
  name: string;
  role: string;
  company: string;
  experience: string;
  industry: string;
  skillsJson?: string;
  price: string;
  rating: number;
  reviews: number;
  bio: string;
  slotsJson?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile?: AuthProfile | null;
  mentorProfile?: AuthMentorProfile | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const API_BASE = 'http://localhost:3001/api/v1';
const TOKEN_KEY = 'pathpilot_token';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { bindAuthSession } = useAppContext();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(token));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
    setUser(null);
    bindAuthSession({ token: null, isStudent: false, studentState: null });
  }, [bindAuthSession]);

  const hydrateForUser = useCallback(
    async (authUser: AuthUser, activeToken: string) => {
      if (authUser.role !== 'STUDENT') {
        bindAuthSession({ token: activeToken, isStudent: false, studentState: null, onUnauthorized: logout });
        return;
      }

      const studentState = await fetchStudentState(activeToken);
      bindAuthSession({
        token: activeToken,
        isStudent: true,
        studentState,
        onUnauthorized: logout
      });
    },
    [bindAuthSession, logout]
  );

  const refreshSession = useCallback(async () => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (!res.ok) {
        logout();
        return;
      }

      const json = await res.json();
      if (json.success && json.data?.user) {
        const fetchedUser: AuthUser = json.data.user;
        setToken(storedToken);
        setUser(fetchedUser);
        await hydrateForUser(fetchedUser, storedToken);
      } else {
        logout();
      }
    } catch {
      // Keep token only when backend is temporarily unreachable; do not fabricate logged-out user state
    } finally {
      setIsLoading(false);
    }
  }, [hydrateForUser, logout]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data?.token || !json.data?.user) {
        const errMsg = json?.error?.message || 'Invalid email or password.';
        throw new Error(errMsg);
      }

      const authenticatedUser: AuthUser = json.data.user;
      const newToken: string = json.data.token;

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, newToken);
      }
      setToken(newToken);
      setUser(authenticatedUser);
      await hydrateForUser(authenticatedUser, newToken);

      return authenticatedUser;
    },
    [hydrateForUser]
  );

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
