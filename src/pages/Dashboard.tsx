import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Play,
  FileText,
  Headphones,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Edit3,
  PlusCircle,
  GitCommit,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SegmentedProgress } from '../components/ui/Progress';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const learningMaterialsData = {
  books: [
    { id: 'b1', title: "Don't Make Me Think", author: 'Steve Krug', status: 'todo', category: 'UX Design' },
    { id: 'b2', title: 'Seductive Interaction Design', author: 'Stephen Anderson', status: 'progress', category: 'Interaction' },
    { id: 'b3', title: 'Lean UX: Designing Great Products', author: 'Jeff Gothelf', status: 'done', category: 'Strategy' }
  ],
  courses: [
    { id: 'c1', title: 'Reforge Product Strategy', author: 'Casey Winters', status: 'progress', category: 'Strategy' },
    { id: 'c2', title: 'Mode SQL for Analytics', author: 'Benn Stancil', status: 'todo', category: 'Data' }
  ],
  articles: [
    { id: 'a1', title: 'The Anatomy of a High-Impact PRD', author: 'Lenny Rachitsky', status: 'done', category: 'Documentation' },
    { id: 'a2', title: 'Designing for Complex Workflows', author: 'Julie Zhuo', status: 'todo', category: 'Design' }
  ],
  podcasts: [
    { id: 'p1', title: 'How to Build World-Class Products', author: '20VC Podcast', status: 'progress', category: 'Leadership' },
    { id: 'p2', title: 'The Future of AI Design Systems', author: 'Design Details', status: 'todo', category: 'AI & UX' }
  ]
};

