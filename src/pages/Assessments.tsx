import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Target, 
  Lightbulb, 
  Activity, 
  ArrowRight, 
  Keyboard, 
  CheckCircle2, 
  Clock, 
  Award,
  Zap,
  BarChart3
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { TypingGame } from '../components/TypingGame';
import { useAppContext } from '../context/AppContext';

const softSkillsData = [
  { subject: 'Communication', score: 85, fullMark: 100 },
  { subject: 'Leadership', score: 65, fullMark: 100 },
  { subject: 'Problem Solving', score: 90, fullMark: 100 },
  { subject: 'Teamwork', score: 80, fullMark: 100 },
  { subject: 'Adaptability', score: 75, fullMark: 100 },
  { subject: 'Prioritization', score: 70, fullMark: 100 },
];

const interestsData = [
  { name: 'Technology', value: 40, color: '#42C5E8' },
  { name: 'Business Strategy', value: 30, color: '#8B7CFF' },
  { name: 'Product Design', value: 20, color: '#75D69A' },
  { name: 'Data & Science', value: 10, color: '#F59E0B' },
];

const technicalAssessments = [
  { id: 'sql', title: 'SQL & Relational Modeling', duration: '25 mins', questions: 15, level: 'Intermediate', score: 85, status: 'completed' },
  { id: 'prd', title: 'Product Specification (PRD) Mastery', duration: '30 mins', questions: 12, level: 'Advanced', score: 78, status: 'completed' },
  { id: 'agile', title: 'Agile Delivery & Scrum Mechanics', duration: '20 mins', questions: 10, level: 'Beginner', score: null, status: 'available' },
  { id: 'metrics', title: 'A/B Testing & Metric Instrumentation', duration: '35 mins', questions: 18, level: 'Advanced', score: null, status: 'available' },
];

export function Assessments() {
  const { assessmentScores, updateAssessmentScore } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'typing'>('overview');

  const handleTypingComplete = (wpm: number, accuracy: number) => {
    updateAssessmentScore('typing_wpm', wpm);
    updateAssessmentScore('typing_acc', accuracy);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F4F4F5] tracking-tight">
            Assessment Center
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Objective psychometric, soft skill, and technical competency evaluations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-[#17191C] p-1 rounded-lg border border-[#34383D]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-[#26292E] text-white shadow-sm font-semibold' : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            Psychometrics & Soft Skills
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'technical' ? 'bg-[#26292E] text-white shadow-sm font-semibold' : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            Technical Tests
          </button>
          <button
            onClick={() => setActiveTab('typing')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'typing' ? 'bg-[#26292E] text-white shadow-sm font-semibold' : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            Typing Speed
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Soft Skills Radar */}
          <div className="lg:col-span-7">
            <Card className="h-full bg-[#202327] border-[#34383D]">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#34383D] pb-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-[#8B7CFF]" />
                  <CardTitle className="text-sm">Soft Skills Competency Profile</CardTitle>
                </div>
                <Badge variant="done" dot>Verified</Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div 
                  className="h-64 w-full"
                  role="region"
                  aria-label="Soft Skills Competency Radar Chart"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={softSkillsData}>
                      <PolarGrid stroke="#34383D" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#202327', borderColor: '#34383D', borderRadius: '8px', fontSize: '11px' }} />
                      <Radar name="Candidate Score" dataKey="score" stroke="#8B7CFF" fill="#8B7CFF" fillOpacity={0.35} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3.5 rounded-lg bg-[#17191C] border border-[#34383D] space-y-1 text-xs">
                  <span className="font-semibold text-[#F4F4F5]">Analytical Summary:</span>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    Your <strong className="text-white">Problem Solving (90%)</strong> and <strong className="text-white">Communication (85%)</strong> are within the 90th percentile of leadership benchmarks. Focus next on <strong className="text-amber-400">Leadership & Negotiation</strong> to unlock executive management roles.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Core Interests Pie Chart */}
          <div className="lg:col-span-5">
            <Card className="h-full bg-[#202327] border-[#34383D]">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#34383D] pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#42C5E8]" />
                  <CardTitle className="text-sm">Core Interest Distribution</CardTitle>
                </div>
                <span className="text-[11px] text-[#71717A]">4 Domains</span>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div 
                  className="h-56 w-full relative"
                  role="region"
                  aria-label="Core Interest Distribution Donut Chart"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={interestsData} 
                        innerRadius={55} 
                        outerRadius={75} 
                        paddingAngle={4} 
                        dataKey="value"
                      >
                        {interestsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#202327', borderColor: '#34383D', borderRadius: '8px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  {interestsData.map(item => (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-[#17191C] border border-[#34383D]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[#A1A1AA] text-[11px]">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[#F4F4F5]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {technicalAssessments.map(test => (
            <Card key={test.id} className="p-4 bg-[#202327] border-[#34383D] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#F4F4F5]">{test.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#71717A] mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration}</span>
                      <span>•</span>
                      <span>{test.questions} questions</span>
                      <span>•</span>
                      <Badge variant="skill" className="text-[10px] py-0">{test.level}</Badge>
                    </div>
                  </div>

                  {test.status === 'completed' ? (
                    <Badge variant="done" dot>{test.score}% Passed</Badge>
                  ) : (
                    <Badge variant="todo" dot>Available</Badge>
                  )}
                </div>

                <p className="text-xs text-[#A1A1AA]">
                  Timed scenario assessment testing practical decision-making and edge cases.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#34383D] flex items-center justify-between">
                <span className="text-[10px] text-[#71717A] font-mono">
                  {test.status === 'completed' ? 'Verified on June 12' : 'Earn +150 XP on completion'}
                </span>
                <Button 
                  size="xs" 
                  variant={test.status === 'completed' ? 'outline' : 'default'}
                  className="gap-1 border-[#34383D]"
                >
                  {test.status === 'completed' ? 'Review Answers' : 'Start Assessment'} <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'typing' && (
        <div className="max-w-3xl mx-auto">
          <TypingGame onComplete={handleTypingComplete} />
        </div>
      )}
    </div>
  );
}
