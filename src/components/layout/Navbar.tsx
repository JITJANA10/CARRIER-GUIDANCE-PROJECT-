import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Search, 
  Bell, 
  Settings, 
  Menu, 
  Sparkles,
  Command,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Career Intelligence & Real-time Progress' },
  '/dashboard/explorer': { title: 'Career Explorer', subtitle: 'Market Analysis & Industry Pathways' },
  '/dashboard/assessments': { title: 'Assessments', subtitle: 'Psychometric & Skill Benchmarks' },
  '/dashboard/skills': { title: 'Skill Gap Engine', subtitle: 'Target Competencies & Bottlenecks' },
  '/dashboard/routine': { title: 'Daily Planner', subtitle: 'Adaptive Task Execution & Routine' },
  '/dashboard/roadmap': { title: 'Career Roadmap', subtitle: 'Milestone Execution & Phase Unlocks' },
  '/dashboard/ai-mentor': { title: 'AI Mentor', subtitle: '24/7 Strategic Career Co-pilot' },
  '/dashboard/mentors': { title: 'Mentorship Hub', subtitle: 'PathPilot Mentors' },
  '/mentor': { title: 'Mentor Dashboard', subtitle: 'Incoming Requests, Confirmed Sessions & Profile' },
};

export function Navbar({ onToggleMobileSidebar }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAppContext();
  const { user, openLoginModal, logout } = useAuth();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isMentorPortal = location.pathname.startsWith('/mentor');
  const isWorkspace = isDashboard || isMentorPortal;

  const currentPage = pageTitles[location.pathname] || { title: 'PathPilot', subtitle: 'Career OS' };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : profile.firstName
      ? profile.firstName.charAt(0).toUpperCase()
      : 'M';

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-[#34383D] bg-[#17191C]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title / Brand */}
      <div className="flex items-center gap-3">
        {isWorkspace && (
          <button 
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#202327] border border-[#34383D]"
            aria-label="Toggle menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {!isWorkspace ? (
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#202327] border border-[#34383D] flex items-center justify-center text-[#8B7CFF] group-hover:border-[#8B7CFF]/50 transition-colors shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#F4F4F5] flex items-center gap-2">
              PathPilot
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30">OS</span>
            </span>
          </Link>
        ) : (
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-[#F4F4F5] leading-none">
              {currentPage.title}
            </h1>
            <span className="hidden sm:inline-block text-[11px] text-[#71717A] mt-1 font-medium">
              {currentPage.subtitle}
            </span>
          </div>
        )}
      </div>

      {/* Center: Non-dashboard public links */}
      {!isWorkspace && (
        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#A1A1AA]">
          <Link to="/dashboard" className="hover:text-[#F4F4F5] transition-colors">Dashboard</Link>
          <Link to="/dashboard/explorer" className="hover:text-[#F4F4F5] transition-colors">Careers</Link>
          <Link to="/dashboard/skills" className="hover:text-[#F4F4F5] transition-colors">Skill Engine</Link>
          <Link to="/dashboard/roadmap" className="hover:text-[#F4F4F5] transition-colors">Roadmap</Link>
          <Link to="/dashboard/ai-mentor" className="text-[#8B7CFF] hover:text-[#8B7CFF]/80 transition-colors flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Mentor
          </Link>
        </div>
      )}

      {/* Right: Search, Utilities & Action */}
      <div className="flex items-center gap-2.5">
        {isWorkspace ? (
          <>
            {/* Search Input bar */}
            <div className="relative hidden md:block w-52 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input 
                type="text" 
                placeholder="Search..."
                aria-label="Search across PathPilot"
                className="w-full bg-[#202327] border border-[#34383D] rounded-lg pl-8 pr-10 py-1.5 text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#8B7CFF] transition-colors"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-[#71717A] bg-[#26292E] border border-[#34383D] px-1 py-0.2 rounded font-mono">
                <span>⌘</span>K
              </div>
            </div>

            {/* Notifications Button */}
            <button 
              className="relative p-2 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#202327] border border-[#34383D] transition-colors"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#8B7CFF]" />
            </button>

            {/* Quick Action */}
            {isMentorPortal ? (
              <Badge variant="expert" dot className="hidden sm:inline-flex">
                MENTOR
              </Badge>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/dashboard/routine')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs border-[#34383D]"
              >
                Today's Routine
              </Button>
            )}

            {/* Auth Sign In / Sign Out Control */}
            {user ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                title={`Signed in as ${user.email} (${user.role}) — Sign Out`}
                aria-label="Sign out"
                className="gap-1.5 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={openLoginModal}
                className="text-xs"
              >
                Sign In
              </Button>
            )}

            {/* User Avatar */}
            <div 
              onClick={() => navigate(isMentorPortal ? '/mentor' : '/onboarding')} 
              className="w-8 h-8 rounded-full bg-[#8B7CFF]/20 border border-[#8B7CFF]/40 flex items-center justify-center font-bold text-xs text-[#8B7CFF] cursor-pointer hover:border-[#8B7CFF] transition-colors"
              title={user ? `${user.name} (${user.role})` : 'Profile Settings'}
              aria-label="User profile and settings"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(isMentorPortal ? '/mentor' : '/onboarding')}
            >
              {avatarInitial}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(user.role === 'MENTOR' ? '/mentor' : '/dashboard')}
                >
                  {user.role === 'MENTOR' ? 'Mentor Portal' : 'Dashboard'}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={openLoginModal}>
                  Sign In
                </Button>
                <Button size="sm" asChild className="gap-1.5">
                  <Link to="/onboarding">Get Started <ArrowRight className="w-3.5 h-3.5" /></Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
