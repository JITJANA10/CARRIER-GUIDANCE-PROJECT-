import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';

const steps = [
  "Profile", "Interests", "Strengths", "Goals", "Generating Roadmap"
];

export function Onboarding() {
  const { profile, updateProfile } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  // Form State
  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel || "University / College Student");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>(profile.strengths || []);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(profile.goal || null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleStrength = (strength: string) => {
    setSelectedStrengths(prev => 
      prev.includes(strength) ? prev.filter(s => s !== strength) : [...prev, strength]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      
      // If we reach the last step (generating), simulate loading then redirect
      if (currentStep === steps.length - 2) {
        updateProfile({
          firstName,
          lastName,
          educationLevel,
          interests: selectedInterests,
          strengths: selectedStrengths,
          goal: selectedGoal,
          onboardingCompleted: true
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10 -z-10 -translate-y-1/2" />
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${idx <= currentStep ? 'bg-brand-cyan text-brand-navy shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-brand-navy border border-white/20 text-slate-500'}`}>
                {idx + 1}
              </div>
              <span className={`text-xs absolute -bottom-6 whitespace-nowrap ${idx <= currentStep ? 'text-white' : 'text-slate-500 hidden md:block'}`}>{step}</span>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <Card glass className="min-h-[400px] flex flex-col">
          <CardContent className="flex-1 flex flex-col pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                    <p className="text-slate-400">Let's start with the basics to personalize your experience.</p>
                    <div className="space-y-4 pt-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-300">First Name</label>
                           <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-brand-cyan transition-colors" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-300">Last Name</label>
                           <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-brand-cyan transition-colors" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-300">Current Education Level</label>
                         <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-brand-cyan transition-colors">
                           <option>University / College Student</option>
                           <option>High School</option>
                           <option>Graduate</option>
                           <option>Working Professional</option>
                         </select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">What interests you?</h2>
                    <p className="text-slate-400">Select fields that you are naturally curious about.</p>
                    <div className="flex flex-wrap gap-3 pt-4">
                      {['Technology', 'Business', 'Finance', 'Design', 'Healthcare', 'Science', 'Media', 'Entrepreneurship', 'Law', 'Research'].map((item) => {
                        const isSelected = selectedInterests.includes(item);
                        return (
                          <button 
                            key={item} 
                            onClick={() => toggleInterest(item)}
                            className={`px-4 py-2 rounded-full border text-sm transition-all ${isSelected ? 'bg-brand-blue/20 border-brand-blue text-white' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/30'}`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">What are your strengths?</h2>
                    <p className="text-slate-400">Pick areas where you perform strongly.</p>
                    <div className="flex flex-wrap gap-3 pt-4">
                      {['Problem Solving', 'Communication', 'Creativity', 'Leadership', 'Analytical Thinking', 'Teamwork', 'Research', 'Adaptability'].map((item) => {
                        const isSelected = selectedStrengths.includes(item);
                        return (
                          <button 
                            key={item} 
                            onClick={() => toggleStrength(item)}
                            className={`px-4 py-2 rounded-full border text-sm transition-all ${isSelected ? 'bg-brand-violet/20 border-brand-violet text-white' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/30'}`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">What is your main goal right now?</h2>
                    <p className="text-slate-400">PathPilot will optimize your roadmap for this target.</p>
                    <div className="grid gap-3 pt-4">
                      {[
                        { title: 'Choose a career path', desc: 'Find what I should do next' },
                        { title: 'Get a job or internship', desc: 'Prepare for the market' },
                        { title: 'Build new skills', desc: 'Improve my current abilities' },
                      ].map((item, i) => {
                        const isSelected = selectedGoal === item.title;
                        return (
                          <div 
                            key={i} 
                            onClick={() => setSelectedGoal(item.title)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-brand-cyan/10 border-brand-cyan/50' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                          >
                            <h4 className={`font-semibold ${isSelected ? 'text-brand-cyan' : 'text-white'}`}>{item.title}</h4>
                            <p className="text-sm text-slate-400">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="w-20 h-20 rounded-full border-t-2 border-brand-cyan animate-spin" />
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Analyzing your profile</h2>
                      <p className="text-slate-400">Generating your personalized career roadmap...</p>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {currentStep < steps.length - 1 && (
              <div className="mt-auto pt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} disabled={currentStep === 0}>
                  Back
                </Button>
                <Button onClick={handleNext} className="bg-white text-black hover:bg-slate-200">
                  {currentStep === steps.length - 2 ? 'Generate Roadmap' : 'Next Step'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
