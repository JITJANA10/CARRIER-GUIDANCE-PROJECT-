import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Star, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  X,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  experience: string;
  industry: string;
  skills: string[];
  availability: string;
  slots?: string[];
  rating: number;
  reviews: number;
  price: string;
  initials: string;
  bio: string;
}

const mentorsList: Mentor[] = [
  {
    id: 'm1',
    name: 'Sarah Jenkins',
    role: 'Senior Staff Product Manager (DEMO MENTOR)',
    company: 'FinTech Enterprise (Demonstration Profile)',
    experience: '9+ years',
    industry: 'Financial Technology & SaaS',
    skills: ['Product Strategy', 'PRDs', 'Executive Stakeholder Mgmt'],
    availability: 'Next slot: 2026-11-27T16:00:00Z',
    slots: ['2026-11-27T16:00:00Z'],
    rating: 4.95,
    reviews: 142,
    price: '$120 / session',
    initials: 'SJ',
    bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona specializing in strategy teardowns and portfolio reviews.'
  },
  {
    id: 'm2',
    name: 'David Chen',
    role: 'Lead Data Analytics Architect (DEMO MENTOR)',
    company: 'Global E-Commerce (Demonstration Profile)',
    experience: '7 years',
    industry: 'E-commerce & Cloud Platforms',
    skills: ['SQL Mastery', 'A/B Testing', 'Tableau', 'Data Modeling'],
    availability: 'Next slot: 2026-11-27T14:00:00Z',
    slots: ['2026-11-27T14:00:00Z'],
    rating: 4.88,
    reviews: 98,
    price: '$95 / session',
    initials: 'DC',
    bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona specializing in practical SQL and data storytelling that influences roadmaps.'
  },
  {
    id: 'm3',
    name: 'Elena Rostova',
    role: 'Head of Product Design (DEMO MENTOR)',
    company: 'Design Systems Lab (Demonstration Profile)',
    experience: '8+ years',
    industry: 'Enterprise Software & Mobile',
    skills: ['Figma', 'Design Systems', 'User Research', 'Design Strategy'],
    availability: 'Next slot: 2026-11-28T11:00:00Z',
    slots: ['2026-11-28T11:00:00Z'],
    rating: 4.92,
    reviews: 115,
    price: '$110 / session',
    initials: 'ER',
    bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona bridging design execution and product engineering.'
  },
  {
    id: 'm4',
    name: 'Marcus Vance',
    role: 'VP of Engineering & Talent Advisor (DEMO MENTOR)',
    company: 'AI Infrastructure Lab (Demonstration Profile)',
    experience: '12+ years',
    industry: 'Artificial Intelligence & Infra',
    skills: ['System Design', 'Technical Leadership', 'Career Ladders'],
    availability: 'Next slot: 2026-11-28T18:00:00Z',
    slots: ['2026-11-28T18:00:00Z'],
    rating: 4.98,
    reviews: 210,
    price: '$150 / session',
    initials: 'MV',
    bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona focused on system architecture and engineering career ladders.'
  }
];

interface StudentBookingRecord {
  id: string;
  mentorId: string;
  scheduledTime: string;
  topic: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
}

