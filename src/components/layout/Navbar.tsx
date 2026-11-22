import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Compass } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-brand-cyan" />
          <span className="text-xl font-bold tracking-tight text-white">PathPilot</span>
        </Link>
        
        {!isDashboard && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/dashboard/assessments" className="hover:text-white transition-colors">Discover</Link>
            <Link to="/dashboard/explorer" className="hover:text-white transition-colors">Career Paths</Link>
            <Link to="/dashboard/education" className="hover:text-white transition-colors">Education</Link>
            <Link to="/dashboard/skills" className="hover:text-white transition-colors">Skills</Link>
            <Link to="/dashboard/mentors" className="hover:text-white transition-colors">Mentors</Link>
            <Link to="/dashboard/opportunities" className="hover:text-white transition-colors">Opportunities</Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {isDashboard ? (
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Notifications</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center font-semibold">
                  A
                </div>
             </div>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex">Log In</Button>
              <Button asChild className="shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all">
                <Link to="/onboarding">Get Started →</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
