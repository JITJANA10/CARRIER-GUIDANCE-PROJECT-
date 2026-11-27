import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  Briefcase,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function GapAnalysis() {
  const {
    profile,
    skillGaps,
    skillRecords,
    careersCatalog,
    updateSkills,
    isSyncLoading,
    isSyncSaving,
    syncError,
    refreshStudentState,
    isAuthenticatedStudent
  } = useAppContext();

  const navigate = useNavigate();
  const [filterPriority, setFilterPriority] = useState<'All' | 'Critical' | 'High' | 'Medium'>('All');
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [scoreDraft, setScoreDraft] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const target = skillGaps?.targetCareer || profile.goal || null;

  const analyzedSkills = useMemo(() => {
    if (skillGaps && skillGaps.items.length > 0) {
      return skillGaps.items;
    }

    // Guest / unauthenticated catalog fallback without fabricating proficiency scores
    const matchedCareer = target
      ? careersCatalog.find((c) => c.title.toLowerCase() === target.toLowerCase() || c.slug === target.toLowerCase())
      : careersCatalog[0];

    if (!matchedCareer) return [];

    const byKey = new Map(skillRecords.map((s) => [s.name.trim().toLowerCase(), s]));
    return matchedCareer.skillRequirements.map((req) => {
      const rec = byKey.get(req.name.trim().toLowerCase());
      const currentScore = rec ? rec.score : null;
      const gap = currentScore === null ? null : Math.max(0, req.requiredScore - currentScore);
      const priority: 'Critical' | 'High' | 'Medium' | 'None' =
        gap === null ? 'High' : gap >= 25 ? 'Critical' : gap >= 15 ? 'High' : gap > 0 ? 'Medium' : 'None';

      return {
        skill: req.name,
        skillKey: req.name.toLowerCase(),
        requiredScore: req.requiredScore,
        currentScore,
        classification: rec ? rec.classification : ('UNASSESSED' as const),
        gap,
        priority,
        reason:
          currentScore === null
            ? `No recorded score yet for ${req.name}. Record your proficiency to measure the gap.`
            : `${currentScore}/100 recorded vs ${req.requiredScore}/100 target.`,
        time: req.time,
        resource: req.resource,
        project: req.project,
        category: req.category
      };
    });
  }, [skillGaps, target, careersCatalog, skillRecords]);

  const filteredSkills = analyzedSkills.filter(
    (s) => filterPriority === 'All' || s.priority === filterPriority
  );

  const criticalCount = analyzedSkills.filter((s) => s.priority === 'Critical').length;
  const highCount = analyzedSkills.filter((s) => s.priority === 'High').length;
  const assessedCount = analyzedSkills.filter((s) => s.currentScore !== null).length;

  const startEditSkill = (skillName: string, currentScore: number | null) => {
    setFormError(null);
    setSavedNotice(null);
    setEditingSkill(skillName);
    setScoreDraft(currentScore !== null ? String(currentScore) : '');
  };

  const handleSaveSkillScore = async (skillName: string) => {
    setFormError(null);
    setSavedNotice(null);

    const trimmed = scoreDraft.trim();
    const numeric = Number(trimmed);
    if (!trimmed || !Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
      setFormError(`Enter a valid score between 0 and 100 for ${skillName}.`);
      return;
    }

    const rounded = Math.round(numeric);
    const ok = await updateSkills([
      {
        name: skillName,
        score: rounded,
        careerSlug: skillGaps?.careerSlug || undefined
      }
    ]);

    if (ok) {
      setEditingSkill(null);
      setScoreDraft('');
      setSavedNotice(`${skillName} updated to ${rounded}/100 and synchronized with your profile.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F4F4F5] tracking-tight">Skill Gap Engine</h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Diagnostic variance between your recorded skills and target role:{' '}
            <span className="text-[#8B7CFF] font-semibold">{target || 'Not selected'}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#17191C] p-1 rounded-lg border border-[#34383D]">
          {(['All', 'Critical', 'High', 'Medium'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filterPriority === p
                  ? 'bg-[#26292E] text-white shadow-sm font-semibold'
                  : 'text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Sync & Validation Banners */}
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

      {formError && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {savedNotice && !syncError && (
        <div className="p-2.5 rounded-lg bg-[#75D69A]/10 border border-[#75D69A]/30 text-xs text-[#75D69A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#202327] border-[#34383D]">
          <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">Critical Gaps</span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{criticalCount}</div>
          <p className="text-[11px] text-[#71717A] mt-1">High priority blockers to target role</p>
        </Card>
        <Card className="p-4 bg-[#202327] border-[#34383D]">
          <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">High / Unassessed</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{highCount}</div>
          <p className="text-[11px] text-[#71717A] mt-1">Skills needing sprint focus or score calibration</p>
        </Card>
        <Card className="p-4 bg-[#202327] border-[#34383D]">
          <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">Assessed Coverage</span>
          <div className="text-2xl font-bold text-[#75D69A] font-mono mt-1">
            {assessedCount}/{analyzedSkills.length} Skills
          </div>
          <p className="text-[11px] text-[#71717A] mt-1">
            {skillGaps?.readinessPercent !== null && skillGaps?.readinessPercent !== undefined
              ? `${skillGaps.readinessPercent}% target benchmark coverage`
              : 'Record skills below to measure readiness'}
          </p>
        </Card>
      </div>

      {!target && isAuthenticatedStudent ? (
        <Card className="p-6 bg-[#202327] border-[#34383D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F4F4F5]">No Target Career Selected</h3>
            <p className="text-xs text-[#A1A1AA]">
              Select a target career in Career Explorer to calculate your career-specific skill gaps.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/dashboard/explorer')} className="gap-1.5 shrink-0">
            Choose Target Career <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Card>
      ) : isSyncLoading && analyzedSkills.length === 0 ? (
        <Card className="p-6 bg-[#202327] border-[#34383D] text-xs text-[#A1A1AA] text-center">
          Synchronizing skill gap profile from database...
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSkills.map((item) => {
            const isUnassessed = item.currentScore === null;
            const currentPct = item.currentScore ?? 0;
            const badgeVariant =
              item.priority === 'Critical'
                ? 'critical'
                : item.priority === 'High'
                  ? 'high'
                  : item.priority === 'None'
                    ? 'done'
                    : 'medium';

            return (
              <Card
                key={item.skill}
                className={`p-4 bg-[#202327] border-[#34383D] ${
                  item.priority === 'Critical'
                    ? 'border-l-4 border-l-rose-500'
                    : item.priority === 'High'
                      ? 'border-l-4 border-l-amber-500'
                      : item.priority === 'None'
                        ? 'border-l-4 border-l-[#75D69A]'
                        : 'border-l-4 border-l-[#8B7CFF]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Skill & Delta */}
                  <div className="space-y-2 lg:max-w-md w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#F4F4F5]">{item.skill}</h3>
                      <Badge variant={badgeVariant as any} dot>
                        {item.classification === 'UNASSESSED'
                          ? 'Unassessed'
                          : item.priority === 'None'
                            ? 'Target Met'
                            : `${item.priority} Priority`}
                      </Badge>
                      <span className="text-[10px] text-[#71717A]">
                        • {item.category}
                        {item.classification !== 'UNASSESSED' ? ` • ${item.classification}` : ''}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#A1A1AA]">
                          Current:{' '}
                          <strong className="text-white">
                            {isUnassessed ? 'Unassessed' : `${item.currentScore}%`}
                          </strong>
                        </span>
                        <span className="text-[#71717A]">
                          Target: <strong className="text-[#75D69A]">{item.requiredScore}%</strong>
                        </span>
                        <span className={item.gap === 0 ? 'text-[#75D69A] font-semibold' : 'text-rose-400 font-semibold'}>
                          {item.gap === null ? 'Gap: Unassessed' : item.gap === 0 ? 'Gap: 0%' : `Gap: -${item.gap}%`}
                        </span>
                      </div>
                      <Progress
                        value={isUnassessed ? 0 : Math.min(100, (currentPct / item.requiredScore) * 100)}
                        indicatorClassName={item.priority === 'Critical' ? 'bg-rose-500' : 'bg-[#75D69A]'}
                      />
                    </div>
                  </div>

                  {/* Middle: Recommended Resource & Project */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div className="p-2.5 rounded-lg bg-[#17191C] border border-[#34383D]">
                      <span className="text-[10px] text-[#71717A] uppercase font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#8B7CFF]" /> Recommended Resource
                      </span>
                      <p className="text-xs font-semibold text-[#F4F4F5] mt-1 truncate">{item.resource}</p>
                      <span className="text-[10px] text-[#71717A] font-mono">Est. {item.time}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#17191C] border border-[#34383D]">
                      <span className="text-[10px] text-[#71717A] uppercase font-bold flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#42C5E8]" /> Portfolio Deliverable
                      </span>
                      <p className="text-xs font-semibold text-[#F4F4F5] mt-1 truncate">{item.project}</p>
                      <span className="text-[10px] text-[#75D69A]">Proof of Competence</span>
                    </div>
                  </div>

                  {/* Right: Score Update + Routine Action */}
                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-end gap-2">
                    {editingSkill === item.skill ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={scoreDraft}
                          onChange={(e) => setScoreDraft(e.target.value)}
                          placeholder="0-100"
                          aria-label={`Score for ${item.skill}`}
                          className="w-20 bg-[#17191C] border border-[#8B7CFF] rounded-md px-2 py-1 text-xs font-mono text-[#F4F4F5] focus:outline-none"
                        />
                        <Button
                          size="xs"
                          disabled={isSyncSaving}
                          onClick={() => handleSaveSkillScore(item.skill)}
                        >
                          {isSyncSaving ? '...' : 'Save'}
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setEditingSkill(null);
                            setFormError(null);
                          }}
                          className="border-[#34383D]"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => startEditSkill(item.skill, item.currentScore)}
                          className="gap-1 border-[#34383D] text-[#A1A1AA] hover:text-white"
                        >
                          <Edit3 className="w-3 h-3" /> {isUnassessed ? 'Record Score' : 'Update Score'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate('/dashboard/routine')}
                          className="gap-1 border-[#34383D]"
                        >
                          Add to Routine <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
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
