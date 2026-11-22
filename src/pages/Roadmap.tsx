import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CheckCircle2, Circle, Lock, PlayCircle, BookOpen, Trophy, Briefcase, Info, Clock, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Progress } from '../components/ui/Progress';
import { Button } from '../components/ui/Button';

export function Roadmap() {
  const { profile, roadmapProgress, updateRoadmapProgress } = useAppContext();

  // Dynamic Roadmap Generator based on user profile and progress
  const phases = useMemo(() => {
    const isDataAnalystKnown = roadmapProgress['skip-sql'] === 'done';
    
    let basePhases = [
      {
        id: 'phase-1',
        title: 'Foundation: Data & Analytics',
        goal: 'Master data manipulation to make data-driven product decisions.',
        status: isDataAnalystKnown ? 'completed' : (roadmapProgress['phase-1-status'] || 'active'),
        skills: ['SQL', 'Excel/Sheets', 'Basic Statistics'],
        estimatedTime: '2-3 Weeks',
        difficulty: 'Medium',
        why: 'Product Managers need to query their own data without relying on engineers. SQL is the industry standard.',
        dependencies: 'None',
        outcome: 'Able to pull user metrics and build basic funnels.',
        tasks: [
          { id: 'p1-t1', name: 'Learn SQL JOINs and Aggregations', type: 'learn' },
          { id: 'p1-t2', name: 'Analyze a mock e-commerce dataset', type: 'project' }
        ]
      },
      {
        id: 'phase-2',
        title: 'Product Strategy & Discovery',
        goal: 'Understand user needs and market positioning.',
        status: isDataAnalystKnown ? (roadmapProgress['phase-2-status'] || 'active') : (roadmapProgress['phase-1-status'] === 'completed' ? 'active' : 'locked'),
        skills: ['User Interviews', 'Market Sizing', 'Competitor Analysis'],
        estimatedTime: '4 Weeks',
        difficulty: 'Hard',
        why: 'Building the wrong feature efficiently is a waste. Strategy ensures you build what matters.',
        dependencies: 'Phase 1',
        outcome: 'Create a PRD (Product Requirement Document) for a new feature.',
        tasks: [
          { id: 'p2-t1', name: 'Read "Inspired" by Marty Cagan (Ch 1-10)', type: 'learn' },
          { id: 'p2-t2', name: 'Conduct 3 mock user interviews', type: 'task' },
          { id: 'p2-t3', name: 'Draft a PRD for a Spotify social feature', type: 'project' }
        ]
      },
      {
        id: 'phase-3',
        title: 'Execution & Agile Delivery',
        goal: 'Work with engineering teams to ship features.',
        status: roadmapProgress['phase-2-status'] === 'completed' ? 'active' : 'locked',
        skills: ['Scrum/Kanban', 'Jira', 'Sprint Planning', 'Stakeholder Mgmt'],
        estimatedTime: '3 Weeks',
        difficulty: 'Medium',
        why: 'A PM must translate strategy into executable tickets for developers.',
        dependencies: 'Phase 2',
        outcome: 'Run a mock sprint planning session.',
        tasks: [
          { id: 'p3-t1', name: 'Learn Agile methodologies', type: 'learn' },
          { id: 'p3-t2', name: 'Break down Spotify PRD into Jira Epics/Stories', type: 'project' }
        ]
      },
      {
        id: 'phase-4',
        title: 'Career Launch',
        goal: 'Land an internship or entry-level PM role.',
        status: roadmapProgress['phase-3-status'] === 'completed' ? 'active' : 'locked',
        skills: ['Resume Building', 'Interviewing', 'Portfolio'],
        estimatedTime: 'Ongoing',
        difficulty: 'Hard',
        why: 'Your skills need to be packaged and presented effectively to hiring managers.',
        dependencies: 'Phase 1, 2, 3',
        outcome: 'Get hired!',
        tasks: [
          { id: 'p4-t1', name: 'Build a notion portfolio with PRDs', type: 'task' },
          { id: 'p4-t2', name: 'Mock interview: Product Sense', type: 'task' },
          { id: 'p4-t3', name: 'Apply to 10 APM programs', type: 'task' }
        ]
      }
    ];

    return basePhases;
  }, [roadmapProgress]);

  const calculateReadiness = () => {
    let completedTasks = 0;
    let totalTasks = 0;
    
    // Add bonus if they skipped SQL because they already know it
    if (roadmapProgress['skip-sql'] === 'done') {
      completedTasks += 2; // Equivalent to phase 1 tasks
    }
    
    phases.forEach(p => {
      p.tasks.forEach(t => {
        totalTasks++;
        if (roadmapProgress[t.id] === 'done') completedTasks++;
      });
    });
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  };

  const readinessScore = calculateReadiness();

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700 max-w-5xl mx-auto">
      
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold">Adaptive Career Roadmap</h1>
          <p className="text-slate-400 mt-1 text-lg">Dynamically generated for <span className="text-white font-semibold">{profile.goal || 'Product Manager'}</span></p>
        </div>
        
        <Card glass className="border-brand-blue/30 min-w-[250px]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-brand-blue flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              {readinessScore}%
            </div>
            <div>
              <div className="text-sm text-slate-400 font-medium">Overall Readiness</div>
              <div className="text-lg font-bold text-white">
                {readinessScore < 30 ? 'Beginner' : readinessScore < 70 ? 'Intermediate' : 'Job Ready'}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Adaptive Notice */}
      {roadmapProgress['skip-sql'] !== 'done' && (
        <Card glass className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-400">Adaptive Engine Suggestion</h4>
              <p className="text-sm text-slate-300 mt-1 mb-3">If you already have a strong background in SQL and Data Analysis from your previous studies, you can skip Phase 1 to fast-track your roadmap.</p>
              <Button onClick={() => updateRoadmapProgress('skip-sql', 'done')} size="sm" variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20">
                I already know SQL (Skip Phase 1)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative pt-4">
        {/* Vertical Line */}
        <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-4 bottom-0 w-1 bg-white/5 rounded-full" />

        <div className="space-y-16 relative">
          {phases.map((phase, idx) => {
            const isEven = idx % 2 === 0;
            const phaseTasksDone = phase.tasks.filter(t => roadmapProgress[t.id] === 'done').length;
            const phaseProgress = Math.round((phaseTasksDone / phase.tasks.length) * 100);
            
            // Auto-complete phase if all tasks done
            if (phaseProgress === 100 && phase.status !== 'completed' && phase.status !== 'locked') {
               updateRoadmapProgress(`${phase.id}-status`, 'completed');
            }

            return (
              <motion.div 
                key={phase.id}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between w-full relative ${isEven ? 'md:flex-row-reverse' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                
                {/* Desktop Center Node */}
                <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full items-center justify-center z-10 border-4 border-background ${phase.status === 'completed' ? 'bg-green-500' : phase.status === 'active' ? 'bg-brand-blue' : 'bg-slate-700'}`}>
                  {phase.status === 'completed' ? <CheckCircle2 className="h-6 w-6 text-background" /> : 
                   phase.status === 'active' ? <div className="w-4 h-4 bg-white rounded-full animate-pulse" /> :
                   <Lock className="h-5 w-5 text-slate-400" />}
                </div>

                {/* Mobile Left Node */}
                <div className={`md:hidden absolute left-6 -translate-x-1/2 top-6 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-background ${phase.status === 'completed' ? 'bg-green-500' : phase.status === 'active' ? 'bg-brand-blue' : 'bg-slate-700'}`}>
                   {phase.status === 'completed' ? <Check className="h-4 w-4 text-background" /> : 
                   phase.status === 'active' ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> :
                   <Lock className="h-3 w-3 text-slate-400" />}
                </div>

                {/* Card Content */}
                <div className={`w-full pl-16 md:pl-0 md:w-[45%] ${phase.status === 'locked' ? 'opacity-50 grayscale hover:grayscale-0 transition-all' : ''}`}>
                  <Card glass className={`border-white/5 ${phase.status === 'active' ? 'border-brand-blue/50 shadow-[0_0_30px_rgba(37,99,235,0.15)]' : ''}`}>
                    <CardHeader className="pb-3 border-b border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${phase.status === 'completed' ? 'bg-green-500/20 text-green-400' : phase.status === 'active' ? 'bg-brand-blue/20 text-brand-blue' : 'bg-white/10 text-slate-400'}`}>
                          {phase.status}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium bg-black/20 px-2 py-1 rounded">
                          <Clock className="h-3 w-3" /> {phase.estimatedTime}
                        </div>
                      </div>
                      <CardTitle className="text-2xl">{phase.title}</CardTitle>
                      <p className="text-slate-300 text-sm mt-2">{phase.goal}</p>
                    </CardHeader>
                    
                    <CardContent className="pt-4 space-y-6">
                      
                      {/* Why this step? */}
                      <div className="bg-brand-violet/10 border border-brand-violet/20 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-brand-violet shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-brand-violet block mb-0.5">WHY THIS STEP?</span>
                            <span className="text-sm text-slate-300">{phase.why}</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills & Outcome */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Target Skills</span>
                          <div className="flex flex-wrap gap-1">
                            {phase.skills.map(s => <span key={s} className="text-xs bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-slate-300">{s}</span>)}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Expected Outcome</span>
                          <span className="text-xs text-slate-300">{phase.outcome}</span>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Phase Tasks</span>
                          <span className="text-xs text-slate-400">{phaseProgress}%</span>
                        </div>
                        <Progress value={phase.status === 'completed' ? 100 : phaseProgress} className="h-1.5 mb-3" />
                        
                        <div className="space-y-2">
                          {phase.tasks.map((task) => {
                            const isDone = roadmapProgress[task.id] === 'done';
                            const isLocked = phase.status === 'locked';
                            
                            return (
                              <div 
                                key={task.id} 
                                onClick={() => {
                                  if (isLocked || phase.status === 'completed') return;
                                  updateRoadmapProgress(task.id, isDone ? 'todo' : 'done');
                                }}
                                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${isLocked ? 'border-transparent' : isDone ? 'bg-white/5 border-white/5 opacity-70 cursor-pointer' : 'bg-black/20 border-white/10 hover:bg-white/5 cursor-pointer'}`}
                              >
                                {isDone ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" /> : 
                                 isLocked ? <Lock className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" /> :
                                 <Circle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />}
                                
                                <div className="flex-1">
                                  <div className={`text-sm ${isDone ? 'text-slate-400 line-through' : isLocked ? 'text-slate-500' : 'text-white'}`}>
                                    {task.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 font-semibold">
                                    {task.type}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {phase.status === 'active' && phaseProgress === 100 && (
                         <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-bold">
                           Complete Phase <ArrowRight className="ml-2 h-4 w-4" />
                         </Button>
                      )}

                    </CardContent>
                  </Card>
                </div>
                
                {/* Empty div to balance flex on desktop */}
                <div className="hidden md:block w-[45%]" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
