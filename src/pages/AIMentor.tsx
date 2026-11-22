import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function AIMentor() {
  const { profile } = useAppContext();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hello ${profile.firstName || 'there'}! I'm PathPilot, your personal AI career mentor. Based on your goal to become a ${profile.goal || 'Product Manager'}, I see you need to work on Data Analysis next. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `That's a great question about ${userMessage.split(' ')[0]}. In the context of your roadmap, you should focus on practical application. Would you like me to generate a mini-project for you to practice this?` 
      }]);
    }, 1000);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="text-brand-violet h-8 w-8" /> PathPilot AI Mentor
        </h1>
        <p className="text-slate-400 mt-1 text-lg">Your 24/7 personal career and skill advisor.</p>
      </motion.div>

      <Card glass className="flex-1 border-white/5 flex flex-col min-h-[500px] max-h-[70vh]">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-brand-violet/20 text-brand-violet border border-brand-violet/30' : 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30'}`}>
                  {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'assistant' ? 'bg-white/5 border border-white/10 rounded-tl-none' : 'bg-brand-blue/20 border border-brand-blue/30 rounded-tr-none text-white'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex gap-4 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              <Button variant="outline" size="sm" className="whitespace-nowrap border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/10" onClick={() => setInput('Explain SQL joins')}>Explain SQL joins</Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap border-brand-violet/30 text-brand-violet hover:bg-brand-violet/10" onClick={() => setInput('Help me prep for a PM interview')}>Help me prep for a PM interview</Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => setInput('Review my current roadmap')}>Review my roadmap</Button>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask your mentor anything..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white focus:outline-none focus:border-brand-violet transition-colors"
              />
              <Button 
                onClick={handleSend}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-violet hover:bg-brand-violet/80 text-white rounded-lg h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}
