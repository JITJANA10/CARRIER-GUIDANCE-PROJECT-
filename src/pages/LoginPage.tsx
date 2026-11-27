// PATHPILOT — DEDICATED SIGN IN PAGE (/login)
// Directive: PP-MENTOR-DASHBOARD-2026-01

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInForm } from '../components/auth/LoginModal';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'STUDENT') navigate('/dashboard', { replace: true });
      if (user.role === 'MENTOR') navigate('/mentor', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-[#111214]">
      <SignInForm />
    </div>
  );
}
