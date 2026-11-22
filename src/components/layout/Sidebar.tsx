import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Compass, Brain, Map, GraduationCap, 
  Zap, Gamepad2, Users, TestTube2, Calendar, 
  TrendingUp, FileText, Briefcase, FileSignature, 
  Bell, Sparkles 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Compass, label: 'Career Explorer', path: '/dashboard/explorer' },
  { icon: Brain, label: 'Assessments', path: '/dashboard/assessments' },
  { icon: Zap, label: 'Skill Gap Engine', path: '/dashboard/skills' },
  { icon: Map, label: 'Career Roadmap', path: '/dashboard/roadmap' },
  { icon: Calendar, label: 'My Routine', path: '/dashboard/routine' },
  { icon: Users, label: 'Mentorship Hub', path: '/dashboard/mentors', className: "text-brand-violet font-bold" },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-background/50 backdrop-blur-sm h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/5",
              isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200",
              item.className
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
