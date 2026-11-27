import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

// Route-based code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const CareerExplorer = lazy(() => import('./pages/CareerExplorer').then(m => ({ default: m.CareerExplorer })));
const Assessments = lazy(() => import('./pages/Assessments').then(m => ({ default: m.Assessments })));
const GapAnalysis = lazy(() => import('./pages/GapAnalysis').then(m => ({ default: m.GapAnalysis })));
const DailyPlan = lazy(() => import('./pages/DailyPlan').then(m => ({ default: m.DailyPlan })));
const Roadmap = lazy(() => import('./pages/Roadmap').then(m => ({ default: m.Roadmap })));
const Mentors = lazy(() => import('./pages/Mentors').then(m => ({ default: m.Mentors })));
const AIMentor = lazy(() => import('./pages/AIMentor').then(m => ({ default: m.AIMentor })));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard').then(m => ({ default: m.MentorDashboard })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const Placeholder = lazy(() => import('./components/Placeholder').then(m => ({ default: m.Placeholder })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[450px] w-full" role="status" aria-label="Loading content">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#34383D] border-t-[#8B7CFF] animate-spin" />
        <span className="text-xs text-[#71717A] font-medium tracking-wide">Initializing workspace...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={
            <Suspense fallback={<PageFallback />}>
              <LandingPage />
            </Suspense>
          } />
          <Route path="onboarding" element={
            <Suspense fallback={<PageFallback />}>
              <Onboarding />
            </Suspense>
          } />
          <Route path="login" element={
            <Suspense fallback={<PageFallback />}>
              <LoginPage />
            </Suspense>
          } />
          <Route path="mentor" element={
            <Suspense fallback={<PageFallback />}>
              <MentorDashboard />
            </Suspense>
          } />
          <Route path="dashboard" element={
            <Suspense fallback={<PageFallback />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="dashboard/explorer" element={
            <Suspense fallback={<PageFallback />}>
              <CareerExplorer />
            </Suspense>
          } />
          <Route path="dashboard/assessments" element={
            <Suspense fallback={<PageFallback />}>
              <Assessments />
            </Suspense>
          } />
          <Route path="dashboard/skills" element={
            <Suspense fallback={<PageFallback />}>
              <GapAnalysis />
            </Suspense>
          } />
          <Route path="dashboard/routine" element={
            <Suspense fallback={<PageFallback />}>
              <DailyPlan />
            </Suspense>
          } />
          <Route path="dashboard/roadmap" element={
            <Suspense fallback={<PageFallback />}>
              <Roadmap />
            </Suspense>
          } />
          <Route path="dashboard/ai-mentor" element={
            <Suspense fallback={<PageFallback />}>
              <AIMentor />
            </Suspense>
          } />
          <Route path="dashboard/mentors" element={
            <Suspense fallback={<PageFallback />}>
              <Mentors />
            </Suspense>
          } />
          <Route path="dashboard/*" element={
            <Suspense fallback={<PageFallback />}>
              <Placeholder />
            </Suspense>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
