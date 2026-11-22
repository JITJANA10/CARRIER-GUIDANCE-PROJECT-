import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Progress } from './ui/Progress';
import { User, Target, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Mock target requirements based on goal
const targetRequirements: Record<string, Record<string, number>> = {
  'Product Manager': {
    'Strategy': 80,
    'SQL': 60,
    'Agile': 75,
    'Communication': 85,
    'Projects': 70,
    'Interviewing': 80
  },
  'Data Analyst': {
    'SQL': 80,
    'Excel': 80,
    'Python': 70,
    'Statistics': 75,
    'Communication': 60,
    'Projects': 80
  }
};

export function CareerTwin() {
  const { profile, roadmapProgress, assessmentScores } = useAppContext();
  
  const target = profile.goal || 'Product Manager';
  const requirements = targetRequirements[target] || targetRequirements['Product Manager'];
  
  // Calculate current scores dynamically based on progress and assessments
  const getScore = (skill: string) => {
    // Check if there is an explicit assessment score
    if (assessmentScores[skill.toLowerCase()]) {
      return assessmentScores[skill.toLowerCase()];
    }
    
    // Check roadmap progress for inferred skills
    let base = 20; // Default beginner score
    if (skill === 'SQL' && roadmapProgress['skip-sql'] === 'done') base = 85;
    if (skill === 'SQL' && roadmapProgress['p1-t1'] === 'done') base = 60;
    if (skill === 'Projects' && roadmapProgress['p2-t3'] === 'done') base += 20;
    if (skill === 'Agile' && roadmapProgress['p3-t1'] === 'done') base = 75;
    
    return base;
  };

  const skills = Object.keys(requirements).map(skill => {
    const current = getScore(skill);
    const required = requirements[skill];
    const gap = Math.max(0, required - current);
    return { skill, current, required, gap };
  });

  // Find biggest bottleneck
  const bottleneck = skills.reduce((prev, curr) => (curr.gap > prev.gap ? curr : prev), skills[0]);

  // Overall readiness based on gaps
  const totalGap = skills.reduce((sum, s) => sum + s.gap, 0);
  const maxPossibleGap = skills.reduce((sum, s) => sum + s.required, 0);
  const readiness = Math.round(100 - ((totalGap / maxPossibleGap) * 100));

  return (
    <Card glass className="border-brand-violet/30 overflow-hidden relative shadow-[0_0_40px_rgba(124,58,237,0.1)]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-violet/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Activity className="h-6 w-6 text-brand-violet" />
          Career Digital Twin
        </CardTitle>
        <p className="text-slate-400 text-sm">Real-time simulation of your career readiness vs market requirements.</p>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        
        {/* Top Profiles Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-brand-navy border border-white/10 items-center justify-center text-slate-500 font-bold text-xs">
            VS
          </div>
          
          <div className="bg-black/30 p-5 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-blue/20 text-brand-blue">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Current Identity</div>
                <div className="text-lg font-bold text-white">{profile.educationLevel || 'Student'}</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Current Readiness</span>
                <span className="font-bold text-brand-blue">{readiness}%</span>
              </div>
              <Progress value={readiness} indicatorClassName="bg-brand-blue" className="h-1.5" />
            </div>
          </div>

          <div className="bg-brand-violet/5 p-5 rounded-xl border border-brand-violet/20 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-violet/20 text-brand-violet">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-brand-violet/70 font-bold uppercase">Target Identity</div>
                <div className="text-lg font-bold text-white">{target}</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Required Readiness</span>
                <span className="font-bold text-brand-violet">100%</span>
              </div>
              <Progress value={100} indicatorClassName="bg-brand-violet" className="h-1.5" />
            </div>
          </div>
        </div>

        {/* Bottleneck Alert */}
        {bottleneck && bottleneck.gap > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-4">
            <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-400 mb-1">Your biggest career bottleneck</h4>
              <p className="text-sm text-slate-300">
                Your current bottleneck is <span className="font-bold text-white">{bottleneck.skill}</span>. 
                You are at {bottleneck.current}% but the market requires {bottleneck.required}%.
              </p>
              <button className="mt-3 text-sm font-bold text-amber-400 flex items-center gap-1 hover:text-amber-300 transition-colors">
                Recommended Action: Improve {bottleneck.skill} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Skills Gap Analysis */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detailed Gap Analysis</h3>
          <div className="space-y-4">
            {skills.map(s => (
              <div key={s.skill} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3 text-sm font-medium text-white truncate">{s.skill}</div>
                <div className="col-span-9 relative pt-1">
                  {/* Background Track */}
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden absolute top-1/2 -translate-y-1/2">
                    {/* Required Target Indicator Line */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-brand-violet z-20" style={{ left: `${s.required}%` }} />
                  </div>
                  {/* Current Progress Bar */}
                  <div 
                    className={`h-2 rounded-full absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ${s.current >= s.required ? 'bg-green-400' : 'bg-brand-blue'}`}
                    style={{ width: `${s.current}%` }}
                  />
                  
                  {/* Gap Overlay (Visualizes the gap) */}
                  {s.current < s.required && (
                    <div 
                      className="h-2 rounded-r-full absolute top-1/2 -translate-y-1/2 z-0 bg-red-500/30 transition-all duration-1000 stripe-pattern"
                      style={{ left: `${s.current}%`, width: `${s.gap}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-6 text-xs text-slate-400 justify-end">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-brand-blue" /> Current</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500/30" /> Gap</div>
            <div className="flex items-center gap-2"><div className="w-0.5 h-3 bg-brand-violet" /> Required</div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
