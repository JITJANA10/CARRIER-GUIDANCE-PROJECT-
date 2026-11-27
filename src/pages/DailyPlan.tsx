import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Battery, 
  SlidersHorizontal, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Code, 
  Layers, 
  RefreshCw, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { useAppContext } from '../context/AppContext';

type Task = {
  id: string;
  title: string;
  time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reason: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'todo' | 'done';
  type: 'skill' | 'project' | 'review' | 'soft-skill';
};

export function DailyPlan() {
  const { profile } = useAppContext();
  const [availableHours, setAvailableHours] = useState(2.5);
  const [mode, setMode] = useState<'normal' | 'tired' | 'project' | 'exam'>('normal');
  const [tasks, setTasks] = useState<Task[]>([]);

  const generatePlan = (hours: number, currentMode: 'normal' | 'tired' | 'project' | 'exam') => {
    const totalMins = Math.round(hours * 60);
    const newTasks: Task[] = [];

    if (currentMode === 'tired') {
      newTasks.push(
        { id: '1', title: 'Passive Concept Review: Product Metrics Flashcards', time: 15, difficulty: 'Easy', reason: 'Low cognitive load review of retention & churn formulas.', impact: 'Low', status: 'todo', type: 'review' },
        { id: '2', title: 'Watch Industry Case Study: How Stripe Designs APIs', time: Math.min(30, totalMins - 15), difficulty: 'Easy', reason: 'Passive absorption while mental energy is depleted.', impact: 'Medium', status: 'todo', type: 'soft-skill' }
      );
    } else if (currentMode === 'project') {
      newTasks.push(
        { id: '1', title: 'Deep Work Block: Build SQL Retention Model', time: totalMins - 20, difficulty: 'Hard', reason: 'Uninterrupted focus on primary portfolio deliverable.', impact: 'Critical', status: 'todo', type: 'project' },
        { id: '2', title: 'Code Commit & Documentation Update', time: 20, difficulty: 'Medium', reason: 'Ensure repository documentation reflects new schema queries.', impact: 'High', status: 'todo', type: 'review' }
      );
    } else if (currentMode === 'exam') {
      newTasks.push(
        { id: '1', title: 'Academic / Certification Exam Prep', time: Math.floor(totalMins * 0.75), difficulty: 'Hard', reason: 'Highest immediate priority for credentialing.', impact: 'Critical', status: 'todo', type: 'skill' },
        { id: '2', title: 'Light Industry Newsletter Skim', time: Math.floor(totalMins * 0.25), difficulty: 'Easy', reason: 'Maintain slight background momentum without burnout.', impact: 'Low', status: 'todo', type: 'review' }
      );
    } else {
      // Normal balanced mode
      let remaining = totalMins;
      const t1Time = Math.min(45, Math.floor(totalMins * 0.4));
      newTasks.push({ id: '1', title: 'SQL Joins & Multi-Table Aggregations', time: t1Time, difficulty: 'Medium', reason: 'Closes your highest priority technical gap.', impact: 'Critical', status: 'todo', type: 'skill' });
      remaining -= t1Time;

      if (remaining >= 35) {
        newTasks.push({ id: '2', title: 'PRD Drafting: Spotify Social Queue Feature', time: 35, difficulty: 'Hard', reason: 'Applies strategic prioritization into written artifact.', impact: 'High', status: 'todo', type: 'project' });
        remaining -= 35;
      }

      if (remaining >= 20) {
        newTasks.push({ id: '3', title: 'Executive Communication Practice', time: 20, difficulty: 'Medium', reason: 'Sharpens elevator pitch for stakeholder alignment.', impact: 'Medium', status: 'todo', type: 'soft-skill' });
        remaining -= 20;
      }

      if (remaining > 0) {
        newTasks.push({ id: '4', title: 'Daily Retrospective & Roadmap Check-in', time: remaining, difficulty: 'Easy', reason: 'Log achievements and review progress milestones.', impact: 'Low', status: 'todo', type: 'review' });
      }
    }

    setTasks(newTasks);
  };

  useEffect(() => {
    generatePlan(availableHours, mode);
  }, [availableHours, mode]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t));
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const completedMins = tasks.filter(t => t.status === 'done').reduce((acc, t) => acc + t.time, 0);
  const totalMins = tasks.reduce((acc, t) => acc + t.time, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F4F4F5] tracking-tight">
            Daily Planner
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Adaptive, energy-calibrated micro-task execution engine.
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-2 p-1.5 px-3 rounded-lg bg-[#202327] border border-[#34383D] text-xs">
          <span className="text-[#71717A]">Today:</span>
          <span className="font-mono font-bold text-[#75D69A]">{completedMins} / {totalMins} mins</span>
          <span className="text-[#71717A]">({completedCount}/{tasks.length} done)</span>
        </div>
      </div>

      {/* Control Panel: Hours & Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Hours Selector */}
        <Card className="p-4 bg-[#202327] border-[#34383D]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#F4F4F5] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B7CFF]" /> Available Study Time
            </span>
            <span className="text-xs font-mono font-bold text-[#8B7CFF]">{availableHours} Hours</span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 1.5, 2, 2.5, 3, 4].map(h => (
              <button
                key={h}
                onClick={() => setAvailableHours(h)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  availableHours === h
                    ? 'bg-[#8B7CFF] text-white font-bold shadow-sm'
                    : 'bg-[#17191C] text-[#A1A1AA] border border-[#34383D] hover:text-white'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </Card>

        {/* Energy State Selector */}
        <Card className="p-4 bg-[#202327] border-[#34383D]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#F4F4F5] flex items-center gap-2">
              <Battery className="w-4 h-4 text-[#75D69A]" /> Mental Energy State
            </span>
            <span className="text-[11px] text-[#71717A] capitalize">{mode} Mode</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'normal', label: 'Balanced' },
              { id: 'tired', label: 'Low Energy' },
              { id: 'project', label: 'Deep Work' },
              { id: 'exam', label: 'Exam Focus' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`py-1.5 rounded-lg text-xs font-medium transition-colors text-center ${
                  mode === m.id
                    ? 'bg-[#26292E] text-white border border-[#34383D] shadow-sm font-semibold'
                    : 'bg-[#17191C] text-[#71717A] border border-[#34383D] hover:text-[#A1A1AA]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Task Checklist Timeline */}
      <div className="space-y-3">
        {tasks.map((task, idx) => (
          <Card 
            key={task.id} 
            onClick={() => toggleTask(task.id)}
            className={`p-4 bg-[#202327] border-[#34383D] hover:border-[#4a5057] cursor-pointer transition-all ${
              task.status === 'done' ? 'opacity-65' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <button className="mt-0.5 text-[#75D69A] shrink-0">
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 fill-[#75D69A]/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#71717A]" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${task.status === 'done' ? 'line-through text-[#71717A]' : 'text-[#F4F4F5]'}`}>
                      {task.title}
                    </span>
                    <Badge variant={task.impact === 'Critical' ? 'critical' : task.impact === 'High' ? 'high' : 'medium'} dot>
                      {task.impact}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {task.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-[#A1A1AA] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#71717A]" /> {task.time}m
                </span>
                <Badge variant="skill" className="capitalize text-[10px]">
                  {task.difficulty}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
