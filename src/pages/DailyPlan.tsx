import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, SlidersHorizontal, Battery, Book, Trophy, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

type Task = {
  id: string;
  title: string;
  time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reason: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'todo' | 'done' | 'missed';
  type: 'skill' | 'project' | 'review' | 'soft-skill';
};

export function DailyPlan() {
  const { profile } = useAppContext();
  
  const [availableHours, setAvailableHours] = useState(2);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Simulation of intelligent task generation based on constraints
  const generatePlan = (hours: number, mode: 'normal' | 'tired' | 'project' | 'exam' = 'normal') => {
    let totalMins = hours * 60;
    let newTasks: Task[] = [];
    
    if (mode === 'tired') {
      newTasks = [
        { id: '1', title: 'Review Flashcards', time: 15, difficulty: 'Easy', reason: 'Low cognitive load review of core concepts.', impact: 'Low', status: 'todo', type: 'review' },
        { id: '2', title: 'Watch Industry Talk', time: Math.min(30, totalMins - 15), difficulty: 'Easy', reason: 'Passive learning while energy is low.', impact: 'Medium', status: 'todo', type: 'soft-skill' }
      ];
    } else if (mode === 'project') {
      newTasks = [
        { id: '1', title: 'Deep Work: Capstone Project', time: totalMins - 15, difficulty: 'Hard', reason: 'Focused time to build your portfolio.', impact: 'Critical', status: 'todo', type: 'project' },
        { id: '2', title: 'Project Review & Commit', time: 15, difficulty: 'Medium', reason: 'Ensure work is saved and documented.', impact: 'High', status: 'todo', type: 'review' }
      ];
    } else if (mode === 'exam') {
      newTasks = [
        { id: '1', title: 'Exam Prep: Core Subjects', time: Math.floor(totalMins * 0.8), difficulty: 'Hard', reason: 'Immediate academic priority.', impact: 'High', status: 'todo', type: 'skill' },
        { id: '2', title: 'Light Career Reading', time: Math.floor(totalMins * 0.2), difficulty: 'Easy', reason: 'Maintain slight career momentum.', impact: 'Low', status: 'todo', type: 'review' }
      ];
    } else {
      // Normal balanced mode
      let timeRemaining = totalMins;
      
      const skillTime = Math.floor(totalMins * 0.4);
      newTasks.push({ id: '1', title: 'SQL Practice', time: skillTime, difficulty: 'Medium', reason: 'Closes your biggest technical gap.', impact: 'Critical', status: 'todo', type: 'skill' });
      timeRemaining -= skillTime;
      
      if (timeRemaining >= 40) {
        newTasks.push({ id: '2', title: 'Project Work', time: Math.floor(totalMins * 0.3), difficulty: 'Hard', reason: 'Applies skills to portfolio.', impact: 'High', status: 'todo', type: 'project' });
        timeRemaining -= Math.floor(totalMins * 0.3);
      }
      
      if (timeRemaining >= 20) {
        newTasks.push({ id: '3', title: 'Communication Practice', time: 15, difficulty: 'Medium', reason: 'Crucial soft skill for your target role.', impact: 'Medium', status: 'todo', type: 'soft-skill' });
        timeRemaining -= 15;
      }
      
      newTasks.push({ id: '4', title: 'Career Progress Review', time: timeRemaining, difficulty: 'Easy', reason: 'Reflect on daily learnings.', impact: 'Low', status: 'todo', type: 'review' });
    }
    
    setTasks(newTasks);
    setIsAdjusting(false);
  };

  useEffect(() => {
    generatePlan(availableHours);
  }, []); // Run once on mount

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        // If missed, intelligently reschedule (simulate by resetting to todo for tomorrow, but here just mark todo)
        return { ...t, status: t.status === 'done' ? 'todo' : 'done' };
      }
      return t;
    }));
  };

  const handleAdjust = (type: string) => {
    if (type === 'less') {
      const newHours = Math.max(0.5, availableHours - 0.5);
      setAvailableHours(newHours);
      generatePlan(newHours);
    } else if (type === 'more') {
      const newHours = availableHours + 0.5;
      setAvailableHours(newHours);
      generatePlan(newHours);
    } else if (type === 'tired') {
      generatePlan(availableHours, 'tired');
    } else if (type === 'exam') {
      generatePlan(availableHours, 'exam');
    } else if (type === 'projects') {
      generatePlan(availableHours, 'project');
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700 max-w-4xl mx-auto">
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="text-brand-blue h-8 w-8" /> My Daily Career Plan
          </h1>
          <p className="text-slate-400 mt-1 text-lg">Intelligent scheduling optimized for your goals and energy.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Today's Time Limit</div>
          <div className="text-2xl font-bold text-white flex items-center justify-end gap-2">
            <Clock className="h-5 w-5 text-brand-cyan" /> {availableHours} hours
          </div>
        </div>
      </motion.div>

      {/* Adjustment Panel */}
      <Card glass className="border-brand-blue/30 bg-gradient-to-r from-brand-blue/10 to-transparent">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-brand-blue" />
            <span className="font-semibold text-white">Adjust My Plan</span>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={() => handleAdjust('less')} className="border-white/10 hover:bg-white/10 text-xs">
              <Clock className="h-3 w-3 mr-1" /> Less time
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAdjust('more')} className="border-white/10 hover:bg-white/10 text-xs">
              <Clock className="h-3 w-3 mr-1" /> More time
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAdjust('tired')} className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs">
              <Battery className="h-3 w-3 mr-1" /> I'm tired
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAdjust('exam')} className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">
              <Book className="h-3 w-3 mr-1" /> I have an exam
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAdjust('projects')} className="border-brand-violet/30 text-brand-violet hover:bg-brand-violet/10 text-xs">
              <Trophy className="h-3 w-3 mr-1" /> Focus on projects
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4 relative">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card glass className={`border-white/5 transition-all ${task.status === 'done' ? 'opacity-60 bg-white/5' : 'hover:border-white/20 hover:bg-black/40 cursor-pointer'}`} onClick={() => toggleTask(task.id)}>
                <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  
                  {/* Status & Time */}
                  <div className="flex items-center gap-4 min-w-[120px]">
                    <div className="shrink-0">
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                      ) : (
                        <Circle className="h-6 w-6 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${task.status === 'done' ? 'text-slate-500' : 'text-brand-cyan'}`}>{task.time}</div>
                      <div className="text-xs text-slate-500 font-bold uppercase">Mins</div>
                    </div>
                  </div>

                  {/* Main Details */}
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 ${task.status === 'done' ? 'line-through text-slate-400' : 'text-white'}`}>{task.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{task.reason}</p>
                  </div>

                  {/* Metadata */}
                  <div className="flex md:flex-col gap-3 shrink-0">
                    <div className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-300">
                      Difficulty: <span className={task.difficulty === 'Hard' ? 'text-red-400' : task.difficulty === 'Medium' ? 'text-amber-400' : 'text-green-400'}>{task.difficulty}</span>
                    </div>
                    <div className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-300">
                      Impact: <span className={task.impact === 'Critical' ? 'text-red-400 font-bold' : task.impact === 'High' ? 'text-brand-cyan font-bold' : 'text-slate-300'}>{task.impact}</span>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-center text-sm text-slate-500 mt-8 flex items-center justify-center gap-2">
        <RefreshCw className="h-4 w-4" /> Missed tasks automatically roll over and intelligently reschedule based on dependencies.
      </div>
    </div>
  );
}
