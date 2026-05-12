// src/pages/dashboards/EducationDashboard.tsx
// ============================================================
// VeloxSync — Teacher Command Center
// Wired to real API endpoints
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import {
  Brain, AlertTriangle, CheckCircle, Clock,
  Calendar, Users, TrendingUp,
  ChevronRight, BookOpen, UserCheck, Zap, RefreshCw
} from 'lucide-react';
import {
  getLoadStatus,
  LOAD_STATUS_CONFIG,
  getDailyLoadStatus,
  HEATMAP_COLORS,
  type LoadStatus,
} from '../../components/educationGuard';

// ── TYPES ───────────────────────────────────────────────────

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  cognitive_load_score: number;
  has_special_needs: boolean;
  disconnect_risk: number;
  missed_deadlines: number;
  active_assignments: number;
  grade_level: string;
  load_status: LoadStatus;
  updated_at: string;
}

interface DayLoad {
  due_date: string;
  total_weight: number;
  assignment_count: number;
  load_status: LoadStatus;
  assignments: { title: string; weight: number; subject: string }[];
}

interface Intervention {
  id: string;
  student_id: string;
  student_name: string;
  type: string;
  status: string;
  ai_reasoning: string;
  has_special_needs: boolean;
  cognitive_load_score: number;
}

// ── API HELPERS ─────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || '';

async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── HELPERS ─────────────────────────────────────────────────

const formatName = (s: Student) => `${s.first_name} ${s.last_name}`;
const getInitials = (s: Student) => `${s.first_name[0]}${s.last_name[0]}`;
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getSummaryStats = (students: Student[]) => ({
  total:    students.length,
  sync:     students.filter(s => getLoadStatus(s.cognitive_load_score) === 'sync').length,
  friction: students.filter(s => getLoadStatus(s.cognitive_load_score) === 'friction').length,
  overload: students.filter(s => getLoadStatus(s.cognitive_load_score) === 'overload').length,
  iep:      students.filter(s => s.has_special_needs).length,
});

// ── SUB-COMPONENTS ──────────────────────────────────────────

