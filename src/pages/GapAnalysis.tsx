import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { AlertTriangle, BookOpen, Brain, Briefcase, Calendar, ChevronRight, LayoutList, PlayCircle, Target, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const targetRequirements: Record<string, Record<string, { req: number, time: string, resource: string, project: string, impact: string }>> = {
  'Product Manager': {
    'Strategy': { req: 80, time: '3 weeks', resource: 'Reforge Strategy Program', project: 'Market Entry Strategy Deck', impact: 'High' },
    'SQL': { req: 60, time: '2 weeks', resource: 'Mode SQL Tutorial', project: 'User Churn Analysis', impact: 'Critical' },
    'Agile': { req: 75, time: '1 week', resource: 'Atlassian Agile Coach', project: 'Jira Sprint Setup', impact: 'Medium' },
    'Communication': { req: 85, time: 'Ongoing', resource: 'Crucial Conversations Book', project: 'Stakeholder Update Mock', impact: 'Critical' },
    'Projects': { req: 70, time: '4 weeks', resource: 'Product School Portfolio', project: 'End-to-End PRD', impact: 'High' }
  }
};

export function GapAnalysis() {
  const { profile, roadmapProgress, assessmentScores } = useAppContext();
  const navigate = useNavigate();
  
  const target = profile.goal || 'Product Manager';
  const reqData = targetRequirements[target] || targetRequirements['Product Manager'];

  const getScore = (skill: string) => {
    if (assessmentScores[skill.toLowerCase()]) return assessmentScores[skill.toLowerCase()];
    let base = 25; 
    if (skill === 'SQL' && roadmapProgress['skip-sql'] === 'done') base = 85;
    if (skill === 'SQL' && roadmapProgress['p1-t1'] === 'done') base = 60;
    if (skill === 'Projects' && roadmapProgress['p2-t3'] === 'done') base += 20;
    if (skill === 'Agile' && roadmapProgress['p3-t1'] === 'done') base = 75;
    return base;
  };

  const analyzedSkills = useMemo(() => {
    const arr = Object.keys(reqData).map(skill => {
      const current = getScore(skill);
      const data = reqData[skill];
      const gap = Math.max(0, data.req - current);
      let priority = 'Low';
      if (gap > 40) priority = 'Critical';
      else if (gap > 20) priority = 'High';
      else if (gap > 0) priority = 'Medium';
      
      return { skill, current, required: data.req, gap, priority, ...data };
    });
    
    // Sort by gap size descending
    return arr.sort((a, b) => b.gap - a.gap);
  }, [reqData, roadmapProgress, assessmentScores]);

  const topGaps = analyzedSkills.filter(s => s.gap > 0).slice(0, 3);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700 max-w-5xl mx-auto">
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Target className="text-brand-cyan h-8 w-8" /> Career Gap Engine
        </h1>
        <p className="text-slate-400 mt-1 text-lg">Deep analysis for <span className="text-white font-semibold">{target}</span></p>
      </motion.div>

      {topGaps.length === 0 ? (
        <Card glass className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-2">You are Job Ready!</h2>
            <p className="text-slate-300">No critical skill gaps found for your target role.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" /> Top 3 Priority Gaps
            </h2>
            
            {topGaps.map((gap, i) => (
              <motion.div 
                key={gap.skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card glass className={`border-l-4 ${gap.priority === 'Critical' ? 'border-l-red-500' : 'border-l-amber-500'} border-t-white/5 border-r-white/5 border-b-white/5`}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{gap.skill}</h3>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${gap.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {gap.priority} Priority
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-slate-400">Current: <span className="text-white font-bold">{gap.current}%</span></span>
                          <span className="text-slate-400">Required: <span className="text-brand-cyan font-bold">{gap.required}%</span></span>
                          <span className="text-slate-400">Gap: <span className="text-red-400 font-bold">{gap.gap}%</span></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase font-bold">Est. Time</div>
                        <div className="text-sm font-medium text-white flex items-center justify-end gap-1"><Calendar className="h-3 w-3 text-brand-blue" /> {gap.time}</div>
                      </div>
                    </div>
                    
                    <Progress value={(gap.current / gap.required) * 100} indicatorClassName={gap.priority === 'Critical' ? 'bg-red-500' : 'bg-amber-500'} className="h-1.5 mb-5 bg-black/40" />

                    <div className="grid grid-cols-2 gap-4 bg-black/20 p-3 rounded-lg border border-white/5">
                      <div>
                        <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Recommended Resource</div>
                        <div className="text-sm text-slate-300">{gap.resource}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1"><Briefcase className="h-3 w-3" /> Capstone Project</div>
                        <div className="text-sm text-slate-300">{gap.project}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <LayoutList className="h-5 w-5 text-brand-violet" /> What To Do Next
            </h2>
            
            <Card glass className="border-brand-violet/20 bg-gradient-to-b from-brand-violet/5 to-transparent">
              <CardContent className="p-6">
                <div className="space-y-6 relative">
                  <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-white/10" />
                  
                  {topGaps.map((gap, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-brand-violet/20 border border-brand-violet/40 flex items-center justify-center text-xs font-bold text-brand-violet">
                        W{i + 1}
                      </div>
                      <h4 className="font-bold text-white mb-1">Week {i + 1}: {gap.skill} Fundamentals</h4>
                      <p className="text-sm text-slate-400 mb-2">Focus on {gap.resource.toLowerCase()}</p>
                    </div>
                  ))}
                  
                  {topGaps.length > 0 && (
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-xs font-bold text-brand-blue">
                        W{topGaps.length + 1}
                      </div>
                      <h4 className="font-bold text-white mb-1">Week {topGaps.length + 1}: Portfolio</h4>
                      <p className="text-sm text-slate-400 mb-2">Combine skills into {topGaps[0].project}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-xs text-slate-400 text-center mb-3">These recommendations have been automatically integrated into your roadmap.</p>
                  <Button onClick={() => navigate('/dashboard/roadmap')} className="w-full bg-brand-violet hover:bg-brand-violet/90 text-white font-bold">
                    View Updated Roadmap <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
