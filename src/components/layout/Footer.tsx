import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-navy py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 grid gap-8 md:grid-cols-4 text-sm text-slate-400">
        <div className="space-y-4">
          <h4 className="text-white font-semibold">Product</h4>
          <ul className="space-y-2">
            <li><Link to="/career-paths" className="hover:text-white transition-colors">Career Explorer</Link></li>
            <li><Link to="/assessments" className="hover:text-white transition-colors">Assessments</Link></li>
            <li><Link to="/skills" className="hover:text-white transition-colors">Skill Builder</Link></li>
            <li><Link to="/mentors" className="hover:text-white transition-colors">Mentors</Link></li>
            <li><Link to="/opportunities" className="hover:text-white transition-colors">Opportunities</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-white font-semibold">For Institutions</h4>
          <ul className="space-y-2">
            <li><Link to="/partners" className="hover:text-white transition-colors">Partner With Us</Link></li>
            <li><Link to="/course-providers" className="hover:text-white transition-colors">Course Providers</Link></li>
            <li><Link to="/institution-dashboard" className="hover:text-white transition-colors">Institution Dashboard</Link></li>
            <li><Link to="/become-mentor" className="hover:text-white transition-colors">Become a Mentor</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-white font-semibold">Resources</h4>
          <ul className="space-y-2">
            <li><Link to="/guides" className="hover:text-white transition-colors">Career Guides</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link to="/research" className="hover:text-white transition-colors">Research</Link></li>
            <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-white font-semibold">Company</h4>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-white/10 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} PathPilot. All rights reserved.</p>
      </div>
    </footer>
  );
}
