// PATHPILOT — DEDICATED MENTOR DASHBOARD
// Directive: PP-MENTOR-DASHBOARD-2026-01
// Standard: Dark obsidian UI matching PathPilot design tokens; strictly live backend data

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Globe,
  DollarSign,
  Sparkles,
  Check,
  X,
  Inbox,
  ShieldAlert
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:3001/api/v1';

interface StudentProfileSummary {
  firstName: string;
  lastName: string;
  targetGoal?: string | null;
  educationLevel?: string | null;
}

interface BookingItem {
  id: string;
  studentId: string;
  mentorId: string;
  scheduledTime: string;
  topic: string;
  notes?: string | null;
  status: 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    email: string;
    profile?: StudentProfileSummary | null;
  };
}

interface LiveMentorProfile {
  id: string;
  userId?: string | null;
  name: string;
  role: string;
  company: string;
  experience: string;
  industry: string;
  skills: string[];
  price: string;
  rating: number;
  reviews: number;
  bio: string;
  slots: string[];
  allSlots: string[];
}

type StatusFilter = 'ALL' | 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'ARCHIVED';

function formatBookingTime(isoString: string, localTz: string): { utcLabel: string; localLabel: string } {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return { utcLabel: isoString, localLabel: isoString };
  }

  const utcLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false
  }).format(date) + ' UTC';

  const localLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);

  return { utcLabel, localLabel: `${localLabel} (${localTz})` };
}

function getStatusBadge(status: BookingItem['status']): { variant: BadgeVariant; label: string } {
  switch (status) {
    case 'REQUESTED':
      return { variant: 'progress', label: 'Pending' };
    case 'CONFIRMED':
      return { variant: 'done', label: 'Confirmed' };
    case 'COMPLETED':
      return { variant: 'medium', label: 'Completed' };
    case 'REJECTED':
      return { variant: 'critical', label: 'Rejected' };
    case 'CANCELLED':
      return { variant: 'default', label: 'Cancelled' };
    default:
      return { variant: 'default', label: status };
  }
}

