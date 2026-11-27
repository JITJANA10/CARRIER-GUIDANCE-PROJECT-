import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { LoginModal } from '../auth/LoginModal';
import { useAuth } from '../../context/AuthContext';

export function MainLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isMentorRoute = location.pathname.startsWith('/mentor');
  const showSidebar = isDashboard || (isMentorRoute && user?.role === 'MENTOR');
  const isWorkspace = isDashboard || isMentorRoute;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#111214] text-[#F4F4F5] antialiased">
      {/* Top Navigation */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {showSidebar && (
          <Sidebar 
            mobileOpen={mobileSidebarOpen} 
            onCloseMobile={() => setMobileSidebarOpen(false)} 
          />
        )}
        
        <main className={`flex-1 overflow-y-auto ${isWorkspace ? 'p-3 sm:p-5 lg:p-6' : ''}`}>
          <div className={isWorkspace ? 'max-w-[1600px] mx-auto w-full' : ''}>
            <Outlet />
          </div>
          {!isWorkspace && <Footer />}
        </main>
      </div>

      {/* Global Minimal Login Modal (Email & Password Only) */}
      <LoginModal />
    </div>
  );
}