function StatusDot({ status }: { status: LoadStatus }) {
  const cfg = LOAD_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function IEPBadge() {
  return (
    <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-violet-400 border border-violet-500/30">
      IEP
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-slate-400">
        <RefreshCw size={18} className="animate-spin" />
        <span className="text-sm font-bold">Loading roster...</span>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertTriangle size={32} className="text-red-400" />
      <p className="text-sm text-slate-400">{message}</p>
      <button onClick={onRetry} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white">
        Try Again
      </button>
    </div>
  );
}

// ── ROSTER HEALTH MATRIX ────────────────────────────────────

function RosterHealthMatrix({ students, loading, error, onRetry, onSelectStudent }: {
  students: Student[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectStudent: (s: Student) => void;
}) {
  const [filter, setFilter] = useState<'all' | LoadStatus>('all');
  const [sortBy, setSortBy] = useState<'load' | 'name' | 'risk'>('load');

  const filtered = useMemo(() => {
    let list = [...students];
    if (filter !== 'all') list = list.filter(s => getLoadStatus(s.cognitive_load_score) === filter);
    if (sortBy === 'load') list.sort((a, b) => b.cognitive_load_score - a.cognitive_load_score);
    if (sortBy === 'name') list.sort((a, b) => a.first_name.localeCompare(b.first_name));
    if (sortBy === 'risk') list.sort((a, b) => b.disconnect_risk - a.disconnect_risk);
    return list;
  }, [students, filter, sortBy]);

  return (
    <div className="rounded-2xl border border-white/8 bg-slate-900/60">
      <div className="flex flex-col gap-3 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20">
            <Users size={18} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Roster Health Matrix</h2>
            <p className="text-xs text-slate-500">{filtered.length} of {students.length} students</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'sync', 'friction', 'overload'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                filter === f ? 'bg-indigo-600 text-white' : 'border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : LOAD_STATUS_CONFIG[f].label}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300"
          >
            <option value="load">Sort: Load</option>
            <option value="name">Sort: Name</option>
            <option value="risk">Sort: Disconnect Risk</option>
          </select>
        </div>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={onRetry} />}
      {!loading && !error && (
        <div className="divide-y divide-white/5">
          {filtered.map(student => {
            const status = getLoadStatus(student.cognitive_load_score);
            const cfg = LOAD_STATUS_CONFIG[status];
            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-white/3"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${cfg.bg} ${cfg.color}`}>
                  {getInitials(student)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{formatName(student)}</span>
                    {student.has_special_needs && <IEPBadge />}
                  </div>
                  <p className="text-xs text-slate-500">
                    {student.active_assignments} active · Grade {student.grade_level}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-lg font-black text-white">{student.cognitive_load_score}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Load</div>
                </div>
                {Number(student.missed_deadlines) > 0 && (
                  <div className="hidden items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1 sm:flex">
                    <AlertTriangle size={12} className="text-red-400" />
                    <span className="text-xs font-bold text-red-400">{student.missed_deadlines} missed</span>
                  </div>
                )}
                <StatusDot status={status} />
                <ChevronRight size={14} className="shrink-0 text-slate-600" />
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">No students match this filter.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── BANDWIDTH HEATMAP ───────────────────────────────────────

function BandwidthHeatmap({ days, loading, error, onRetry }: {
  days: DayLoad[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [hoveredDay, setHoveredDay] = useState<DayLoad | null>(null);

  return (
    <div className="rounded-2xl border border-white/8 bg-slate-900/60">
      <div className="flex items-center gap-3 border-b border-white/5 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20">
          <Calendar size={18} className="text-teal-400" />
        </div>
        <div>
          <h2 className="text-base font-black text-white">Bandwidth Heatmap</h2>
          <p className="text-xs text-slate-500">Cross-teacher cognitive load · Next 14 days</p>
        </div>
      </div>

      <div className="p-5">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={onRetry} />}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-7 gap-2">
              {days.slice(0, 7).map(day => {
                const status = getDailyLoadStatus(Number(day.total_weight));
                const isHovered = hoveredDay?.due_date === day.due_date;
                return (
                  <div
                    key={day.due_date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`relative cursor-pointer rounded-xl border p-3 text-center transition-all ${HEATMAP_COLORS[status]} ${isHovered ? 'scale-105' : ''}`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-70">
                      {new Date(day.due_date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="mt-1 text-xl font-black">{day.total_weight}</div>
                    <div className="text-[9px] opacity-60">pts</div>
                  </div>
                );
              })}
            </div>

            {hoveredDay && (
              <div className="mt-4 rounded-xl border border-white/10 bg-slate-800 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-black text-white">
                    {formatDate(hoveredDay.due_date)} — Total Load: {hoveredDay.total_weight}
                  </span>
                  <StatusDot status={getDailyLoadStatus(Number(hoveredDay.total_weight))} />
                </div>
                <div className="flex flex-col gap-2">
                  {(hoveredDay.assignments || []).map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <BookOpen size={11} className="text-slate-500" />
                        {a.title}
                        <span className="text-slate-600">· {a.subject}</span>
                      </div>
                      <span className="font-bold text-slate-400">Weight {a.weight}</span>
                    </div>
                  ))}
                </div>
                {getDailyLoadStatus(Number(hoveredDay.total_weight)) === 'overload' && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 border border-red-500/20">
                    <AlertTriangle size={12} />
                    High load day — consider rescheduling assignments
                  </div>
                )}
              </div>
            )}

            {days.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                No assignments scheduled in the next 14 days.
              </div>
            )}

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              {(['sync', 'friction', 'overload'] as LoadStatus[]).map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-sm ${LOAD_STATUS_CONFIG[s].dot}`} />
                  {LOAD_STATUS_CONFIG[s].label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── INTERVENTION FEED ───────────────────────────────────────

function InterventionFeedPanel({ interventions, loading, onAction }: {
  interventions: Intervention[];
  loading: boolean;
  onAction: (id: string, status: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-900/60 h-full">
      <div className="flex items-center gap-3 border-b border-white/5 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20">
          <Brain size={18} className="text-violet-400" />
        </div>
        <div>
          <h2 className="text-base font-black text-white">Ei-Core Feed</h2>
          <p className="text-xs text-slate-500">AI-recommended interventions</p>
        </div>
        {interventions.length > 0 && (
          <span className="ml-auto rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-black text-red-400">
            {interventions.length} urgent
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        {loading && <LoadingState />}
        {!loading && interventions.map(intervention => {
          const isOverload = intervention.cognitive_load_score >= 70;
          return (
            <div
              key={intervention.id}
              className={`rounded-xl border p-4 ${isOverload ? 'border-red-500/25 bg-red-500/8' : 'border-amber-500/20 bg-amber-500/8'}`}
            >
              <div className="mb-2 flex items-start gap-2">
                <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${isOverload ? 'text-red-400' : 'text-amber-400'}`} />
                <p className={`text-xs font-bold leading-snug ${isOverload ? 'text-red-300' : 'text-amber-300'}`}>
                  {intervention.student_name} — Load: {intervention.cognitive_load_score}
                  {intervention.has_special_needs && ' · IEP Active'}
                </p>
              </div>
              <p className="mb-3 text-[11px] leading-relaxed text-slate-400">
                {intervention.ai_reasoning}
              </p>
              <div className="flex flex-col gap-1.5">
                {intervention.has_special_needs && (
                  <button
                    onClick={() => onAction(intervention.id, 'actioned_by_teacher')}
                    className="flex items-center gap-2 rounded-lg bg-violet-600/20 px-3 py-2 text-xs font-bold text-violet-300 hover:bg-violet-600/30 transition-colors"
                  >
                    <UserCheck size={12} />
                    Generate extension offer
                  </button>
                )}
                <button
                  onClick={() => onAction(intervention.id, 'actioned_by_counselor')}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors"
                >
                  <TrendingUp size={12} />
                  Flag for counselor
                </button>
                <button
                  onClick={() => onAction(intervention.id, 'resolved')}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors"
                >
                  <CheckCircle size={12} />
                  Mark as addressed
                </button>
              </div>
            </div>
          );
        })}

        {!loading && interventions.length === 0 && (
          <div className="py-10 text-center">
            <CheckCircle size={32} className="mx-auto mb-3 text-emerald-400/40" />
            <p className="text-sm font-bold text-slate-500">All students synced.</p>
            <p className="text-xs text-slate-600">Ei-Core will alert you when action is needed.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ──────────────────────────────────────────

export default function EducationDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [bandwidth, setBandwidth] = useState<DayLoad[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [, setSelectedStudent] = useState<Student | null>(null);

  const [loadingRoster, setLoadingRoster] = useState(true);
  const [loadingBandwidth, setLoadingBandwidth] = useState(true);
  const [loadingInterventions, setLoadingInterventions] = useState(true);
  const [errorRoster, setErrorRoster] = useState<string | null>(null);
  const [errorBandwidth, setErrorBandwidth] = useState<string | null>(null);

  const fetchRoster = async () => {
    setLoadingRoster(true);
    setErrorRoster(null);
    try {
      const data = await apiFetch('/api/education/roster');
      setStudents(data);
    } catch {
      setErrorRoster('Failed to load roster. Check your connection.');
    } finally {
      setLoadingRoster(false);
    }
  };

  const fetchBandwidth = async () => {
    setLoadingBandwidth(true);
    setErrorBandwidth(null);
    try {
      const data = await apiFetch('/api/education/bandwidth');
      setBandwidth(data);
    } catch {
      setErrorBandwidth('Failed to load bandwidth data.');
    } finally {
      setLoadingBandwidth(false);
    }
  };

  const fetchInterventions = async () => {
    setLoadingInterventions(true);
    try {
      const data = await apiFetch('/api/education/interventions');
      setInterventions(data);
    } catch {
      // Silently fail — interventions table may be empty
    } finally {
      setLoadingInterventions(false);
    }
  };

  const autoGenerateInterventions = async () => {
    try {
      await apiFetch('/api/education/interventions/auto-generate', { method: 'POST' });
      await fetchInterventions();
    } catch { /* silent */ }
  };

  const handleInterventionAction = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/education/interventions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await fetchInterventions();
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchRoster();
    fetchBandwidth();
    fetchInterventions();
    // Auto-generate interventions for overloaded students on load
    setTimeout(autoGenerateInterventions, 2000);
  }, []);

  const stats = getSummaryStats(students);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400">
              <Zap size={12} />
              VeloxSync Education
            </div>
            <h1 className="text-3xl font-black text-white">Teacher Command Center</h1>
            <p className="mt-1 text-slate-400">Ei-Core is monitoring your roster in real time.</p>
          </div>
          <button
            onClick={() => { fetchRoster(); fetchBandwidth(); fetchInterventions(); }}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Summary stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Total Students', value: stats.total,    icon: Users,         color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Synced',         value: stats.sync,     icon: CheckCircle,   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Friction',       value: stats.friction, icon: Clock,         color: 'text-amber-400',  bg: 'bg-amber-500/10' },
            { label: 'Overload',       value: stats.overload, icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-slate-900/60 p-5">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* IEP callout */}
        {stats.iep > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-violet-500/25 bg-violet-500/8 px-5 py-3">
            <Brain size={16} className="shrink-0 text-violet-400" />
            <p className="text-sm text-violet-300">
              <span className="font-black">{stats.iep} student{stats.iep > 1 ? 's' : ''}</span> on your roster {stats.iep > 1 ? 'have' : 'has'} an active IEP. Ei-Core has enabled Clarity Mode automatically.
            </p>
          </div>
        )}

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <RosterHealthMatrix
              students={students}
              loading={loadingRoster}
              error={errorRoster}
              onRetry={fetchRoster}
              onSelectStudent={setSelectedStudent}
            />
            <BandwidthHeatmap
              days={bandwidth}
              loading={loadingBandwidth}
              error={errorBandwidth}
              onRetry={fetchBandwidth}
            />
          </div>
          <div className="lg:col-span-1">
            <InterventionFeedPanel
              interventions={interventions}
              loading={loadingInterventions}
              onAction={handleInterventionAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
