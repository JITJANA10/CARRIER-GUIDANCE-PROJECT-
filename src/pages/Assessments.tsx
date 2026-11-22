import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { BrainCircuit, Target, Lightbulb, Activity, ArrowRight, Keyboard } from 'lucide-react';
import { TypingGame } from '../components/TypingGame';
import { useAppContext } from '../context/AppContext';

const softSkillsData = [
  { subject: 'Communication', A: 85, fullMark: 100 },
  { subject: 'Leadership', A: 65, fullMark: 100 },
  { subject: 'Problem Solving', A: 90, fullMark: 100 },
  { subject: 'Teamwork', A: 80, fullMark: 100 },
  { subject: 'Adaptability', A: 75, fullMark: 100 },
  { subject: 'Time Mgmt', A: 60, fullMark: 100 },
];

const interestsData = [
  { name: 'Technology', value: 400, color: '#06b6d4' },
  { name: 'Business', value: 300, color: '#2563eb' },
  { name: 'Design', value: 200, color: '#7c3aed' },
  { name: 'Science', value: 100, color: '#4ade80' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function Assessments() {
  const { assessmentScores, updateAssessmentScore } = useAppContext();

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Assessment Center</h1>
        <p className="text-slate-400 mt-1 text-lg">Understand your profile deeply.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Soft Skills Radar */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card glass className="h-full border-brand-violet/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-violet/10 rounded-full blur-[80px] -z-10" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-brand-violet" /> Soft Skills Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={softSkillsData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1527', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Radar name="Alex" dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/5">
                <p className="text-sm text-slate-300">
                  <span className="font-bold text-white">Insight:</span> Your <span className="text-brand-cyan">Problem Solving</span> is exceptional. Consider focusing on <span className="text-amber-400">Time Management</span> to balance your workflow better.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interests Distribution */}
        <motion.div variants={itemVariants}>
          <Card glass className="h-full border-brand-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-cyan" /> Core Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={interestsData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {interestsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0d1527', borderColor: 'rgba(255,255,255,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold">Tech</span>
                </div>
              </div>
              <div className="space-y-3 mt-6">
                {interestsData.map(item => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value / 10}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Career Readiness */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
           <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Career Readiness', value: 67, icon: Activity, color: 'text-brand-blue', bg: 'bg-brand-blue' },
                { title: 'Technical Skills', value: 45, icon: Lightbulb, color: 'text-brand-cyan', bg: 'bg-brand-cyan' },
                { title: 'Typing Speed', value: assessmentScores['typingWpm'] || 0, icon: Keyboard, color: 'text-brand-violet', bg: 'bg-brand-violet' },
              ].map((metric, i) => (
                 <Card key={i} glass className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                   <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                       <metric.icon className={`h-6 w-6 ${metric.color}`} />
                       <ArrowRight className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                     </div>
                     <div className="text-2xl font-bold mb-1">{metric.title === 'Typing Speed' ? `${metric.value} WPM` : `${metric.value}%`}</div>
                     <div className="text-sm text-slate-400 mb-4">{metric.title}</div>
                     <Progress value={Math.min(100, metric.value || 0)} indicatorClassName={metric.bg} className="h-1.5" />
                   </CardContent>
                 </Card>
              ))}
           </div>
        </motion.div>
        
        {/* Typing Assessment Game */}
        <motion.div variants={itemVariants} className="lg:col-span-3 mt-8">
           <TypingGame onComplete={(wpm) => updateAssessmentScore('typingWpm', wpm)} />
        </motion.div>

      </motion.div>
    </div>
  );
}
