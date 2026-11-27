// PATHPILOT — MINIMAL AUTHENTICATION FORM & MODAL (AUTOMATIC ROLE DETECTION)
// Directive: PP-MENTOR-DASHBOARD-2026-01
// Standard: Email + Password only; zero role selectors; automatic DB role redirection

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Lock,
  Mail,
  ArrowRight,
  X,
  AlertCircle,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

interface SignInFormProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function SignInForm({ onClose, showCloseButton = false }: SignInFormProps) {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [adminNoticeUser, setAdminNoticeUser] = useState<string | null>(
    user?.role === 'ADMIN' ? user.email : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setError(null);
    setAdminNoticeUser(null);
    setSubmitting(true);

    try {
      const authenticated = await login(email, password);

      if (authenticated.role === 'STUDENT') {
        onClose?.();
        navigate('/dashboard');
      } else if (authenticated.role === 'MENTOR') {
        onClose?.();
        navigate('/mentor');
      } else if (authenticated.role === 'ADMIN') {
        setAdminNoticeUser(authenticated.email);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOutAdmin = () => {
    logout();
    setAdminNoticeUser(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="bg-[#17191C] border border-[#34383D] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#34383D] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#202327] border border-[#34383D] flex items-center justify-center text-[#8B7CFF]">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4F4F5] leading-tight">Sign In to PathPilot</h3>
            <p className="text-[11px] text-[#71717A]">Role is automatically detected from your account</p>
          </div>
        </div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="text-[#71717A] hover:text-[#F4F4F5] p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Admin Access Notice (When ADMIN logs in) */}
      {adminNoticeUser ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#202327] border border-[#8B7CFF]/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#F4F4F5]">
                <ShieldAlert className="w-4 h-4 text-[#8B7CFF]" />
                Administrative Access Detected
              </span>
              <Badge variant="medium" dot>ADMIN</Badge>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Authenticated cleanly as <span className="text-[#F4F4F5] font-mono">{adminNoticeUser}</span>.
              Your <span className="text-[#8B7CFF] font-semibold">ADMIN</span> role was automatically verified by the backend database.
            </p>
            <p className="text-[11px] text-[#71717A] bg-[#17191C] border border-[#34383D] rounded-lg p-2.5">
              Administrative Access Notice: The dedicated Admin Governance dashboard has not yet been implemented in this release. Governance APIs remain accessible via authenticated admin tokens.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" size="sm" variant="outline" onClick={handleSignOutAdmin} className="gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Switch Account
            </Button>
            {onClose && (
              <Button type="button" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="auth-email" className="text-[11px] text-[#71717A] uppercase font-bold tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pathpilot.io"
                className="w-full bg-[#202327] border border-[#34383D] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#8B7CFF] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="text-[11px] text-[#71717A] uppercase font-bold tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                id="auth-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#202327] border border-[#34383D] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#8B7CFF] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#34383D]">
            {showCloseButton && onClose && (
              <Button type="button" size="sm" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
              {submitting ? 'Authenticating...' : 'Sign In'}
              {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();

  if (!isLoginModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sign In"
    >
      <SignInForm onClose={closeLoginModal} showCloseButton />
    </div>
  );
}
