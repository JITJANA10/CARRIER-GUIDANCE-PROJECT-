import React from 'react';
import {
  CheckCircle2,
  Circle,
  Lock,
  AlertCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function Roadmap() {
  const {
    profile,
    activeRoadmap,
    toggleRoadmapTask,
    completeRoadmapPhase,
    isSyncLoading,
    isSyncSaving,
    syncError,
    refreshStudentState,
    isAuthenticatedStudent
  } = useAppContext();

  const navigate = useNavigate();

  const phases = activeRoadmap?.phases || [];
  const activePhase = phases.find((p) => p.status === 'active') || null;
  const isSqlFastTrack = Boolean(
    activePhase &&
      activePhase.number === '01' &&
      activePhase.skills.some((s) => s.toLowerCase().includes('sql'))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F4F4F5] tracking-tight">Career Roadmap</h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Phased execution path for target role:{' '}
            <span className="text-[#8B7CFF] font-semibold">
              {activeRoadmap?.careerTitle || profile.goal || 'Not selected'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeRoadmap && (
            <Badge variant="skill" className="font-mono text-[11px]">
              {activeRoadmap.progressPercent}% ({activeRoadmap.completedTasks.length}/{activeRoadmap.totalTasks})
            </Badge>
          )}
          {activePhase && (
            <Button
              variant="outline"
              size="xs"
              disabled={isSyncSaving}
              onClick={() => completeRoadmapPhase(activePhase.id)}
              className="border-[#34383D] text-[#A1A1AA] hover:text-white"
            >
              {isSyncSaving
                ? 'Saving...'
                : isSqlFastTrack
                  ? 'I already know SQL (Fast-track Phase 1)'
                  : `Complete Phase ${activePhase.number}`}
            </Button>
          )}
        </div>
      </div>

      {/* Sync Feedback */}
      {syncError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            {syncError}
          </span>
          <Button size="xs" variant="outline" onClick={refreshStudentState} className="gap-1 border-rose-500/40 shrink-0">
            <RefreshCw className="w-3 h-3" /> Retry
          </Button>
        </div>
      )}

      {activeRoadmap && (
        <Card className="p-4 bg-[#202327] border-[#34383D] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A1A1AA]">
              Active Milestone Progress •{' '}
              <strong className="text-[#F4F4F5]">
                {activePhase ? `Phase ${activePhase.number}: ${activePhase.title}` : 'All Phases Completed'}
              </strong>
            </span>
            <span className="font-mono font-bold text-[#75D69A]">{activeRoadmap.progressPercent}%</span>
          </div>
          <Progress value={activeRoadmap.progressPercent} indicatorClassName="bg-[#75D69A]" />
        </Card>
      )}

      {!activeRoadmap ? (
        <Card className="p-6 bg-[#202327] border-[#34383D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F4F4F5]">
              {isSyncLoading
                ? 'Loading Career Roadmap...'
                : isAuthenticatedStudent
                  ? 'No Target Career Selected'
                  : 'Sign In to Load Personalized Roadmap'}
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Choose a career path in Career Explorer to activate and persist its milestone roadmap.
            </p>
          </div>
          {!isSyncLoading && (
            <Button size="sm" onClick={() => navigate('/dashboard/explorer')} className="gap-1.5 shrink-0">
              Select Target Career <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-5">
          {phases.map((phase) => {
            const isLocked = phase.status === 'locked';
            const isCompleted = phase.status === 'completed';
            const isActive = phase.status === 'active';

            return (
              <Card
                key={phase.id}
                className={`p-5 bg-[#202327] border-[#34383D] transition-all ${
                  isActive ? 'border-l-4 border-l-[#8B7CFF]' : isCompleted ? 'border-l-4 border-l-[#75D69A]' : 'opacity-65'
                }`}
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#34383D] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#71717A]">{phase.number}</span>
                    <div>
                      <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
                        {phase.title}
                        {isLocked && <Lock className="w-3.5 h-3.5 text-[#71717A]" />}
                      </h3>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">{phase.goal}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isCompleted ? 'done' : isActive ? 'progress' : 'default'} dot>
                      {isCompleted ? 'Completed' : isActive ? 'Active Phase' : 'Locked'}
                    </Badge>
                    <span className="text-xs text-[#71717A] font-mono">{phase.estimatedTime}</span>
                  </div>
                </div>

                {/* Phase Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 text-xs border-b border-[#34383D]">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Why it matters</span>
                    <p className="text-[#A1A1AA] text-[11px] mt-0.5 leading-relaxed">{phase.why}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Outcome</span>
                    <p className="text-[#75D69A] text-[11px] mt-0.5 leading-relaxed">{phase.outcome}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Skills Covered</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {phase.skills.map((s) => (
                        <Badge key={s} variant="skill" className="text-[9px] py-0">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="pt-3 space-y-2">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                    Deliverables & Milestones
                  </span>

                  <div className="space-y-1.5">
                    {phase.tasks.map((t) => {
                      const isTaskDone = activeRoadmap.completedTasks.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          onClick={() => !isLocked && !isSyncSaving && toggleRoadmapTask(t.id, !isTaskDone)}
                          className={`p-2.5 rounded-lg bg-[#17191C] border border-[#34383D] flex items-center justify-between text-xs transition-colors ${
                            isLocked || isSyncSaving
                              ? 'cursor-not-allowed opacity-60'
                              : 'cursor-pointer hover:border-[#4a5057]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isTaskDone ? (
                              <CheckCircle2 className="w-4 h-4 text-[#75D69A]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#71717A]" />
                            )}
                            <span className={isTaskDone ? 'line-through text-[#71717A]' : 'text-[#F4F4F5] font-medium'}>
                              {t.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="skill" className="capitalize text-[10px]">
                              {t.type}
                            </Badge>
                            <span className="text-[10px] text-[#71717A] font-mono">{t.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
