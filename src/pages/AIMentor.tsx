import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  Clock, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export function AIMentor() {
  const { profile, activeRoadmap } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeSession, setActiveSession] = useState('session-1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activePhase = activeRoadmap?.phases.find((p) => p.id === activeRoadmap.currentPhaseId);
  const greetingName = profile.firstName?.trim() || 'there';
  const greetingGoalText = profile.goal
    ? `Based on your target goal to become a ${profile.goal}, how can I assist your career progression today?`
    : 'You have not set a target career goal yet. How can I help you explore roles or sharpen your skills today?';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      text: `Hello ${greetingName}. I am PathPilot AI, your strategic career advisor. ${greetingGoalText}`,
      timestamp: 'Now'
    }
  ]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'm1') {
        return [
          {
            ...prev[0],
            text: `Hello ${greetingName}. I am PathPilot AI, your strategic career advisor. ${greetingGoalText}`
          }
        ];
      }
      return prev;
    });
  }, [greetingName, greetingGoalText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text: userText, timestamp: now }
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_token') : null;
      const response = await fetch('http://localhost:3001/api/v1/ai/mentor/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: userText })
      });

      const resData = await response.json();
      const reply = resData.success && resData.data?.reply
        ? resData.data.reply
        : `That is an essential question regarding your career roadmap. In the context of your target goal as a ${profile.goal || 'Product Manager'}, focus on practical proof of competence. I suggest breaking this down into a 30-minute daily routine task and drafting a project artifact for your portfolio.`;

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      // Graceful local fallback if offline
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `In the context of your target goal as a ${profile.goal || 'Product Manager'}, focus on practical proof of competence. Break this down into high-priority roadmap tasks.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Top Context Indicator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#202327] border border-[#34383D]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-[#F4F4F5]">PathPilot AI Mentor Workspace</h2>
              <Badge variant="medium" className="text-[10px] py-0">v1.0 Preview</Badge>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Calibrated to role: <strong className="text-white">{profile.goal || 'Not selected'}</strong>
              {activePhase ? ` • Phase ${activePhase.number}: ${activePhase.title}` : ''}
            </p>
          </div>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#71717A] bg-[#17191C] px-2.5 py-1 rounded-md border border-[#34383D]">
          <Info className="w-3.5 h-3.5 text-[#42C5E8]" />
          <span>Prototype simulation mode (Direct Gemini streaming backend ready to plug in)</span>
        </div>
      </div>

      {/* Main Workspace: Left Chat History Sidebar + Right Active Conversation */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Sessions Sidebar */}
        <div className="hidden md:flex w-60 flex-col rounded-xl bg-[#202327] border border-[#34383D] p-3 shrink-0 justify-between">
          <div className="space-y-3">
            <Button size="xs" variant="outline" className="w-full justify-start gap-2 border-[#34383D]">
              <Plus className="w-3.5 h-3.5" /> New Consultation
            </Button>

            <div className="space-y-1">
              <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider px-2">
                Recent Sessions
              </span>
              <div 
                className="p-2 rounded-lg bg-[#26292E] border border-[#34383D] text-xs font-medium text-[#F4F4F5] flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#8B7CFF]" />
                <span className="truncate">Career Strategy & SQL</span>
              </div>
              <div 
                className="p-2 rounded-lg text-xs text-[#71717A] hover:bg-[#17191C] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="truncate">Mock PM Case Interview</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#17191C] border border-[#34383D] text-[11px] text-[#A1A1AA] space-y-1">
            <span className="font-semibold text-white">Advisory Tip:</span>
            <p className="text-[#71717A] leading-relaxed">Ask specific questions about resolving current roadmap bottlenecks.</p>
          </div>
        </div>

        {/* Right Conversation Window */}
        <Card className="flex-1 bg-[#202327] border-[#34383D] flex flex-col overflow-hidden">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border ${
                    msg.role === 'assistant'
                      ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF]/40'
                      : 'bg-[#75D69A]/20 text-[#75D69A] border-[#75D69A]/40'
                  }`}
                >
                  {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      msg.role === 'assistant'
                        ? 'bg-[#17191C] border border-[#34383D] text-[#F4F4F5]'
                        : 'bg-[#8B7CFF] text-white shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[10px] text-[#71717A] block font-mono ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-7 h-7 rounded-lg bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-xl bg-[#17191C] border border-[#34383D] text-xs text-[#71717A] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF] animate-pulse" />
                  <span>Synthesizing roadmap guidance...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3 border-t border-[#34383D] bg-[#17191C] space-y-2.5">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                'How do I close my SQL gap this week?',
                'Review my current roadmap phase',
                'Simulate a PM behavioral interview question',
                'Generate a 30-minute daily task'
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-2.5 py-1 rounded-md text-[11px] bg-[#202327] text-[#A1A1AA] border border-[#34383D] hover:border-[#8B7CFF]/50 hover:text-white whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask PathPilot AI about your roadmap, skill gaps, or interview strategy..."
                className="w-full bg-[#111214] border border-[#34383D] rounded-lg pl-3 pr-10 py-2.5 text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#8B7CFF] transition-colors"
              />
              <Button
                size="xs"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 bg-[#8B7CFF] hover:bg-[#7a6be6] text-white rounded-md h-7 w-7 p-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
