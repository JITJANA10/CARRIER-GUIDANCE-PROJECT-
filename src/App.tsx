import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { CareerExplorer } from './pages/CareerExplorer';
import { Assessments } from './pages/Assessments';
import { GapAnalysis } from './pages/GapAnalysis';
import { DailyPlan } from './pages/DailyPlan';
import { Roadmap } from './pages/Roadmap';
import { Mentors } from './pages/Mentors';
import { Placeholder } from './components/Placeholder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/explorer" element={<CareerExplorer />} />
          <Route path="dashboard/assessments" element={<Assessments />} />
          <Route path="dashboard/skills" element={<GapAnalysis />} />
          <Route path="dashboard/routine" element={<DailyPlan />} />
          <Route path="dashboard/roadmap" element={<Roadmap />} />
          <Route path="dashboard/mentors" element={<Mentors />} />
          <Route path="dashboard/*" element={<Placeholder />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
