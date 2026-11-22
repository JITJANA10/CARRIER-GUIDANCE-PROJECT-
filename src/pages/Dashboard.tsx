import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Circle, ArrowRight, Play, Briefcase, Brain, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

import { CareerTwin } from '../components/CareerTwin';

export function Dashboard() {
  const { profile, roadmapProgress, updateRoadmapProgress } = useAppContext();
  
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Good morning, {profile.firstName || 'Alex'} 👋</h1>
        <p className="text-slate-400 mt-1 text-lg">Here's your path forward today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          <CareerTwin />

          {/* Mini Roadmap / Next Action */}
          <Card glass className="border-white/5">
            <CardHeader>
              <CardTitle className="text-xl">Your next best step</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col md:flex-row gap-6 items-center bg-black/20 p-5 rounded-xl border border-white/5">
                 <div className="w-16 h-16 rounded-full bg-brand-violet/20 flex items-center justify-center shrink-0">
                   <Play className="h-6 w-6 text-brand-violet ml-1" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-bold text-white mb-1">Complete the Data Analysis Fundamentals module</h3>
                   <p className="text-sm text-slate-400 mb-2">This will close one of your biggest skill gaps for your target career.</p>
                   <div className="flex gap-4 text-xs font-medium text-slate-300">
                     <span className="flex items-center gap-1"><Circle className="h-3 w-3" /> 25 mins</span>
                     <span className="flex items-center gap-1 text-brand-cyan"><Brain className="h-3 w-3" /> +150 XP</span>
                   </div>
                 </div>
                 <Button className="w-full md:w-auto shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.3)]">Start Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
               </div>

               <div className="mt-8 space-y-4">
                 <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Current Phase: Learn</h4>
                 
                 <div className="space-y-3">
                   <div className="flex items-center gap-3 text-slate-500">
                     <CheckCircle2 className="h-5 w-5 text-green-500" />
                     <span className="line-through">Career assessment</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500">
                     <CheckCircle2 className="h-5 w-5 text-green-500" />
                     <span className="line-through">Communication assessment</span>
                   </div>
                   <div className="flex items-center gap-3 text-white">
                     <Circle className="h-5 w-5 text-brand-blue" />
                     <span className="font-medium">Data analysis fundamentals</span>
                     <span className="ml-auto text-xs bg-brand-blue/20 text-brand-blue px-2 py-1 rounded">In Progress</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-400">
                     <Circle className="h-5 w-5" />
                     <span>Product strategy project</span>
                   </div>
                 </div>
               </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Sidebar Utilities */}
        <div className="space-y-8">
          
          {/* Today's Tasks */}
          <Card glass className="border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex justify-between items-center">
                My Day
                <span className="text-xs font-normal text-slate-400">Tuesday, Oct 24</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 1, title: 'Complete SQL fundamentals', desc: '30 min • Core Skill' },
                { id: 2, title: 'Practice communication challenge', desc: '15 min • SkillQuest' },
                { id: 3, title: 'Review Product Manager roadmap', desc: '10 min • Planning' }
              ].map(task => {
                const isDone = roadmapProgress[`daily-${task.id}`] === 'done';
                return (
                  <div 
                    key={task.id}
                    onClick={() => {
                      updateRoadmapProgress(`daily-${task.id}`, isDone ? 'todo' : 'done');
                    }}
                    className={`flex gap-3 items-start p-3 rounded-lg border transition-colors cursor-pointer ${isDone ? 'bg-white/10 border-white/20 opacity-60' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" /> : <Circle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />}
                    <div>
                      <p className={`font-medium text-sm ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>{task.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{task.desc}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recommended Opportunity */}
          <Card glass className="border-brand-cyan/20 bg-gradient-to-br from-brand-navy to-brand-cyan/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-brand-cyan text-sm font-semibold mb-2">
                <Briefcase className="h-4 w-4" /> Recommended Opportunity
              </div>
              <CardTitle className="text-lg">Product Management Internship</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold mb-4">
                94% Match
              </div>
              <p className="text-sm text-slate-300 mb-4">TechNova is looking for an entry-level PM intern. Perfect for building your product strategy portfolio.</p>
              <Button variant="outline" className="w-full border-brand-cyan/30 text-white hover:bg-brand-cyan/10">View Details</Button>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