export function Mentors() {
  const { profile } = useAppContext();
  const { user, token, openLoginModal, logout } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>(mentorsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentBookings, setStudentBookings] = useState<StudentBookingRecord[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [focusArea, setFocusArea] = useState('PRD & Strategic Portfolio Review');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadMentorsAndBookings = async () => {
    try {
      const mRes = await fetch('http://localhost:3001/api/v1/mentors');
      const mJson = await mRes.json();
      if (mJson.success && Array.isArray(mJson.data) && mJson.data.length > 0) {
        const mapped: Mentor[] = mJson.data.map((m: any) => {
          const parts = String(m.name || 'DM').trim().split(' ');
          const initials = parts.map((p: string) => p.charAt(0).toUpperCase()).slice(0, 2).join('');
          const slots: string[] = Array.isArray(m.slots) ? m.slots : [];
          return {
            id: m.id,
            name: m.name,
            role: m.role,
            company: m.company,
            experience: m.experience,
            industry: m.industry,
            skills: Array.isArray(m.skills) ? m.skills : [],
            slots,
            availability: slots[0] ? `Next slot: ${new Date(slots[0]).toUTCString()}` : 'No open slots',
            rating: m.rating,
            reviews: m.reviews,
            price: m.price,
            initials,
            bio: m.bio
          };
        });
        setMentors(mapped);
      }
    } catch {
      // Keep static demonstration fallback if backend is unavailable
    }

    if (token && user?.role === 'STUDENT') {
      try {
        const bRes = await fetch('http://localhost:3001/api/v1/mentors/bookings/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bRes.status === 401) {
          logout();
          return;
        }
        const bJson = await bRes.json();
        if (bRes.ok && bJson.success && Array.isArray(bJson.data)) {
          setStudentBookings(bJson.data);
        }
      } catch {
        // Ignore silent fetch failures
      }
    } else {
      setStudentBookings([]);
    }
  };

  useEffect(() => {
    loadMentorsAndBookings();
  }, [token, user]);

  const handleBook = (mentor: Mentor) => {
    setBookingError(null);
    setSelectedMentor(mentor);
    setSelectedSlot(mentor.slots?.[0] || '');
    setNotes(`Hi ${mentor.name}, I'm working toward my goal as a ${profile.goal || 'Product Manager'} and would love your feedback on my current skill gaps.`);
  };

  const confirmBooking = async () => {
    if (!selectedMentor) return;

    if (!token || user?.role !== 'STUDENT') {
      setBookingError('Please sign in with a student account to book a live session.');
      return;
    }

    const slotToBook = selectedSlot || selectedMentor.slots?.[0];
    if (!slotToBook) {
      setBookingError('No open availability slots remaining for this mentor.');
      return;
    }

    setBookingError(null);
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/mentors/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          scheduledTime: slotToBook,
          topic: focusArea,
          notes
        })
      });
      if (res.status === 401) {
        logout();
        setBookingError('Session expired. Please sign in again.');
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBookingError(json?.error?.message || 'Unable to confirm booking request.');
        return;
      }

      setSelectedMentor(null);
      await loadMentorsAndBookings();
    } catch {
      setBookingError('Network error while connecting to booking service.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMentorBookingBadge = (mentorId: string): { variant: BadgeVariant; label: string; isActive: boolean } | null => {
    const matches = studentBookings.filter((b) => b.mentorId === mentorId);
    if (matches.length === 0) return null;

    const confirmed = matches.find((b) => b.status === 'CONFIRMED');
    if (confirmed) return { variant: 'done', label: 'Session Confirmed', isActive: true };

    const requested = matches.find((b) => b.status === 'REQUESTED');
    if (requested) return { variant: 'progress', label: 'Consultation Requested', isActive: true };

    const completed = matches.find((b) => b.status === 'COMPLETED');
    if (completed) return { variant: 'medium', label: 'Session Completed', isActive: false };

    const rejected = matches.find((b) => b.status === 'REJECTED');
    if (rejected) return { variant: 'critical', label: 'Last Request Rejected', isActive: false };

    return null;
  };

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F4F4F5] tracking-tight">
            Mentorship Hub
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Book 1-on-1 strategic portfolio reviews and mock interviews with demonstration mentor profiles.
          </p>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#71717A] bg-[#202327] px-3 py-1.5 rounded-lg border border-[#34383D]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#75D69A]" />
          <span>DEMO MENTOR — Curated Demonstration Profiles</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
        <input 
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter by mentor name, skill (SQL, PRDs), or role..."
          className="w-full bg-[#202327] border border-[#34383D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#8B7CFF] transition-colors"
        />
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMentors.map(mentor => {
          const bookingStatus = getMentorBookingBadge(mentor.id);

          return (
            <Card key={mentor.id} className="p-4 bg-[#202327] border-[#34383D] flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center font-bold text-xs text-[#8B7CFF]">
                      {mentor.initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-1.5">
                        {mentor.name}
                        <ShieldCheck className="w-3.5 h-3.5 text-[#75D69A]" />
                      </h3>
                      <p className="text-xs text-[#A1A1AA]">{mentor.role} • <span className="text-[#71717A]">{mentor.company}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-white">{mentor.rating}</span>
                    <span className="text-[#71717A]">({mentor.reviews})</span>
                  </div>
                </div>

                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {mentor.bio}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {mentor.skills.map(skill => (
                    <Badge key={skill} variant="skill" className="text-[10px] py-0">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Logistics */}
                <div className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg bg-[#17191C] border border-[#34383D]">
                  <span className="text-[#71717A] flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" /> {mentor.availability}
                  </span>
                  <span className="font-mono font-bold text-[#75D69A]">
                    {mentor.price}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-[#34383D] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#71717A]">
                    {mentor.experience} experience
                  </span>
                  {bookingStatus && !bookingStatus.isActive && (
                    <Badge variant={bookingStatus.variant} dot className="py-0.5 px-2 text-[10px]">
                      {bookingStatus.label}
                    </Badge>
                  )}
                </div>

                {bookingStatus && bookingStatus.isActive ? (
                  <Badge variant={bookingStatus.variant} dot className="py-1 px-2.5">
                    {bookingStatus.label}
                  </Badge>
                ) : (
                  <Button 
                    size="xs" 
                    onClick={() => handleBook(mentor)}
                    className="gap-1.5 border-[#34383D]"
                  >
                    <Calendar className="w-3 h-3" /> Request Session
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Session Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17191C] border border-[#34383D] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#34383D] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8B7CFF]" />
                <h3 className="text-sm font-bold text-[#F4F4F5]">Schedule Consultation</h3>
              </div>
              <button onClick={() => setSelectedMentor(null)} className="text-[#71717A] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {bookingError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    {bookingError}
                  </span>
                  {!token && (
                    <Button
                      size="xs"
                      onClick={() => {
                        setSelectedMentor(null);
                        openLoginModal();
                      }}
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              )}

              <div className="p-3 rounded-lg bg-[#202327] border border-[#34383D] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#F4F4F5]">{selectedMentor.name}</h4>
                  <p className="text-[#71717A] text-[11px]">{selectedMentor.role}</p>
                </div>
                <span className="font-mono text-[#75D69A] font-bold">{selectedMentor.price}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#71717A] uppercase font-bold">Available Time Slot (UTC)</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full bg-[#202327] border border-[#34383D] rounded-lg p-2 text-xs text-[#F4F4F5] font-mono focus:outline-none focus:border-[#8B7CFF]"
                >
                  {(selectedMentor.slots || []).length === 0 ? (
                    <option value="">No open slots currently available</option>
                  ) : (
                    selectedMentor.slots!.map((slot) => (
                      <option key={slot} value={slot}>
                        {new Date(slot).toUTCString()}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#71717A] uppercase font-bold">Focus Area</label>
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="w-full bg-[#202327] border border-[#34383D] rounded-lg p-2 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#8B7CFF]"
                >
                  <option>PRD & Strategic Portfolio Review</option>
                  <option>SQL Technical Teardown</option>
                  <option>Mock Behavioral / Product Sense Interview</option>
                  <option>General Career Trajectory & Roadmap Advice</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#71717A] uppercase font-bold">Message for Mentor</label>
                <textarea 
                  rows={2} 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#202327] border border-[#34383D] rounded-lg p-2 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#8B7CFF] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#34383D]">
              <Button size="xs" variant="outline" onClick={() => setSelectedMentor(null)}>
                Cancel
              </Button>
              <Button size="xs" disabled={submitting} onClick={confirmBooking} className="gap-1">
                {submitting ? 'Submitting...' : 'Confirm Request'} <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
