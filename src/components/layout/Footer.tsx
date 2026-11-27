import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-[#34383D] bg-[#17191C] py-12 text-xs text-[#A1A1AA]">
      <div className="container mx-auto px-4 md:px-8 grid gap-8 grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <h4 className="text-[#F4F4F5] font-semibold text-xs tracking-wider uppercase">Platform</h4>
          <ul className="space-y-2">
            <li><Link to="/dashboard/explorer" className="hover:text-white transition-colors">Career Explorer</Link></li>
            <li><Link to="/dashboard/assessments" className="hover:text-white transition-colors">Assessments</Link></li>
            <li><Link to="/dashboard/skills" className="hover:text-white transition-colors">Skill Gap Engine</Link></li>
            <li><Link to="/dashboard/roadmap" className="hover:text-white transition-colors">Milestone Roadmaps</Link></li>
            <li><Link to="/dashboard/ai-mentor" className="hover:text-white transition-colors text-[#8B7CFF]">AI Mentor</Link></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-[#F4F4F5] font-semibold text-xs tracking-wider uppercase">Ecosystem</h4>
          <ul className="space-y-2">
            <li><Link to="/dashboard/mentors" className="hover:text-white transition-colors">Mentorship Network</Link></li>
            <li><Link to="/dashboard/routine" className="hover:text-white transition-colors">Daily Planner</Link></li>
            <li><Link to="/onboarding" className="hover:text-white transition-colors">Career Questionnaire</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Intelligence Hub</Link></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-[#F4F4F5] font-semibold text-xs tracking-wider uppercase">Methodology</h4>
          <ul className="space-y-2">
            <li><span className="text-[#71717A]">01. Discover Yourself</span></li>
            <li><span className="text-[#71717A]">02. Choose Direction</span></li>
            <li><span className="text-[#71717A]">03. Build Skills</span></li>
            <li><span className="text-[#71717A]">04. Gain Experience</span></li>
            <li><span className="text-[#71717A]">05. Launch Career</span></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-[#F4F4F5] font-semibold text-xs tracking-wider uppercase">PathPilot OS</h4>
          <p className="text-[11px] text-[#71717A] leading-relaxed">
            The AI-augmented career navigational operating system designed to bridge academic ambiguity and high-earning industry readiness.
          </p>
          <p className="text-[11px] text-[#71717A] pt-2">
            "Your Future. Mapped Personally."
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-8 mt-8 pt-6 border-t border-[#34383D] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#71717A] text-[11px]">
        <p>&copy; {new Date().getFullYear()} PathPilot. All rights reserved.</p>
        <p>Built with React 19, TypeScript & Vite.</p>
      </div>
    </footer>
  );
}
