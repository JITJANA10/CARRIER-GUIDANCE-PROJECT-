import React, { useMemo, useState } from 'react';
import {
  Search,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  X,
  DollarSign,
  Scale,
  AlertCircle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import type { CareerCatalogItem, StudentSkillRecord } from '../types/state';

function computeCareerMatch(career: CareerCatalogItem, skillRecords: StudentSkillRecord[]): number | null {
  if (skillRecords.length === 0 || career.skillRequirements.length === 0) {
    return null;
  }

  const byKey = new Map<string, number>();
  for (const s of skillRecords) {
    byKey.set(s.name.trim().toLowerCase(), s.score);
  }

  let requiredSum = 0;
  let achievedSum = 0;
  for (const req of career.skillRequirements) {
    requiredSum += req.requiredScore;
    const recorded = byKey.get(req.name.trim().toLowerCase());
    if (recorded !== undefined) {
      achievedSum += Math.min(recorded, req.requiredScore);
    }
  }

  return requiredSum > 0 ? Math.min(100, Math.round((achievedSum / requiredSum) * 100)) : null;
}

export function CareerExplorer() {
  const {
    savedCareers,
    toggleSavedCareer,
    profile,
    setTargetGoal,
    careersCatalog,
    isCatalogLoading,
    catalogError,
    refreshCareersCatalog,
    skillRecords,
    isSyncSaving,
    syncError,
    clearSyncError,
    refreshStudentState
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingCareerSlug, setUpdatingCareerSlug] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  const [compareList, setCompareList] = useState<CareerCatalogItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const categories = useMemo(() => {
    const distinct = Array.from(new Set(careersCatalog.map((c) => c.category))).filter(Boolean);
    return ['All', ...distinct];
  }, [careersCatalog]);

  const filteredCareers = useMemo(() => {
    return careersCatalog.filter(
      (c) =>
        (activeCategory === 'All' || c.category === activeCategory) &&
        (c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.primarySkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [careersCatalog, activeCategory, searchQuery]);

  const toggleCompare = (career: CareerCatalogItem) => {
    if (compareList.some((c) => c.slug === career.slug)) {
      setCompareList((prev) => prev.filter((c) => c.slug !== career.slug));
    } else if (compareList.length >= 2) {
      setCompareList([compareList[1], career]);
    } else {
      setCompareList((prev) => [...prev, career]);
    }
  };

  const handleSetAsGoal = async (career: CareerCatalogItem) => {
    clearSyncError();
    setActionBanner(null);
    setUpdatingCareerSlug(career.slug);
    const ok = await setTargetGoal(career.title);
    setUpdatingCareerSlug(null);
    if (ok) {
      setActionBanner(`Target career synced to ${career.title}. Gaps and roadmap updated.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F4F4F5] tracking-tight">Career Explorer</h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Evaluate PathPilot's 6 canonical pathways, compensation, and competency fit.
          </p>
        </div>

        {compareList.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompareModal(true)}
            className="border-[#8B7CFF]/50 text-[#8B7CFF] bg-[#8B7CFF]/10 gap-2 shrink-0"
          >
            <Scale className="w-4 h-4" /> Compare ({compareList.length}/2)
          </Button>
        )}
      </div>

      {/* Sync / Catalog Status Feedback */}
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

      {actionBanner && !syncError && (
        <div className="p-2.5 rounded-lg bg-[#75D69A]/10 border border-[#75D69A]/30 text-xs text-[#75D69A] flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {actionBanner}
          </span>
          <button onClick={() => setActionBanner(null)} className="text-[#75D69A]/70 hover:text-[#75D69A]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search roles, required skills (e.g. Python, SQL, Security)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#202327] border border-[#34383D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#8B7CFF] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[#26292E] text-white border border-[#34383D] shadow-sm font-semibold'
                  : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#202327]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error State */}
      {isCatalogLoading && careersCatalog.length === 0 ? (
        <Card className="p-8 bg-[#202327] border-[#34383D] text-center text-xs text-[#A1A1AA]">
          Loading career catalog from SQLite backend...
        </Card>
      ) : catalogError && careersCatalog.length === 0 ? (
        <Card className="p-6 bg-[#202327] border-rose-500/30 flex items-center justify-between gap-4">
          <div className="text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{catalogError}</span>
          </div>
          <Button size="xs" variant="outline" onClick={refreshCareersCatalog} className="gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCareers.map((career) => {
            const isSaved = savedCareers.includes(career.slug) || savedCareers.includes(career.id);
            const isCurrentGoal =
              profile.goal?.toLowerCase() === career.title.toLowerCase() ||
              profile.goal?.toLowerCase() === career.slug;
            const isComparing = compareList.some((c) => c.slug === career.slug);
            const computedMatch = computeCareerMatch(career, skillRecords);

            return (
              <Card
                key={career.id}
                className={`p-4 bg-[#202327] border-[#34383D] hover:border-[#4a5057] transition-all flex flex-col justify-between ${
                  isCurrentGoal ? 'border-l-4 border-l-[#75D69A]' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#17191C] border border-[#34383D] flex items-center justify-center text-[#8B7CFF] shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#F4F4F5] leading-snug">{career.title}</h3>
                        <span className="text-[11px] text-[#71717A]">{career.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSavedCareer(career.slug)}
                      disabled={isSyncSaving}
                      className="text-[#71717A] hover:text-[#F4F4F5] p-1 disabled:opacity-50"
                      title={isSaved ? 'Saved' : 'Save career'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#8B7CFF]" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Match & Compensation Bar */}
                  <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-[#17191C] border border-[#34383D]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#71717A] uppercase font-bold">Match</span>
                      <span className="text-[#75D69A] font-bold font-mono">
                        {computedMatch !== null ? `${computedMatch}%` : 'Unassessed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#A1A1AA] font-mono text-[11px]">
                      <DollarSign className="w-3 h-3 text-[#71717A]" />
                      <span>{career.salaryRange}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2">{career.description}</p>

                  {/* Skills Required */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">Core Competencies</span>
                    <div className="flex flex-wrap gap-1">
                      {career.primarySkills.map((s) => (
                        <Badge key={s} variant="skill" className="text-[10px] py-0">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-[#34383D] flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleCompare(career)}
                    className={`text-[11px] font-medium transition-colors ${
                      isComparing ? 'text-[#8B7CFF] font-semibold' : 'text-[#71717A] hover:text-[#A1A1AA]'
                    }`}
                  >
                    {isComparing ? '✓ Comparing' : '+ Compare'}
                  </button>

                  {isCurrentGoal ? (
                    <Badge variant="done" dot>
                      Current Goal
                    </Badge>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isSyncSaving}
                      onClick={() => handleSetAsGoal(career)}
                      className="text-[11px]"
                    >
                      {updatingCareerSlug === career.slug ? 'Saving...' : 'Set as Goal'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Compare Modal Drawer */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17191C] border border-[#34383D] rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#34383D] pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#8B7CFF]" />
                <h3 className="text-sm font-bold text-[#F4F4F5]">Role Comparison</h3>
              </div>
              <button onClick={() => setShowCompareModal(false)} className="text-[#71717A] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {compareList.length < 2 ? (
              <p className="text-xs text-[#A1A1AA] py-4 text-center">
                Please select at least 2 roles from the explorer to compare them side by side.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-xs">
                {compareList.map((item) => {
                  const match = computeCareerMatch(item, skillRecords);
                  return (
                    <div key={item.id} className="p-3.5 rounded-lg bg-[#202327] border border-[#34383D] space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#F4F4F5]">{item.title}</h4>
                        <span className="text-[11px] text-[#71717A]">{item.category}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[#71717A] uppercase font-bold">Readiness Match</span>
                        <p className="text-[#75D69A] font-bold text-sm">{match !== null ? `${match}%` : 'Unassessed'}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[#71717A] uppercase font-bold">Compensation</span>
                        <p className="text-[#F4F4F5] font-mono">{item.salaryRange}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[#71717A] uppercase font-bold">Market Demand</span>
                        <p className="text-[#42C5E8]">
                          {item.demand} ({item.openings})
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[#71717A] uppercase font-bold">Skills Required</span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.primarySkills.map((s) => (
                            <Badge key={s} variant="skill" className="text-[9px] py-0">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#34383D]">
              <Button size="sm" onClick={() => setShowCompareModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
