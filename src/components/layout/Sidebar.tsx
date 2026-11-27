import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  BrainCircuit, 
  Zap, 
  CalendarCheck, 
  Map, 
  Sparkles, 
  Users, 
  Bell, 
  Settings, 
  ChevronRight,
  TrendingUp,
  Search,
  Menu,
  X,
  Inbox,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badge: null },
  { icon: Compass, label: 'Career Explorer', path: '/dashboard/explorer', badge: null },
  { icon: BrainCircuit, label: 'Assessments', path: '/dashboard/assessments', badge: 'New' },
  { icon: Zap, label: 'Skill Gap Engine', path: '/dashboard/skills', badge: null },
  { icon: CalendarCheck, label: 'Daily Planner', path: '/dashboard/routine', badge: null },
  { icon: Map, label: 'Career Roadmap', path: '/dashboard/roadmap', badge: null },
  { icon: Sparkles, label: 'AI Mentor', path: '/dashboard/ai-mentor', badge: 'AI', accent: true },
  { icon: Users, label: 'Mentorship Hub', path: '/dashboard/mentors', badge: null },
];

const mentorNavItems = [
  { icon: LayoutDashboard, label: 'Overview', anchor: 'overview', badge: null },
  { icon: Inbox, label: 'Booking Requests', anchor: 'requests', badge: null },
  { icon: Calendar, label: 'Upcoming Sessions', anchor: 'upcoming', badge: null },
  { icon: UserCheck, label: 'Mentor Profile', anchor: 'profile', badge: 'DEMO', accent: true },
];

export function Sidebar({ mobileOpen = false, onCloseMobile }: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const { profile } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMentorPortal = location.pathname.startsWith('/mentor');

  const scrollToMentorSection = (sectionId: string) => {
    onCloseMobile?.();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/mentor');
    }
  };

  const displayName = user?.name
    ? user.name
    : profile.firstName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : 'PathPilot Student';
  const displaySubtitle = user?.role === 'MENTOR'
    ? 'DEMO MENTOR'
    : profile.goal || 'No target goal set';
  const displayInitial = displayName.charAt(0).toUpperCase();

  const weeklyCompleted = profile.completedHoursThisWeek ?? 0;
  const weeklyTarget = Math.max(1, profile.weeklyTargetHours ?? 10);
  const weeklyPercent = Math.min(100, Math.round((weeklyCompleted / weeklyTarget) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity" 
        />
      )}

      {/* Sidebar Rail / Panel */}
      <aside 
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#17191C] border-r border-[#34383D] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top: Logo & Brand */}
        <div className="flex flex-col">
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#34383D]">
            <div 
              onClick={() => { navigate(isMentorPortal ? '/mentor' : '/dashboard'); onCloseMobile?.(); }} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#202327] border border-[#34383D] flex items-center justify-center text-[#8B7CFF] group-hover:border-[#8B7CFF]/50 transition-colors shadow-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-[#F4F4F5] group-hover:text-white flex items-center gap-1.5">
                  PathPilot
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30">PRO</span>
                </span>
                <span className="text-[10px] text-[#71717A] tracking-wider uppercase font-medium">
                  {isMentorPortal ? 'Mentor Portal' : 'Career OS'}
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button 
              onClick={onCloseMobile} 
              className="lg:hidden text-[#A1A1AA] hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
              {isMentorPortal ? 'Mentor Workspace' : 'Navigation'}
            </div>

            {isMentorPortal ? (
              mentorNavItems.map((item) => (
                <button
                  key={item.anchor}
                  type="button"
                  onClick={() => scrollToMentorSection(item.anchor)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#202327] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={cn(
                      "w-4 h-4 transition-colors",
                      item.accent ? "text-[#8B7CFF]" : "text-[#71717A] group-hover:text-[#75D69A]"
                    )} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))
            ) : (
              navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) => cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                    isActive
                      ? "bg-[#26292E] text-[#F4F4F5] border border-[#34383D] shadow-sm font-semibold"
                      : "text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#202327]"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <item.icon className={cn(
                          "w-4 h-4 transition-colors",
                          item.accent ? "text-[#8B7CFF]" : isActive ? "text-[#75D69A]" : "text-[#71717A] group-hover:text-[#A1A1AA]"
                        )} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide",
                          item.accent 
                            ? "bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30" 
                            : "bg-[#75D69A]/15 text-[#75D69A] border border-[#75D69A]/30"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))
            )}
          </nav>
        </div>

        {/* Bottom Section: User Profile & Utility */}
        <div className="p-3 border-t border-[#34383D] space-y-2">
          {/* Quick stats mini-row */}
          {!isMentorPortal && (
            <div className="bg-[#202327] border border-[#34383D] rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#71717A] uppercase font-medium">Weekly Goal</span>
                <span className="text-xs font-semibold text-[#F4F4F5]">{weeklyCompleted}h / {weeklyTarget}h</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#75D69A] flex items-center justify-center text-[10px] font-bold text-[#75D69A]">
                {weeklyPercent}%
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div 
            onClick={() => { navigate(isMentorPortal ? '/mentor' : '/onboarding'); onCloseMobile?.(); }}
            className="flex items-center gap-3 p-2 rounded-lg bg-[#202327]/60 hover:bg-[#202327] border border-transparent hover:border-[#34383D] cursor-pointer transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#8B7CFF]/20 border border-[#8B7CFF]/40 flex items-center justify-center font-bold text-xs text-[#8B7CFF]">
                {displayInitial}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#75D69A] ring-2 ring-[#17191C]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F4F4F5] truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-[#71717A] truncate">
                {displaySubtitle}
              </p>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
          </div>
        </div>
      </aside>
    </>
  );
}
