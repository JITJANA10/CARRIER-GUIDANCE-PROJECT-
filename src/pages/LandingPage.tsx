import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Brain, Map, Compass, ShieldCheck } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand-violet/20 rounded-full blur-[100px] -z-10" />
        
        <div className="container mx-auto px-4 md:px-8 text-center space-y-8">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Your Future. <span className="text-gradient">Mapped Personally.</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Discover the right career, education, skills, mentors and opportunities — all personalized around who you are and where you want to go.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button size="lg" asChild className="text-md h-12 px-8 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
              <Link to="/onboarding">Build My Career Roadmap →</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-md h-12 px-8 rounded-full border-white/20 hover:bg-white/5">
              <Link to="/dashboard/explorer">Explore Careers</Link>
            </Button>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center gap-2 text-sm text-slate-400 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ShieldCheck className="h-4 w-4 text-brand-cyan" />
            <span>AI-powered guidance • Human mentorship • Real-world opportunities</span>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-black/20 border-y border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">One platform. Your entire future.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Know Yourself → Choose Your Direction → Build Skills → Gain Experience → Launch Your Career</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/dashboard/assessments" className="block">
              <Card glass className="border-white/10 relative overflow-hidden group h-full hover:border-brand-cyan/50 transition-colors cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-navy border border-white/10 flex items-center justify-center mb-6">
                    <Brain className="h-8 w-8 text-brand-cyan group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-brand-cyan tracking-wider">01</div>
                  <h3 className="text-xl font-bold">Discover Yourself</h3>
                  <p className="text-slate-400">Understand your interests, strengths, personality and goals through AI-powered assessments.</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/roadmap" className="block">
              <Card glass className="border-white/10 relative overflow-hidden group h-full hover:border-brand-violet/50 transition-colors cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-navy border border-white/10 flex items-center justify-center mb-6">
                    <Map className="h-8 w-8 text-brand-violet group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-brand-violet tracking-wider">02</div>
                  <h3 className="text-xl font-bold">Build Your Path</h3>
                  <p className="text-slate-400">Get personalized career, education and skill recommendations mapped out in a visual timeline.</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard" className="block">
              <Card glass className="border-white/10 relative overflow-hidden group h-full hover:border-brand-blue/50 transition-colors cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-navy border border-white/10 flex items-center justify-center mb-6">
                    <Compass className="h-8 w-8 text-brand-blue group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-brand-blue tracking-wider">03</div>
                  <h3 className="text-xl font-bold">Take Action</h3>
                  <p className="text-slate-400">Follow small steps, work with mentors, build projects and discover matching opportunities.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-blue/10" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold max-w-3xl mx-auto">Your future doesn't need to be figured out all at once.</h2>
          <p className="text-xl text-slate-300">Take the first step. PathPilot will help you figure out the next one.</p>
          <div className="pt-8">
            <Button size="lg" asChild className="text-md h-12 px-8 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Link to="/onboarding">Build My Personalized Roadmap →</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
