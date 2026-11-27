import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BrainCircuit, 
  Map, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  CalendarCheck, 
  Users, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#111214] text-[#F4F4F5]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 border-b border-[#34383D]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#202327] border border-[#34383D] text-xs text-[#A1A1AA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#75D69A]" />
            <span>PathPilot OS v1.0 • Built for Ambitious Builders</span>
            <ChevronRight className="w-3 h-3 text-[#71717A]" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F4F4F5] max-w-3xl mx-auto leading-tight">
            Your Future. <span className="text-[#8B7CFF]">Mapped Personally.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Your future doesn't need to be figured out all at once. Take the first step — PathPilot maps every subsequent milestone with continuous skill intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild className="gap-2 text-xs font-semibold px-6 shadow-md">
              <Link to="/onboarding">
                Build My Career Roadmap <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-xs font-semibold px-6 border-[#34383D]">
              <Link to="/dashboard">
                Explore Dashboard
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-[#71717A] pt-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#75D69A]" /> Verified Competency Benchmarks</span>
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-[#42C5E8]" /> Real-time Career Digital Twin</span>
          </div>
        </div>
      </section>

      {/* The 5-Pillar Operating Flywheel */}
      <section className="py-20 border-b border-[#34383D] bg-[#17191C]/50">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CFF]">Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F4F5]">The Five-Pillar Career Engine</h2>
            <p className="text-xs text-[#71717A] max-w-xl mx-auto">
              A systematic flywheel replacing academic ambiguity with continuous execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: '01',
                title: 'Discover Yourself',
                icon: BrainCircuit,
                desc: 'Deep psychometric and soft-skill baselines that uncover your unique analytical and interpersonal strengths.',
                path: '/dashboard/assessments'
              },
              {
                num: '02',
                title: 'Choose Direction',
                icon: Compass,
                desc: 'Market-calibrated role matching cross-referencing compensation, hiring demand, and skill affinity.',
                path: '/dashboard/explorer'
              },
              {
                num: '03',
                title: 'Build Skills',
                icon: Activity,
                desc: 'Digital Twin simulation benchmarking your proficiency against verified senior practitioner requirements.',
                path: '/dashboard/skills'
              },
              {
                num: '04',
                title: 'Gain Experience',
                icon: CalendarCheck,
                desc: 'Context-adaptive daily routines that generate 20–45 minute actionable portfolio deliverables.',
                path: '/dashboard/routine'
              },
              {
                num: '05',
                title: 'Launch Career',
                icon: Users,
                desc: 'Milestone phased roadmaps, portfolio case-study compilation, and 1-on-1 expert mentor feedback.',
                path: '/dashboard/roadmap'
              },
              {
                num: 'AI',
                title: '24/7 AI Mentor',
                icon: Sparkles,
                desc: 'Always-available strategic advisor context-aware of your current roadblocks and target role.',
                path: '/dashboard/ai-mentor'
              }
            ].map(pillar => (
              <Link key={pillar.num} to={pillar.path}>
                <Card className="p-5 bg-[#202327] border-[#34383D] hover:border-[#8B7CFF]/50 transition-all h-full flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#17191C] border border-[#34383D] flex items-center justify-center text-[#8B7CFF] group-hover:border-[#8B7CFF]/50 transition-colors">
                        <pillar.icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#71717A]">{pillar.num}</span>
                    </div>

                    <h3 className="text-sm font-bold text-[#F4F4F5] group-hover:text-white transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-1 text-[11px] text-[#8B7CFF] font-medium">
                    <span>Inspect module</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#111214]">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F4F5]">
            Stop guessing your career trajectory.
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto">
            Build your personalized competency roadmap in less than 3 minutes.
          </p>
          <div className="pt-2">
            <Button size="lg" asChild className="gap-2 text-xs font-semibold px-8">
              <Link to="/onboarding">Get Started with PathPilot <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
