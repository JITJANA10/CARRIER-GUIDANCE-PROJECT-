import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

const steps = [
  'Profile',
  'Interests',
  'Strengths',
  'Target Career',
  'Generating Roadmap'
];

const availableInterests = [
  'Product Strategy',
  'Data Analytics',
  'Software Engineering',
  'UX / Interaction Design',
  'Cloud Architecture',
  'Cybersecurity',
  'AI & Machine Learning',
  'User Research'
];

const availableStrengths = [
  'Analytical Problem Solving',
  'Executive Communication',
  'Prototyping & Wireframing',
  'SQL & Data Querying',
  'Cross-functional Leadership',
  'Systems Thinking',
  'Agile Execution'
];

const CANONICAL_CAREER_FALLBACKS = [
  'Product Manager',
  'AI / Machine Learning Engineer',
  'Full-Stack Developer',
  'Data Analyst / BI Engineer',
  'Cloud Solutions Architect',
  'Cybersecurity Specialist'
];

export function Onboarding() {
  const {
    profile,
    updateProfile,
    careersCatalog,
    isAuthenticatedStudent,
    isSyncSaving,
    syncError,
    clearSyncError
  } = useAppContext();

  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const navigate = useNavigate();

  const availableGoals =
    careersCatalog.length > 0 ? careersCatalog.map((c) => c.title) : CANONICAL_CAREER_FALLBACKS;

  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel || 'University / College Student');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>(profile.strengths || []);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(profile.goal || null);

  const syncedProfileKeyRef = useRef<string>('');
  useEffect(() => {
    const profileKey = `${profile.id}:${profile.firstName}:${profile.lastName}:${profile.goal ?? ''}:${profile.educationLevel ?? ''}`;
    if (syncedProfileKeyRef.current !== profileKey && currentStep < 4) {
      syncedProfileKeyRef.current = profileKey;
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEducationLevel(profile.educationLevel || 'University / College Student');
      setSelectedInterests(profile.interests || []);
      setSelectedStrengths(profile.strengths || []);
      setSelectedGoal(profile.goal || null);
    }
  }, [profile, currentStep]);

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const toggleStrength = (item: string) => {
    setSelectedStrengths((prev) => (prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]));
  };

  const persistOnboarding = async () => {
    setSaveFailed(false);
    clearSyncError();

    const ok = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      educationLevel,
      interests: selectedInterests,
      strengths: selectedStrengths,
      goal: selectedGoal,
      onboardingCompleted: true
    });

    if (!ok && isAuthenticatedStudent) {
      setSaveFailed(true);
      return;
    }

    setTimeout(() => {
      navigate('/dashboard');
    }, 900);
  };

  const handleNext = async () => {
    setValidationError(null);

    if (currentStep === 0 && !firstName.trim()) {
      setValidationError('First name is required to initialize your student profile.');
      return;
    }

    if (currentStep === 3 && !selectedGoal) {
      setValidationError('Please select a target career goal to synchronize your roadmap.');
      return;
    }

    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      if (nextStep === steps.length - 1) {
        await persistOnboarding();
      }
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setSaveFailed(false);
    clearSyncError();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between relative px-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  idx === currentStep
                    ? 'bg-[#8B7CFF] text-white ring-4 ring-[#8B7CFF]/20 shadow-sm'
                    : idx < currentStep
                    ? 'bg-[#75D69A] text-[#111214]'
                    : 'bg-[#202327] border border-[#34383D] text-[#71717A]'
                }`}
              >
                {idx < currentStep ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className={`text-[10px] hidden sm:block ${idx <= currentStep ? 'text-[#F4F4F5] font-medium' : 'text-[#71717A]'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Content Box */}
        <Card className="p-6 bg-[#202327] border-[#34383D] min-h-[360px] flex flex-col justify-between">
          <div>
            {!isAuthenticatedStudent && (
              <div className="mb-4 p-2.5 rounded-lg bg-[#17191C] border border-[#34383D] text-[11px] text-[#A1A1AA] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#8B7CFF] shrink-0" />
                <span>Sign in as a student account to persist your profile and roadmap updates permanently to SQLite.</span>
              </div>
            )}

            {validationError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#F4F4F5]">Personal Career Identity</h2>
                  <p className="text-xs text-[#71717A] mt-0.5">Let's set up your profile to personalize benchmarks.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#A1A1AA] uppercase font-bold">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-[#17191C] border border-[#34383D] rounded-lg p-2 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#8B7CFF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#A1A1AA] uppercase font-bold">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-[#17191C] border border-[#34383D] rounded-lg p-2 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#8B7CFF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-[#A1A1AA] uppercase font-bold">Current Status / Level</label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full bg-[#17191C] border border-[#34383D] rounded-lg p-2 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#8B7CFF]"
                    >
                      <option>University / College Student</option>
                      <option>Junior Developer</option>
                      <option>Junior Associate (0-2 yrs)</option>
                      <option>Middle UX Designer (2-4 yrs)</option>
                      <option>Career Switcher</option>
                      <option>Senior Professional</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#F4F4F5]">Career Interests</h2>
                  <p className="text-xs text-[#71717A] mt-0.5">Select disciplines that excite you the most.</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {availableInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/50 font-semibold'
                            : 'bg-[#17191C] text-[#A1A1AA] border-[#34383D] hover:text-white'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#F4F4F5]">Core Strengths</h2>
                  <p className="text-xs text-[#71717A] mt-0.5">Where do you feel you have foundational competence?</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {availableStrengths.map((strength) => {
                    const isSelected = selectedStrengths.includes(strength);
                    return (
                      <button
                        key={strength}
                        onClick={() => toggleStrength(strength)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-[#75D69A]/15 text-[#75D69A] border-[#75D69A]/50 font-semibold'
                            : 'bg-[#17191C] text-[#A1A1AA] border-[#34383D] hover:text-white'
                        }`}
                      >
                        {strength}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#F4F4F5]">Primary Target Goal</h2>
                  <p className="text-xs text-[#71717A] mt-0.5">Choose the role you are aiming to achieve.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {availableGoals.map((goal) => {
                    const isSelected = selectedGoal === goal;
                    return (
                      <div
                        key={goal}
                        onClick={() => setSelectedGoal(goal)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#8B7CFF]/15 border-[#8B7CFF] text-[#F4F4F5]'
                            : 'bg-[#17191C] border-[#34383D] text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-semibold">{goal}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#8B7CFF]" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="py-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#8B7CFF]/20 border border-[#8B7CFF]/40 flex items-center justify-center text-[#8B7CFF] mx-auto animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                {saveFailed || syncError ? (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-rose-300">Failed to Persist Profile</h3>
                    <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                      {syncError || 'Unable to synchronize onboarding changes with the backend.'}
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={handleBack} className="gap-1 border-[#34383D]">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </Button>
                      <Button size="sm" onClick={persistOnboarding} disabled={isSyncSaving} className="gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" /> {isSyncSaving ? 'Saving...' : 'Retry Sync'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-base font-bold text-[#F4F4F5]">Synthesizing Your Career Twin...</h3>
                      <p className="text-xs text-[#71717A] max-w-sm mx-auto mt-1">
                        Saving your profile, recalculating gaps for {selectedGoal}, and resolving your active milestone path.
                      </p>
                    </div>
                    <div className="w-48 mx-auto">
                      <div className="h-1.5 w-full bg-[#17191C] rounded-full overflow-hidden border border-[#34383D]">
                        <div className="h-full bg-[#8B7CFF] animate-pulse w-3/4 rounded-full" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#34383D]">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-1 border-[#34383D]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>

              <Button size="sm" onClick={handleNext} disabled={isSyncSaving} className="gap-1">
                {currentStep === steps.length - 2 ? 'Generate Roadmap' : 'Continue'} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