export function MentorDashboard() {
  const { user, token, isLoading: authLoading, openLoginModal, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [mentorProfile, setMentorProfile] = useState<LiveMentorProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [detailBooking, setDetailBooking] = useState<BookingItem | null>(null);

  const localTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    } catch {
      return 'Local';
    }
  }, []);

  const loadMentorWorkspace = useCallback(
    async (silent = false) => {
      if (!token || user?.role !== 'MENTOR') {
        setLoadingData(false);
        return;
      }

      if (silent) setRefreshing(true);
      else setLoadingData(true);
      setErrorMsg(null);

      try {
        const [bookingsRes, mentorsRes] = await Promise.all([
          fetch(`${API_BASE}/mentors/bookings/my`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/mentors`)
        ]);

        if (bookingsRes.status === 401) {
          logout();
          return;
        }

        const bookingsJson = await bookingsRes.json();
        const mentorsJson = await mentorsRes.json();

        if (!bookingsRes.ok || !bookingsJson.success) {
          throw new Error(bookingsJson?.error?.message || 'Failed to load incoming booking requests.');
        }

        setBookings(Array.isArray(bookingsJson.data) ? bookingsJson.data : []);

        if (mentorsRes.ok && mentorsJson.success && Array.isArray(mentorsJson.data)) {
          const ownProfile = mentorsJson.data.find(
            (m: LiveMentorProfile) => m.userId === user.id || m.id === user.mentorProfile?.id
          );
          if (ownProfile) {
            setMentorProfile(ownProfile);
          }
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Unable to synchronize mentor data with backend.');
      } finally {
        setLoadingData(false);
        setRefreshing(false);
      }
    },
    [token, user, logout]
  );

  useEffect(() => {
    if (!authLoading && user?.role === 'MENTOR') {
      loadMentorWorkspace(false);
    } else if (!authLoading) {
      setLoadingData(false);
    }
  }, [authLoading, user, loadMentorWorkspace]);

  const handleStatusTransition = async (
    bookingId: string,
    newStatus: 'CONFIRMED' | 'REJECTED' | 'COMPLETED'
  ) => {
    if (!token) return;
    setUpdatingId(bookingId);
    setErrorMsg(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/mentors/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || `Failed to update booking to ${newStatus}.`);
      }

      const updated: BookingItem = json.data;
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)));
      if (detailBooking?.id === bookingId) {
        setDetailBooking((prev) => (prev ? { ...prev, ...updated } : null));
      }

      setActionSuccess(
        newStatus === 'CONFIRMED'
          ? 'Session confirmed. Student schedule and slot availability updated.'
          : newStatus === 'REJECTED'
            ? 'Booking request rejected. The time slot has been released back to open availability.'
            : 'Session marked as completed.'
      );

      // Refresh live mentor slot list
      loadMentorWorkspace(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Booking action denied by backend validation.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics & Derived Views
  const metrics = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'REQUESTED').length;
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    return { total, pending, confirmed, completed };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    switch (activeFilter) {
      case 'REQUESTED':
        return bookings.filter((b) => b.status === 'REQUESTED');
      case 'CONFIRMED':
        return bookings.filter((b) => b.status === 'CONFIRMED');
      case 'COMPLETED':
        return bookings.filter((b) => b.status === 'COMPLETED');
      case 'ARCHIVED':
        return bookings.filter((b) => b.status === 'REJECTED' || b.status === 'CANCELLED');
      default:
        return bookings;
    }
  }, [bookings, activeFilter]);

  const upcomingSessions = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'CONFIRMED')
      .slice()
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  }, [bookings]);

  // Loading state
  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[450px] w-full" role="status" aria-label="Loading mentor workspace">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#34383D] border-t-[#8B7CFF] animate-spin" />
          <span className="text-xs text-[#71717A] font-medium tracking-wide">Loading Mentor Dashboard...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated gate
  if (!user || !token) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <Card className="max-w-md w-full p-6 bg-[#202327] border-[#34383D] text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF] mx-auto">
            <Users className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#F4F4F5]">Mentor Authentication Required</h2>
            <p className="text-xs text-[#A1A1AA]">
              Sign in with your PathPilot mentor credentials to access incoming session requests and availability.
            </p>
          </div>
          <Button size="sm" onClick={openLoginModal} className="w-full">
            Sign In to Continue
          </Button>
        </Card>
      </div>
    );
  }

  // Synchronous Student redirect guard (zero mentor UI flash)
  if (user.role === 'STUDENT') {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin notice & access guard if an admin navigates manually to /mentor
  if (user.role !== 'MENTOR') {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <Card className="max-w-lg w-full p-6 bg-[#202327] border-[#34383D] space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-[#F4F4F5]">
              <ShieldAlert className="w-4 h-4 text-[#8B7CFF]" />
              Administrative Access Notice
            </span>
            <Badge variant="medium" dot>{user.role}</Badge>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            You are authenticated as <span className="text-[#F4F4F5] font-mono">{user.email}</span>.
            The dedicated Admin Governance portal is not included in this milestone; `/mentor` is restricted exclusively to mentor accounts.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#34383D]">
            <Button size="xs" variant="outline" onClick={() => navigate('/')}>
              Return Home
            </Button>
            <Button size="xs" onClick={() => { logout(); navigate('/login'); }}>
              Switch Account
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getStudentName = (b: BookingItem) => {
    const first = b.student?.profile?.firstName;
    const last = b.student?.profile?.lastName;
    if (first || last) return `${first || ''} ${last || ''}`.trim();
    return b.student?.email || 'Student Account';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-[#F4F4F5] tracking-tight">
              Mentor Dashboard
            </h1>
            <Badge variant="expert" dot>DEMO MENTOR</Badge>
          </div>
          <p className="text-xs text-[#71717A] mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>Manage incoming student booking requests and upcoming mentorship sessions</span>
            <span className="text-[#34383D]">•</span>
            <span className="inline-flex items-center gap-1 text-[#A1A1AA]">
              <Globe className="w-3 h-3 text-[#42C5E8]" /> Timezone: UTC / {localTz}
            </span>
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => loadMentorWorkspace(true)}
          disabled={refreshing}
          className="gap-1.5 border-[#34383D] self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Syncing...' : 'Refresh Bookings'}
        </Button>
      </div>

      {/* Feedback Banners */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-[#75D69A]/10 border border-[#75D69A]/30 text-xs text-[#75D69A] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="hover:text-white p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION A: OVERVIEW KPI CARDS                                  */}
      {/* ============================================================== */}
      <section id="overview" aria-label="Mentor Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#71717A]">Total Requests</span>
              <Inbox className="w-4 h-4 text-[#42C5E8]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#F4F4F5]">{metrics.total}</span>
              <span className="text-[11px] text-[#A1A1AA]">All-time assigned</span>
            </div>
          </Card>

          <Card className="p-4 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#71717A]">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-300">{metrics.pending}</span>
              <span className="text-[11px] text-[#A1A1AA]">Awaiting response</span>
            </div>
          </Card>

          <Card className="p-4 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#71717A]">Confirmed Sessions</span>
              <Calendar className="w-4 h-4 text-[#75D69A]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#75D69A]">{metrics.confirmed}</span>
              <span className="text-[11px] text-[#A1A1AA]">Scheduled upcoming</span>
            </div>
          </Card>

          <Card className="p-4 bg-[#202327] border-[#34383D]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#71717A]">Completed Sessions</span>
              <CheckCircle2 className="w-4 h-4 text-[#8B7CFF]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#8B7CFF]">{metrics.completed}</span>
              <span className="text-[11px] text-[#A1A1AA]">Delivered sessions</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN (lg:col-span-8): REQUESTS & UPCOMING SESSIONS     */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-5">
          {/* SECTION B & C: INCOMING BOOKING REQUESTS & ACTIONS */}
          <Card id="requests" className="bg-[#202327] border-[#34383D]">
            <CardHeader className="pb-3 border-b border-[#34383D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
                  Incoming Booking Requests
                  <Badge variant="default" className="font-mono text-[10px]">{filteredBookings.length}</Badge>
                </CardTitle>
                <CardDescription className="text-[11px] text-[#71717A] mt-0.5">
                  Confirm or reject student consultations routed strictly to your mentor profile
                </CardDescription>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#17191C] p-1 rounded-lg border border-[#34383D] flex-wrap">
                {([
                  { key: 'ALL', label: 'All' },
                  { key: 'REQUESTED', label: `Pending (${metrics.pending})` },
                  { key: 'CONFIRMED', label: 'Confirmed' },
                  { key: 'COMPLETED', label: 'Completed' },
                  { key: 'ARCHIVED', label: 'Rejected/Cancelled' }
                ] as { key: StatusFilter; label: string }[]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      activeFilter === tab.key
                        ? 'bg-[#26292E] text-[#F4F4F5] border border-[#34383D]'
                        : 'text-[#71717A] hover:text-[#A1A1AA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="py-10 text-center space-y-2 border border-dashed border-[#34383D] rounded-xl bg-[#17191C]/50">
                  <Inbox className="w-6 h-6 text-[#71717A] mx-auto" />
                  <p className="text-xs font-medium text-[#A1A1AA]">No booking requests in this view</p>
                  <p className="text-[11px] text-[#71717A]">
                    New student requests matching your open time slots will appear here automatically.
                  </p>
                </div>
              ) : (
                filteredBookings.map((booking) => {
                  const statusMeta = getStatusBadge(booking.status);
                  const { utcLabel, localLabel } = formatBookingTime(booking.scheduledTime, localTz);
                  const studentName = getStudentName(booking);
                  const careerGoal = booking.student?.profile?.targetGoal || 'Career goal not specified';
                  const isBusy = updatingId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      className="p-3.5 rounded-xl bg-[#17191C] border border-[#34383D] hover:border-[#4e535a] transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#F4F4F5]">{studentName}</span>
                            <Badge variant={statusMeta.variant} dot>
                              {statusMeta.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[#8B7CFF]">
                              <Briefcase className="w-3 h-3" /> Goal: {careerGoal}
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 space-y-0.5">
                          <div className="text-xs font-mono font-semibold text-[#F4F4F5] flex items-center sm:justify-end gap-1">
                            <Clock className="w-3 h-3 text-[#42C5E8]" /> {utcLabel}
                          </div>
                          <div className="text-[10px] text-[#71717A] font-mono">
                            {localLabel}
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#202327] border border-[#34383D]/70 text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider block mb-0.5">
                          Session Topic
                        </span>
                        <p className="text-[#F4F4F5] font-medium">{booking.topic}</p>
                      </div>

                      {/* Actions Row */}
                      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setDetailBooking(booking)}
                          className="gap-1.5 border-[#34383D]"
                        >
                          <Eye className="w-3 h-3" /> View Details
                        </Button>

                        <div className="flex items-center gap-2">
                          {booking.status === 'REQUESTED' && (
                            <>
                              <Button
                                size="xs"
                                variant="destructive"
                                disabled={isBusy}
                                onClick={() => handleStatusTransition(booking.id, 'REJECTED')}
                                className="gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                {isBusy ? 'Updating...' : 'Reject'}
                              </Button>
                              <Button
                                size="xs"
                                variant="success"
                                disabled={isBusy}
                                onClick={() => handleStatusTransition(booking.id, 'CONFIRMED')}
                                className="gap-1"
                              >
                                <Check className="w-3 h-3" />
                                {isBusy ? 'Updating...' : 'Confirm'}
                              </Button>
                            </>
                          )}

                          {booking.status === 'CONFIRMED' && (
                            <Button
                              size="xs"
                              variant="secondary"
                              disabled={isBusy}
                              onClick={() => handleStatusTransition(booking.id, 'COMPLETED')}
                              className="gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-[#75D69A]" />
                              {isBusy ? 'Updating...' : 'Mark Completed'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* SECTION D: UPCOMING CONFIRMED SESSIONS */}
          <Card id="upcoming" className="bg-[#202327] border-[#34383D]">
            <CardHeader className="pb-3 border-b border-[#34383D]">
              <CardTitle className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#75D69A]" />
                Upcoming Confirmed Sessions
              </CardTitle>
              <CardDescription className="text-[11px] text-[#71717A]">
                Chronological schedule showing confirmed student details and explicit UTC & local timezones
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {upcomingSessions.length === 0 ? (
                <div className="py-8 text-center space-y-1.5 border border-dashed border-[#34383D] rounded-xl bg-[#17191C]/50">
                  <Calendar className="w-5 h-5 text-[#71717A] mx-auto" />
                  <p className="text-xs font-medium text-[#A1A1AA]">No confirmed upcoming sessions</p>
                  <p className="text-[11px] text-[#71717A]">
                    Confirm a pending request above to add it to your active schedule.
                  </p>
                </div>
              ) : (
                upcomingSessions.map((session) => {
                  const { utcLabel, localLabel } = formatBookingTime(session.scheduledTime, localTz);
                  return (
                    <div
                      key={session.id}
                      className="p-3.5 rounded-xl bg-[#17191C] border border-[#34383D] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#F4F4F5]">{getStudentName(session)}</span>
                          <span className="text-[11px] text-[#71717A] font-mono truncate">
                            ({session.student?.email})
                          </span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] truncate">{session.topic}</p>
                        <p className="text-[11px] text-[#8B7CFF]">
                          Target Goal: {session.student?.profile?.targetGoal || 'Career Goal'}
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0 bg-[#202327] px-3 py-2 rounded-lg border border-[#34383D] space-y-0.5">
                        <div className="text-xs font-mono font-bold text-[#75D69A]">{utcLabel}</div>
                        <div className="text-[10px] font-mono text-[#A1A1AA]">{localLabel}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN (lg:col-span-4): SECTION E — MENTOR PROFILE       */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-5">
          <Card id="profile" className="p-4 bg-[#202327] border-[#34383D] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#8B7CFF]/20 border border-[#8B7CFF]/40 flex items-center justify-center font-bold text-sm text-[#8B7CFF] shrink-0">
                  {(mentorProfile?.name || user.name || 'M')
                    .split(' ')
                    .map((p) => p.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#F4F4F5] truncate flex items-center gap-1.5">
                    {mentorProfile?.name || user.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-[#75D69A] shrink-0" />
                  </h2>
                  <p className="text-[11px] text-[#A1A1AA] truncate">
                    {mentorProfile?.role || 'Mentor (DEMO MENTOR)'}
                  </p>
                  <p className="text-[10px] text-[#71717A] truncate">
                    {mentorProfile?.company || user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Session Rate & Experience */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#17191C] border border-[#34383D]">
                <span className="text-[10px] uppercase font-bold text-[#71717A] flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-[#75D69A]" /> Session Rate
                </span>
                <p className="text-xs font-mono font-bold text-[#75D69A] mt-1">
                  {mentorProfile?.price || '$120 / session'}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#17191C] border border-[#34383D]">
                <span className="text-[10px] uppercase font-bold text-[#71717A] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#8B7CFF]" /> Experience
                </span>
                <p className="text-xs font-semibold text-[#F4F4F5] mt-1">
                  {mentorProfile?.experience || '9+ years'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-1 border-t border-[#34383D]">
              <span className="text-[11px] uppercase font-bold text-[#71717A] tracking-wider">
                Description
              </span>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {mentorProfile?.bio || 'DEMONSTRATION PROFILE'}
              </p>
            </div>

            {/* Expertise */}
            <div className="space-y-2 pt-1 border-t border-[#34383D]">
              <span className="text-[11px] uppercase font-bold text-[#71717A] tracking-wider">
                Expertise
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(mentorProfile?.skills || []).map((skill) => (
                  <Badge key={skill} variant="skill" className="text-[10px]">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Availability Slots */}
            <div className="space-y-2 pt-1 border-t border-[#34383D]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-[#71717A] tracking-wider">
                  Published Availability (UTC)
                </span>
                <span className="text-[10px] font-mono text-[#75D69A]">
                  {mentorProfile?.slots?.length ?? 0} Open
                </span>
              </div>

              <div className="space-y-1.5">
                {(mentorProfile?.allSlots || []).length === 0 ? (
                  <p className="text-xs text-[#71717A]">No published availability slots found.</p>
                ) : (
                  mentorProfile!.allSlots.map((slot) => {
                    const isOpen = mentorProfile!.slots.includes(slot);
                    const { utcLabel } = formatBookingTime(slot, localTz);
                    return (
                      <div
                        key={slot}
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#17191C] border border-[#34383D] text-[11px]"
                      >
                        <span className="font-mono text-[#F4F4F5]">{utcLabel}</span>
                        <Badge variant={isOpen ? 'done' : 'progress'} dot className="text-[10px] py-0">
                          {isOpen ? 'Available' : 'Reserved'}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW BOOKING DETAILS MODAL                                     */}
      {/* ============================================================== */}
      {detailBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Booking Details"
        >
          <div className="bg-[#17191C] border border-[#34383D] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#34383D] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8B7CFF]" />
                <h3 className="text-sm font-bold text-[#F4F4F5]">Consultation Request Details</h3>
              </div>
              <button
                onClick={() => setDetailBooking(null)}
                aria-label="Close details dialog"
                className="text-[#71717A] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#202327] border border-[#34383D] flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-[#F4F4F5]">{getStudentName(detailBooking)}</h4>
                  <p className="text-[#71717A] text-[11px] font-mono">{detailBooking.student?.email}</p>
                </div>
                <Badge variant={getStatusBadge(detailBooking.status).variant} dot>
                  {getStatusBadge(detailBooking.status).label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-[#202327] border border-[#34383D]">
                  <span className="text-[10px] uppercase font-bold text-[#71717A] block">Student Career Goal</span>
                  <span className="text-[#F4F4F5] font-medium mt-0.5 block">
                    {detailBooking.student?.profile?.targetGoal || 'Not specified'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#202327] border border-[#34383D]">
                  <span className="text-[10px] uppercase font-bold text-[#71717A] block">Experience Level</span>
                  <span className="text-[#F4F4F5] font-medium mt-0.5 block">
                    {detailBooking.student?.profile?.educationLevel || 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#202327] border border-[#34383D] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">Appointment Time</span>
                <p className="text-[#75D69A] font-mono font-semibold">
                  {formatBookingTime(detailBooking.scheduledTime, localTz).utcLabel}
                </p>
                <p className="text-[#A1A1AA] font-mono text-[11px]">
                  Local: {formatBookingTime(detailBooking.scheduledTime, localTz).localLabel}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#202327] border border-[#34383D] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">Session Topic</span>
                <p className="text-[#F4F4F5] font-medium">{detailBooking.topic}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#202327] border border-[#34383D] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">Student Notes</span>
                <p className="text-[#A1A1AA] leading-relaxed">
                  {detailBooking.notes || 'No additional notes provided by student.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#34383D]">
              <Button size="xs" variant="outline" onClick={() => setDetailBooking(null)}>
                Close
              </Button>

              {detailBooking.status === 'REQUESTED' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="destructive"
                    disabled={updatingId === detailBooking.id}
                    onClick={() => handleStatusTransition(detailBooking.id, 'REJECTED')}
                    className="gap-1"
                  >
                    <XCircle className="w-3 h-3" /> Reject Request
                  </Button>
                  <Button
                    size="xs"
                    variant="success"
                    disabled={updatingId === detailBooking.id}
                    onClick={() => handleStatusTransition(detailBooking.id, 'CONFIRMED')}
                    className="gap-1"
                  >
                    <Check className="w-3 h-3" /> Confirm Session
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