export function Dashboard() {
  const {
    profile,
    skillRecords,
    skillGaps,
    activeRoadmap,
    tasks,
    toggleTask,
    activities,
    isSyncLoading,
    syncError,
    refreshStudentState,
    isAuthenticatedStudent
  } = useAppContext();

  const navigate = useNavigate();

  const [skillTab, setSkillTab] = useState<'hard' | 'soft' | 'overall'>('hard');
  const [materialTab, setMaterialTab] = useState<'books' | 'courses' | 'articles' | 'podcasts'>('books');
  const [rightTab, setRightTab] = useState<'tasks' | 'goals'>('tasks');

  const radarData = useMemo(() => {
    const gapItems = skillGaps?.items || [];
    if (gapItems.length > 0) {
      const technical = gapItems.filter((i) => i.category === 'Technical');
      const strategic = gapItems.filter((i) => i.category !== 'Technical');

      let selected = gapItems;
      if (skillTab === 'hard' && technical.length >= 3) selected = technical;
      else if (skillTab === 'soft' && strategic.length >= 3) selected = strategic;

      return selected.map((item) => ({
        skill: item.skill,
        current: item.currentScore ?? 0,
        required: item.requiredScore,
        assessed: item.currentScore !== null,
        fullMark: 100
      }));
    }

    if (skillRecords.length > 0) {
      return skillRecords.slice(0, 6).map((s) => ({
        skill: s.name,
        current: s.score,
        required: 80,
        assessed: true,
        fullMark: 100
      }));
    }

    return [];
  }, [skillGaps, skillRecords, skillTab]);

  const overallReadiness = skillGaps?.readinessPercent ?? 0;

  const bottleneck = useMemo(() => {
    const items = skillGaps?.items || [];
    if (items.length === 0) return null;
    const withGaps = items.filter((i) => i.gap === null || i.gap > 0);
    return withGaps.length > 0 ? withGaps[0] : items[0];
  }, [skillGaps]);

  const activePhase = useMemo(() => {
    if (!activeRoadmap) return null;
    return activeRoadmap.phases.find((p) => p.id === activeRoadmap.currentPhaseId) || activeRoadmap.phases[0] || null;
  }, [activeRoadmap]);

  const verifiedSkills = useMemo(
    () => skillRecords.filter((s) => s.classification === 'VERIFIED'),
    [skillRecords]
  );

  const weeklyCompleted = profile.completedHoursThisWeek ?? 0;
  const weeklyTarget = Math.max(1, profile.weeklyTargetHours ?? 10);
  const weeklyRatio = Math.min(100, Math.round((weeklyCompleted / weeklyTarget) * 100));
  const roadmapSegments = activeRoadmap ? Math.round((activeRoadmap.progressPercent / 100) * 10) : 0;

  const displayName = profile.firstName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : 'PathPilot Student';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {syncError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            {syncError}
          </span>
          <Button size="xs" variant="outline" onClick={refreshStudentState} className="gap-1 border-rose-500/40 shrink-0">
            <RefreshCw className="w-3 h-3" /> Retry Sync
          </Button>
        </div>
      )}

      {isSyncLoading && !isAuthenticatedStudent && (
        <div className="text-xs text-[#71717A]">Loading workspace...</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: PERSONAL CAREER IDENTITY */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 bg-[#202327] border-[#34383D]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[#8B7CFF]/20 border border-[#8B7CFF]/40 flex items-center justify-center font-bold text-sm text-[#8B7CFF]">
                  {avatarInitial}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#75D69A] ring-2 ring-[#202327]" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-[#F4F4F5] truncate leading-tight">{displayName}</h2>
                <p className="text-xs text-[#A1A1AA] truncate mt-0.5">{profile.educationLevel || 'Student'}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge variant="todo" className="text-[10px] py-0 px-1.5">
                    Target: {profile.goal || 'Not Selected'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#34383D] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">Active Track</span>
                <span className="text-[#F4F4F5] font-medium truncate max-w-[140px]">
                  {activeRoadmap?.careerTitle || profile.goal || 'Not selected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">Streak</span>
                <span className="text-[#A1A1AA] font-mono">{profile.streakDays ?? 0} days</span>
              </div>
            </div>

            {/* Skills Pills */}
            <div className="mt-4 pt-3 border-t border-[#34383D] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#71717A] uppercase font-bold tracking-wider">Skills</span>
                <span className="text-[#8B7CFF] cursor-pointer hover:underline" onClick={() => navigate('/dashboard/skills')}>
                  Update / View all
                </span>
              </div>
              {skillRecords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skillRecords.slice(0, 8).map((s) => (
                    <Badge key={s.skillKey} variant="skill">
                      {s.name} ({s.score})
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#71717A]">No skill scores recorded yet.</p>
              )}
            </div>

            {/* Verified Strengths (>= 70) */}
            <div className="mt-3 space-y-1.5">
              <span className="text-[11px] text-[#71717A] uppercase font-bold tracking-wider">Verified (&gt;= 70)</span>
              {verifiedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {verifiedSkills.map((expert) => (
                    <Badge key={expert.skillKey} variant="expert" dot>
                      {expert.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#71717A]">No verified skills (&gt;= 70) recorded yet.</p>
              )}
            </div>

            {/* Weekly Hours */}
            <div className="mt-4 pt-3 border-t border-[#34383D] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F4F4F5]">Weekly Study Goal</span>
                <span className="text-[11px] text-[#71717A] flex items-center gap-1">
                  This week <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className="text-[11px] text-[#A1A1AA] font-mono">
                <span className="text-[#F4F4F5] font-semibold">{weeklyCompleted} hrs</span> / {weeklyTarget} hrs target
              </div>

              <div className="h-2 w-full bg-[#17191C] rounded-full overflow-hidden flex border border-[#34383D]">
                <div className="h-full bg-[#75D69A]" style={{ width: `${weeklyRatio}%` }} title={`Completed (${weeklyRatio}%)`} />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-[#A1A1AA] pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#75D69A]" /> Logged ({weeklyRatio}%)
                </span>
              </div>
            </div>
          </Card>

          {/* Mentor Notes Card */}
          <Card className="p-4 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">
                Recent Feedback <span className="text-[9px] text-[#71717A] lowercase font-normal">[sample notes]</span>
              </h3>
              <span onClick={() => navigate('/dashboard/mentors')} className="text-[10px] text-[#8B7CFF] hover:underline cursor-pointer">
                Hub
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Sarah Jenkins', role: 'Senior Staff PM (DEMO)', date: 'Recent', initials: 'SJ', comment: 'Align upcoming roadmap milestones directly to top skill gaps.' },
                { name: 'David Chen', role: 'Lead Data Architect (DEMO)', date: 'Recent', initials: 'DC', comment: 'Focus on measurable SQL & metric instrumentation proofs.' }
              ].map((fb, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#17191C]/60 border border-[#34383D] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#26292E] border border-[#34383D] flex items-center justify-center text-[10px] font-bold text-[#F4F4F5]">
                        {fb.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#F4F4F5]">{fb.name}</span>
                        <span className="text-[10px] text-[#71717A]">{fb.role}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#71717A]">{fb.date}</span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] italic">"{fb.comment}"</p>
                  <div className="pt-1 flex justify-end">
                    <span
                      onClick={() => navigate('/dashboard/mentors')}
                      className="text-[10px] text-[#8B7CFF] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      Mentorship Hub <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CENTER COLUMN: CAREER INTELLIGENCE & DIGITAL TWIN */}
        <div className="lg:col-span-6 space-y-4">
          {/* A. Career Path Card */}
          <Card className="p-5 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#F4F4F5] tracking-tight">Career Path</h3>
                <p className="text-xs text-[#71717A]">Trajectory to market readiness</p>
              </div>
              <Button variant="outline" size="xs" onClick={() => navigate('/dashboard/roadmap')} className="gap-1">
                Details <ChevronRight className="w-3 h-3" />
              </Button>
            </div>

            <div className="bg-[#17191C] p-3.5 rounded-lg border border-[#34383D] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold">Current</span>
                  <span className="font-semibold text-[#F4F4F5]">{profile.educationLevel || 'Student'}</span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold">Target</span>
                  <span className="font-semibold text-[#8B7CFF]">{profile.goal || 'Select in Explorer'}</span>
                </div>
              </div>

              <SegmentedProgress totalSegments={10} completedSegments={roadmapSegments} />

              <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                <span>
                  {activePhase
                    ? `Phase ${activePhase.number}: ${activePhase.title}`
                    : profile.goal
                      ? 'Roadmap synchronized'
                      : 'No career roadmap selected yet'}
                </span>
                <span className="font-mono text-[#75D69A] font-semibold">
                  {overallReadiness}% Readiness ({skillGaps?.assessedCount ?? 0}/{skillGaps?.totalRequiredCount ?? 0} assessed)
                </span>
              </div>
            </div>
          </Card>

          {/* B. Career Digital Twin Radar */}
          <Card className="p-5 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#F4F4F5] tracking-tight">My Skills (Digital Twin)</h3>
                <p className="text-xs text-[#71717A]">Recorded competency profile vs target role benchmarks</p>
              </div>

              <div className="flex items-center gap-1 bg-[#17191C] p-1 rounded-lg border border-[#34383D]">
                <button
                  onClick={() => setSkillTab('hard')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    skillTab === 'hard' ? 'bg-[#26292E] text-white shadow-sm' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  Hard skills
                </button>
                <button
                  onClick={() => setSkillTab('soft')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    skillTab === 'soft' ? 'bg-[#26292E] text-white shadow-sm' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  Leadership
                </button>
                <button
                  onClick={() => setSkillTab('overall')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    skillTab === 'overall' ? 'bg-[#26292E] text-white shadow-sm' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  Overall
                </button>
              </div>
            </div>

            {radarData.length > 0 ? (
              <>
                <div className="h-64 w-full flex items-center justify-center relative py-2" role="region" aria-label="Career Digital Twin Competency Radar Visualization">
                  <div className="sr-only">
                    <h4>Competency Assessment Breakdown</h4>
                    <table>
                      <thead>
                        <tr><th>Competency</th><th>Current Level</th><th>Target Benchmark</th></tr>
                      </thead>
                      <tbody>
                        {radarData.map((s) => (
                          <tr key={s.skill}>
                            <td>{s.skill}</td>
                            <td>{s.assessed ? `${s.current}%` : 'Unassessed'}</td>
                            <td>{s.required}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#34383D" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#A1A1AA', fontSize: 10, fontWeight: 500 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#202327',
                          borderColor: '#34383D',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#F4F4F5'
                        }}
                      />
                      <Radar name="Current Position" dataKey="current" stroke="#75D69A" fill="#75D69A" fillOpacity={0.4} />
                      <Radar
                        name="Target Market Benchmark"
                        dataKey="required"
                        stroke="#42C5E8"
                        fill="#42C5E8"
                        fillOpacity={0.08}
                        strokeDasharray="4 4"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center gap-6 text-xs text-[#A1A1AA] pt-1 border-t border-[#34383D]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#75D69A]" /> Current position
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-[#42C5E8] bg-[#42C5E8]/20" /> Market benchmark
                  </span>
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center gap-2 text-xs text-[#A1A1AA]">
                <p>Select a target career and record your baseline skills to visualize your Digital Twin.</p>
                <Button size="xs" variant="outline" onClick={() => navigate('/dashboard/explorer')}>
                  Select Career Goal
                </Button>
              </div>
            )}
          </Card>

          {/* C. Critical Skill Bottleneck Alert */}
          {bottleneck && (
            <Card className="p-4 bg-[#202327] border-l-4 border-l-amber-500 border-t-[#34383D] border-r-[#34383D] border-b-[#34383D]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F4F4F5]">Top Skill Bottleneck: {bottleneck.skill}</span>
                      <Badge variant={bottleneck.priority === 'Critical' ? 'critical' : 'high'}>
                        {bottleneck.classification === 'UNASSESSED' ? 'Unassessed' : `${bottleneck.priority} Gap`}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      {bottleneck.currentScore === null ? (
                        <>
                          No proficiency score recorded yet; target benchmark is{' '}
                          <span className="text-[#75D69A] font-semibold">{bottleneck.requiredScore}%</span>.
                        </>
                      ) : (
                        <>
                          Current proficiency is <span className="text-[#F4F4F5] font-semibold">{bottleneck.currentScore}%</span>, target benchmark is{' '}
                          <span className="text-[#75D69A] font-semibold">{bottleneck.requiredScore}%</span>.
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <Button size="xs" onClick={() => navigate('/dashboard/skills')} className="shrink-0">
                  Resolve
                </Button>
              </div>
            </Card>
          )}

          {/* D. Recommended Learning Materials Card */}
          <Card className="p-5 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#F4F4F5] tracking-tight">Recommended Learning Materials</h3>
                <p className="text-xs text-[#71717A]">Curated resources to close identified gaps</p>
              </div>

              <div className="flex items-center gap-1 bg-[#17191C] p-1 rounded-lg border border-[#34383D]">
                {(['books', 'courses', 'articles', 'podcasts'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMaterialTab(tab)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                      materialTab === tab ? 'bg-[#26292E] text-white shadow-sm' : 'text-[#71717A] hover:text-[#A1A1AA]'
                    }`}
                  >
                    {tab} ({learningMaterialsData[tab].length})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {learningMaterialsData[materialTab].map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-[#17191C] border border-[#34383D] flex items-center justify-between group hover:border-[#8B7CFF]/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#26292E] border border-[#34383D] flex items-center justify-center text-[#8B7CFF] shrink-0">
                      {materialTab === 'books' && <BookOpen className="w-4 h-4" />}
                      {materialTab === 'courses' && <Play className="w-4 h-4" />}
                      {materialTab === 'articles' && <FileText className="w-4 h-4" />}
                      {materialTab === 'podcasts' && <Headphones className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#F4F4F5] truncate group-hover:text-white">{item.title}</p>
                      <p className="text-[10px] text-[#71717A] truncate">
                        {item.author} • {item.category}
                      </p>
                    </div>
                  </div>

                  <Badge variant={item.status as any} dot className="capitalize shrink-0">
                    {item.status === 'todo' ? 'To do' : item.status === 'progress' ? 'Progress' : 'Done'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: DAILY EXECUTION & ACTIVITIES */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between mb-3 border-b border-[#34383D] pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRightTab('tasks')}
                  className={`text-xs font-bold transition-colors ${
                    rightTab === 'tasks' ? 'text-[#F4F4F5]' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  Tasks
                </button>
                <span className="text-[#34383D]">|</span>
                <button
                  onClick={() => setRightTab('goals')}
                  className={`text-xs font-bold transition-colors ${
                    rightTab === 'goals' ? 'text-[#F4F4F5]' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  Goals
                </button>
              </div>

              <span className="text-[10px] text-[#71717A] font-mono">Today</span>
            </div>

            {rightTab === 'tasks' ? (
              <div className="space-y-2.5">
                {tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="p-3 rounded-lg bg-[#17191C] border border-[#34383D] hover:border-[#4a5057] cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 text-[#75D69A]">
                          {task.status === 'done' ? (
                            <CheckCircle2 className="w-4 h-4 fill-[#75D69A]/20" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#71717A]" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium leading-tight ${
                            task.status === 'done' ? 'line-through text-[#71717A]' : 'text-[#F4F4F5]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <Badge variant={task.status as any} dot className="capitalize text-[10px] shrink-0">
                        {task.status === 'todo' ? 'To do' : task.status === 'in_progress' ? 'Progress' : 'Done'}
                      </Badge>
                    </div>

                    {task.desc && <p className="text-[11px] text-[#A1A1AA] line-clamp-2 pl-6">{task.desc}</p>}

                    <div className="flex items-center justify-between pt-1 pl-6 text-[10px] text-[#71717A]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {task.time} mins
                      </span>
                      <Badge variant="skill" className="text-[9px]">
                        {task.tag || task.type || 'skill'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-[#17191C] border border-[#34383D] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#71717A]">Active Target Role</span>
                  <p className="font-semibold text-[#8B7CFF]">{profile.goal || 'Not Selected'}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#17191C] border border-[#34383D] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#71717A]">Roadmap Completion</span>
                  <p className="font-mono text-[#75D69A] font-semibold">
                    {activeRoadmap ? `${activeRoadmap.progressPercent}% (${activeRoadmap.completedTasks.length}/${activeRoadmap.totalTasks})` : '0%'}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-[#34383D] flex items-center justify-between text-[11px] text-[#71717A]">
              <span>{Math.min(3, tasks.length)} of {tasks.length}</span>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:text-white rounded hover:bg-[#26292E] disabled:opacity-40" disabled>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => navigate('/dashboard/routine')} className="p-1 hover:text-white rounded hover:bg-[#26292E]">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>

          {/* Latest Activities Card */}
          <Card className="p-4 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between mb-3 border-b border-[#34383D] pb-2">
              <h3 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">Latest Activities</h3>
              <span className="text-[10px] text-[#71717A] font-mono">Live Log</span>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#17191C]/60 border border-[#34383D]">
                  <div className="p-1.5 rounded bg-[#26292E] border border-[#34383D] text-[#8B7CFF] shrink-0 mt-0.5">
                    {activity.type === 'goal_updated' ? (
                      <Edit3 className="w-3.5 h-3.5" />
                    ) : activity.type === 'roadmap_advanced' ? (
                      <GitCommit className="w-3.5 h-3.5" />
                    ) : (
                      <PlusCircle className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#F4F4F5] leading-snug">{activity.description}</p>
                    <span className="text-[10px] text-[#71717A] mt-1 block font-mono">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Strategic Recommendation Card */}
          <Card className="p-4 bg-[#202327] border border-[#8B7CFF]/30 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#8B7CFF]" />
              <h3 className="text-xs font-bold text-[#F4F4F5]">AI Recommendation</h3>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {bottleneck && profile.goal ? (
                <>
                  Closing your <strong className="text-white">{bottleneck.skill}</strong> gap toward{' '}
                  <strong className="text-white">{profile.goal}</strong> is the highest-leverage step from your current{' '}
                  <span className="text-[#75D69A] font-semibold">{overallReadiness}%</span> readiness.
                </>
              ) : (
                'Set a target career goal and consult PathPilot AI Mentor to generate advice grounded in your database profile.'
              )}
            </p>
            <div className="mt-3 pt-2 border-t border-[#34383D] flex items-center justify-between">
              <Button
                variant="outline"
                size="xs"
                onClick={() => navigate('/dashboard/ai-mentor')}
                className="text-[#8B7CFF] border-[#8B7CFF]/40 hover:bg-[#8B7CFF]/10 gap-1 w-full justify-center"
              >
                Discuss with AI Mentor <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
