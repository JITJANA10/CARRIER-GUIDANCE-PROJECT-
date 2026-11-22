import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function MainLayout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-brand-blue/30 selection:text-white">
      <Navbar />
      <div className="flex-1 flex overflow-hidden relative">
        {isDashboard && <Sidebar />}
        <main className={`flex-1 overflow-y-auto ${isDashboard ? 'p-4 md:p-8' : ''}`}>
          <Outlet />
          {!isDashboard && <Footer />}
        </main>
      </div>
    </div>
  );
}
