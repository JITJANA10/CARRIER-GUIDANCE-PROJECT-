import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sparkles, Send, Bot, User, Users, Star, Clock, Briefcase, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Data Models for Marketplace
type MentorStatus = 'Requested' | 'Accepted' | 'Scheduled' | 'Completed';

type Mentor = {
  id: string;
  name: string;
  expertise: string;
  experience: string;
  industry: string;
  skills: string[];
  languages: string[];
  availability: string;
  topics: string[];
  rating: number;
  reviews: number;
  price: number; // For future B2C/B2B
  avatar: string;
};

const mockMentors: Mentor[] = [
  {
    id: 'm1',
    name: 'Sarah Jenkins',
    expertise: 'Senior Product Manager',
    experience: '8+ years',
    industry: 'FinTech & B2B SaaS',
    skills: ['Product Strategy', 'Agile', 'Stakeholder Mgmt'],
    languages: ['English', 'Spanish'],
    availability: 'Evenings & Weekends',
    topics: ['Career guidance', 'Resume review', 'Mock interview'],
    rating: 4.9,
    reviews: 124,
    price: 150,
    avatar: 'SJ'
  },
  {
    id: 'm2',
    name: 'David Chen',
    expertise: 'Lead Data Analyst',
    experience: '6 years',
    industry: 'E-commerce',
    skills: ['SQL', 'Python', 'Tableau', 'A/B Testing'],
    languages: ['English', 'Mandarin'],
    availability: 'Weekdays',
    topics: ['Project guidance', 'Research guidance', 'Industry guidance'],
    rating: 4.8,
    reviews: 89,
    price: 120,
    avatar: 'DC'
  }
];

export function Mentors() {
  const { profile } = useAppContext();
  const [activeTab, setActiveTab] = useState<'ai' | 'human'>('ai');
  
  // AI State
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hello ${profile.firstName || 'there'}! I'm PathPilot AI. I can help you with study planning, debugging, interview prep, and career strategy. What's on your mind?` }
  ]);
  const [input, setInput] = useState('');

  // Human State
  const [requests, setRequests] = useState<Record<string, MentorStatus>>({
    'm1': 'Requested'
  });

  const handleSendAI = () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Based on your goal, tackling "${userMessage}" requires breaking it down. Let's start by looking at your current roadmap. Do you want me to generate a specific study plan for this?` 
      }]);
    }, 1000);
  };

  const handleRequestMentor = (id: string) => {
    setRequests(prev => ({ ...prev, [id]: 'Requested' }));
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="text-brand-violet h-8 w-8" /> Mentorship Hub
          </h1>
          <p className="text-slate-400 mt-1 text-lg">AI-powered guidance and world-class human experts.</p>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-brand-violet text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Sparkles className="h-4 w-4" /> PathPilot AI
          </button>
          <button 
            onClick={() => setActiveTab('human')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'human' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Users className="h-4 w-4" /> Human Mentors
          </button>
        </div>
      </motion.div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          
          {/* AI MENTOR TAB */}
          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute inset-0 flex flex-col"
            >
              <Card glass className="flex-1 border-brand-violet/30 flex flex-col overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-brand-violet/20 text-brand-violet border border-brand-violet/30' : 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30'}`}>
                        {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'assistant' ? 'bg-white/5 border border-white/10 rounded-tl-none' : 'bg-brand-blue/20 border border-brand-blue/30 rounded-tr-none text-white'}`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-white/10 bg-black/40">
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    {['Study planning', 'Project guidance', 'Resume suggestions', 'Interview preparation', 'Debugging help'].map(topic => (
                      <Button key={topic} variant="outline" size="sm" className="whitespace-nowrap border-white/10 hover:bg-white/10 text-xs text-slate-300" onClick={() => setInput(`I need help with ${topic.toLowerCase()}`)}>
                        {topic}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendAI()}
                      placeholder="Ask your AI mentor anything..."
                      className="w-full bg-black/60 border border-brand-violet/30 rounded-xl pl-4 pr-12 py-4 text-white focus:outline-none focus:border-brand-violet transition-colors"
                    />
                    <Button onClick={handleSendAI} size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-violet hover:bg-brand-violet/80 text-white rounded-lg h-10 w-10 p-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* HUMAN MENTORS TAB */}
          {activeTab === 'human' && (
            <motion.div 
              key="human"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 overflow-y-auto pb-8"
            >
              <div className="grid grid-cols-1 gap-6">
                {mockMentors.map(mentor => {
                  const status = requests[mentor.id];
                  
                  return (
                    <Card key={mentor.id} glass className="border-white/10 hover:border-brand-blue/30 transition-all overflow-hidden group">
                      <CardContent className="p-0 flex flex-col md:flex-row">
                        
                        {/* Profile Info */}
                        <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-white/10">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-violet flex items-center justify-center text-xl font-bold text-white shadow-lg">
                              {mentor.avatar}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
                              <p className="text-brand-blue font-medium">{mentor.expertise}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {mentor.experience}</span>
                                <span className="flex items-center gap-1 text-amber-400"><Star className="h-3 w-3 fill-amber-400" /> {mentor.rating} ({mentor.reviews} reviews)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-3 text-sm mb-4">
                            <div>
                              <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Industry</span>
                              <span className="text-slate-300">{mentor.industry}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Languages</span>
                              <span className="text-slate-300">{mentor.languages.join(', ')}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Top Skills</span>
                            <div className="flex flex-wrap gap-1">
                              {mentor.skills.map(skill => <span key={skill} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-slate-300">{skill}</span>)}
                            </div>
                          </div>
                        </div>

                        {/* Booking & Topics */}
                        <div className="p-6 md:w-80 bg-black/20 flex flex-col">
                          <h4 className="text-sm font-bold text-white mb-3">Mentoring Topics</h4>
                          <ul className="space-y-2 mb-6 flex-1">
                            {mentor.topics.map(topic => (
                              <li key={topic} className="flex items-center gap-2 text-sm text-slate-400">
                                <CheckCircle2 className="h-4 w-4 text-brand-cyan" /> {topic}
                              </li>
                            ))}
                          </ul>
                          
                          <div className="mt-auto space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                              <span className="text-sm text-slate-400"><Clock className="h-4 w-4 inline mr-1" /> 1 Hour Session</span>
                              <span className="font-bold text-white">${mentor.price}</span>
                            </div>
                            
                            {status ? (
                              <div className="w-full text-center p-3 rounded-lg border border-white/10 bg-white/5">
                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Request Status</div>
                                <div className={`font-bold ${status === 'Requested' ? 'text-amber-400' : status === 'Accepted' ? 'text-green-400' : 'text-brand-blue'}`}>
                                  {status}
                                </div>
                              </div>
                            ) : (
                              <Button onClick={() => handleRequestMentor(mentor.id)} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                                Request Session
                              </Button>
                            )}
                          </div>
                        </div>
                        
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
