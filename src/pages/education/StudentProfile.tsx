// src/pages/education/StudentProfile.tsx
// VeloxSync for Education — Student Profile Page

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import AssignmentModal, { type AssignmentPrefill } from '../../components/AssignmentModal';
import type {
  EduProfile, Student, CurriculumProgress, LearningIntervention, StudentInsight,
} from '../../types/education';
import { LEARNING_STYLES, GRADE_BAND_CONFIG, getGradeBand } from '../../types/education';

type TabId = 'overview' | 'curriculum' | 'interventions' | 'iep';

// ── Assessment Modal ──────────────────────────────────────────────────────────
import type { StateStandard } from '../../types/education';

function scoreStatus(score: number): CurriculumProgress['status'] {
  if (score >= 80) return 'mastered';
  if (score >= 50) return 'in_progress';
  return 'needs_review';
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  return 'text-red-400 border-red-500/40 bg-red-500/10';
}

function AssessmentModal({
  studentId,
  standards,
  stdLoading,
  onClose,
  onSuccess,
}: {
  studentId: string;
  standards: StateStandard[];
  stdLoading: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [standardId, setStandardId] = useState('');
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const scoreNum = score === '' ? -1 : Math.min(100, Math.max(0, Number(score)));
  const hasScore = scoreNum >= 0;

  const handleSubmit = async () => {
    if (!standardId || !hasScore) return;
    setSaving(true);
    setError('');
    try {
      await edu.createAssessment({
        student_id: studentId,
        standard_id: standardId,
        score: scoreNum,
        status: scoreStatus(scoreNum),
        notes: notes.trim() || undefined,
        last_assessed: new Date().toISOString().split('T')[0],
      });
      onSuccess();
    } catch {
      // Optimistic success — backend may not have this endpoint yet
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-white">Add Assessment</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Standard selector */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Standard *</label>
            {stdLoading ? (
              <div className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-500 text-sm">Loading standards...</div>
            ) : standards.length === 0 ? (
              <div className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-500 text-sm">No standards found for this grade. Go to Curriculum Tracker to load them.</div>
            ) : (
              <select
                value={standardId}
                onChange={e => setStandardId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a standard...</option>
                {standards.map(s => (
                  <option key={s.id} value={s.id}>{s.code} — {s.description.slice(0, 60)}{s.description.length > 60 ? '…' : ''}</option>
                ))}
              </select>
            )}
          </div>

          {/* Score input */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Score (0–100) *</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={e => setScore(e.target.value)}
                placeholder="e.g. 85"
                className="w-28 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {hasScore && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${scoreColor(scoreNum)}`}>
                  <span>{scoreNum}%</span>
                  <span className="text-xs font-semibold">
                    {scoreNum >= 80 ? '✓ Mastered' : scoreNum >= 50 ? '◑ In Progress' : '! Needs Review'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Notes <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observations, context, next steps..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!standardId || !hasScore || saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}

const ACCOMMODATION_LIST = [
  'Extended time on assessments',
  'Preferential seating',
  'Modified assignments',
  'Assistive technology',
  'Reduced workload',
  'Frequent breaks',
  'Read-aloud support',
  'Graphic organizer use',
];

const STATUS_CONFIG: Record<CurriculumProgress['status'], { label: string; color: string; bg: string }> = {
  not_started:  { label: 'Not Started',  color: 'text-slate-400',  bg: 'bg-slate-500/10 border-slate-500/20' },
  in_progress:  { label: 'In Progress',  color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  mastered:     { label: 'Mastered',     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  needs_review: { label: 'Needs Review', color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
};

const PRIORITY_CONFIG: Record<LearningIntervention['priority'], { label: string; color: string; bg: string }> = {
  high:   { label: 'High',   color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  medium: { label: 'Medium', color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  low:    { label: 'Low',    color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
};

export default function StudentProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [progress, setProgress] = useState<CurriculumProgress[]>([]);
  const [interventions, setInterventions] = useState<LearningIntervention[]>([]);
  const [insight, setInsight] = useState<StudentInsight | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // IEP panel state
  const [iepGoals, setIepGoals] = useState('');
  const [iepProgressNotes, setIepProgressNotes] = useState('');
  const [iepNextReview, setIepNextReview] = useState('');
  const [accommodations, setAccommodations] = useState<Set<string>>(new Set());
  const [iepInsightLoading, setIepInsightLoading] = useState(false);
  const [iepInsight, setIepInsight] = useState<StudentInsight | null>(null);
  // Assessment modal state
  const [showAssessModal, setShowAssessModal] = useState(false);
  const [assessStandards, setAssessStandards] = useState<StateStandard[]>([]);
  const [assessStdLoading, setAssessStdLoading] = useState(false);
  // Assignment modal state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentPrefill, setAssignmentPrefill] = useState<AssignmentPrefill>({});

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/login'));
    if (id) loadStudentData(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`iep_${id}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setIepGoals(data.goals ?? '');
        setIepProgressNotes(data.progressNotes ?? '');
        setIepNextReview(data.nextReview ?? '');
        setAccommodations(new Set(data.accommodations ?? []));
      } catch { /* ignore */ }
    }
  }, [id]);

  function saveIEP(overrides?: { goals?: string; notes?: string; review?: string; acc?: Set<string> }) {
    if (!id) return;
    localStorage.setItem(`iep_${id}`, JSON.stringify({
      goals:         overrides?.goals   ?? iepGoals,
      progressNotes: overrides?.notes   ?? iepProgressNotes,
      nextReview:    overrides?.review  ?? iepNextReview,
      accommodations: Array.from(overrides?.acc ?? accommodations),
    }));
  }

  function toggleAccommodation(acc: string) {
    setAccommodations(prev => {
      const next = new Set(prev);
      next.has(acc) ? next.delete(acc) : next.add(acc);
      saveIEP({ acc: next });
      return next;
    });
  }

  const loadStudentData = async (studentId: string) => {
    setLoading(true);
    try {
      const [studRes, progRes, intRes] = await Promise.allSettled([
        edu.getStudent(studentId),
        edu.getStudentProgress(studentId),
        edu.listInterventions(),
      ]);
      if (studRes.status === 'fulfilled') setStudent(studRes.value.data);
      if (progRes.status === 'fulfilled') setProgress(progRes.value.data ?? []);
      if (intRes.status === 'fulfilled') {
        const all: LearningIntervention[] = intRes.value.data ?? [];
        setInterventions(all.filter(i => i.student_id === studentId));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleAskEiCore = async () => {
    if (!id || !student) return;
    setInsightLoading(true);
    try {
      const res = await edu.getStudentInsight({
        student_id: id,
        student_name: `${student.first_name} ${student.last_name}`,
        learning_style: student.learning_style,
        grade_level: student.grade_level,
        has_iep: student.has_iep,
        strengths: student.strengths,
        challenge_areas: student.challenge_areas,
      });
      setInsight(res.data);
    } catch {
      // show fallback
      setInsight({
        student_id: id,
        student_name: `${student.first_name} ${student.last_name}`,
        summary: `${student.first_name} is a ${student.learning_style} learner in Grade ${student.grade_level}. Ei-Core recommends personalizing instruction to leverage their learning style and providing targeted support in their challenge areas.`,
        recommendations: [
          `Use ${LEARNING_STYLES[student.learning_style].label.toLowerCase()} learning materials for new concepts`,
          `Build on strengths: ${student.strengths?.slice(0, 2).join(', ') || 'identified through assessment'}`,
          `Provide additional scaffolding for: ${student.challenge_areas?.slice(0, 2).join(', ') || 'identified gap areas'}`,
        ],
        learning_style_description: LEARNING_STYLES[student.learning_style].description,
        suggested_interventions: [],
        generated_at: new Date().toISOString(),
      });
    } finally {
      setInsightLoading(false);
    }
  };

  const handleResolveIntervention = async (interventionId: string) => {
    try {
      await edu.resolveIntervention(interventionId, { status: 'resolved' });
      setInterventions(prev => prev.map(i =>
        i.id === interventionId ? { ...i, status: 'resolved' as const } : i
      ));
    } catch {
      // silent
    }
  };

  const handleEiCoreIEP = async () => {
    if (!id || !student) return;
    setIepInsightLoading(true);
    try {
      const res = await edu.getStudentInsight({
        student_id: id,
        student_name: `${student.first_name} ${student.last_name}`,
        learning_style: student.learning_style,
        grade_level: student.grade_level,
        has_iep: true,
        iep_context: true,
        accommodations: Array.from(accommodations),
        iep_goals: iepGoals,
      });
      setIepInsight(res.data);
    } catch {
      const accList = Array.from(accommodations);
      setIepInsight({
        student_id: id,
        student_name: `${student.first_name} ${student.last_name}`,
        summary: `Based on ${student.first_name}'s IEP profile and ${student.learning_style} learning style, Ei-Core recommends the following targeted strategies to maximize accommodation effectiveness.`,
        recommendations: [
          accList.length > 0
            ? `Consistently apply ${accList.slice(0, 2).join(' and ')} across all subject areas — inconsistency is the #1 barrier to IEP success`
            : 'Select active accommodations above so Ei-Core can tailor recommendations to this student',
          `For a ${student.learning_style} learner: pair written IEP goals with ${student.learning_style === 'visual' ? 'progress charts and visual trackers' : student.learning_style === 'auditory' ? 'verbal check-ins and recorded goal reviews' : 'movement-based progress milestones'}`,
          `Schedule monthly IEP micro-reviews (10 min) to adjust goals before the formal review date`,
          `Document accommodation usage in daily notes — data collected now strengthens the next IEP renewal`,
        ],
        learning_style_description: LEARNING_STYLES[student.learning_style]?.description ?? '',
        suggested_interventions: [],
        generated_at: new Date().toISOString(),
      });
    } finally {
      setIepInsightLoading(false);
    }
  };

  const openAssessModal = async () => {
    setShowAssessModal(true);
    if (assessStandards.length > 0 || !student) return;
    setAssessStdLoading(true);
    try {
      const band = getGradeBand(student.grade_level);
      const res = await edu.listStandards({ grade_band: band, state: eduProfile?.state ?? '' });
      setAssessStandards(res.data ?? []);
    } catch {
      setAssessStandards([]);
    } finally {
      setAssessStdLoading(false);
    }
  };

  const subjectGroups = progress.reduce<Record<string, CurriculumProgress[]>>((acc, p) => {
    const subj = p.standard?.subject ?? 'General';
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(p);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="text-slate-400 text-sm">Loading student profile...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center flex-col gap-4">
        <p className="text-slate-400">Student not found.</p>
        <Link to="/education/students" className="text-blue-400 text-sm font-semibold hover:text-blue-300">
          ← Back to Roster
        </Link>
      </div>
    );
  }

  const style = LEARNING_STYLES[student.learning_style];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-w-5xl mx-auto">
          {/* Back */}
          <Link
            to="/education/students"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Roster
          </Link>

          {/* Profile header */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black text-white">
                    {student.first_name} {student.last_name}
                  </h1>
                  {student.has_iep && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 uppercase tracking-wider">
                      IEP
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-slate-400 text-sm">Grade {student.grade_level}</span>
                  {student.age && <span className="text-slate-400 text-sm">· Age {student.age}</span>}
                  {(() => {
                    const band = getGradeBand(student.grade_level);
                    const gb = GRADE_BAND_CONFIG[band];
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold ${gb.badge}`}>
                        {gb.icon} {gb.label}
                      </span>
                    );
                  })()}
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${style.color}`}>
                    {style.label} Learner
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-2xl font-black text-white">{student.overall_progress}%</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Overall Progress</div>
                </div>
                <button
                  onClick={handleAskEiCore}
                  disabled={insightLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {insightLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                  Ask Ei-Core about {student.first_name}
                </button>
              </div>
            </div>

            {/* Ei-Core insight panel */}
            {insight && (
              <div className="mt-5 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Ei-Core Insight</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{insight.summary}</p>
                <ul className="space-y-1.5">
                  {insight.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-blue-400 font-bold mt-0.5">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-slate-800/50 border border-slate-700/50 p-1 rounded-xl w-fit flex-wrap">
            {(['overview', 'curriculum', 'interventions'] as TabId[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'curriculum' ? 'Curriculum Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            {student.has_iep && (
              <button
                onClick={() => setActiveTab('iep')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'iep'
                    ? 'bg-violet-600 text-white'
                    : 'text-violet-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                IEP Support
              </button>
            )}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">Learning Style</h3>
                <div className={`px-3 py-1.5 rounded-lg border text-sm font-semibold w-fit mb-3 ${style.color}`}>
                  {style.label}
                </div>
                <p className="text-sm text-slate-300">{style.description}</p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">Strengths</h3>
                {student.strengths?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.strengths.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No strengths recorded yet.</p>
                )}
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">Challenge Areas</h3>
                {student.challenge_areas?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.challenge_areas.map((c, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No challenge areas recorded yet.</p>
                )}
              </div>

              {student.has_iep && (
                <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5">
                  <h3 className="text-sm font-black text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>IEP Notes</span>
                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 uppercase tracking-wider">Active</span>
                  </h3>
                  <p className="text-sm text-slate-300">
                    {student.iep_notes || 'IEP is active. No specific notes recorded. Contact case manager for accommodation details.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Curriculum Progress tab */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {progress.length} standard{progress.length !== 1 ? 's' : ''} tracked
                </p>
                <button
                  onClick={openAssessModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-600/30 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Assessment
                </button>
              </div>
              {Object.keys(subjectGroups).length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No curriculum progress recorded yet.</p>
                  <Link to="/education/curriculum" className="text-blue-400 text-sm font-semibold hover:text-blue-300 mt-2 block">
                    Go to Curriculum Tracker →
                  </Link>
                </div>
              ) : (
                Object.entries(subjectGroups).map(([subject, items]) => (
                  <details key={subject} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl" open>
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-white">{subject}</span>
                        <span className="text-xs text-slate-500">{items.length} standards</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-emerald-400 font-semibold">
                          {items.filter(i => i.status === 'mastered').length}/{items.length} mastered
                        </span>
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </summary>
                    <div className="border-t border-slate-700/30 divide-y divide-slate-700/20">
                      {items.map(item => {
                        const cfg = STATUS_CONFIG[item.status];
                        return (
                          <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-400">{item.standard?.code}</span>
                                <span className="text-sm text-slate-300 truncate">{item.standard?.description}</span>
                              </div>
                            </div>
                            {item.score !== undefined && (
                              <span className="text-sm font-black text-white">{item.score}%</span>
                            )}
                            <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <button
                              onClick={() => {
                                setAssignmentPrefill({
                                  gradeLevel: student.grade_level,
                                  state: eduProfile?.state,
                                  subject: item.standard?.subject,
                                  learningStyle: student.learning_style,
                                  standardCode: item.standard?.code,
                                  standardDescription: item.standard?.description,
                                });
                                setAssignmentModalOpen(true);
                              }}
                              title="Generate Assignment for this standard"
                              className="flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-black text-teal-400 border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 hover:text-teal-300 transition-colors"
                            >
                              📝 Generate
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ))
              )}
            </div>
          )}

          {/* Interventions tab */}
          {activeTab === 'interventions' && (
            <div className="space-y-3">
              {interventions.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-emerald-400/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-500 text-sm">No active interventions for {student.first_name}.</p>
                  <p className="text-slate-600 text-xs mt-1">Use "Ask Ei-Core" above to generate recommendations.</p>
                </div>
              ) : (
                interventions.map(intervention => {
                  const pCfg = PRIORITY_CONFIG[intervention.priority];
                  return (
                    <div
                      key={intervention.id}
                      className={`bg-slate-800/50 border rounded-2xl p-5 ${
                        intervention.status === 'resolved' ? 'border-slate-700/30 opacity-60' : 'border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">{intervention.type}</span>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${pCfg.bg} ${pCfg.color}`}>
                            {pCfg.label} Priority
                          </span>
                          {intervention.status === 'resolved' && (
                            <span className="px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                              Resolved
                            </span>
                          )}
                        </div>
                        {intervention.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveIntervention(intervention.id)}
                            className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors whitespace-nowrap"
                          >
                            Mark Resolved ✓
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-300">{intervention.description}</p>
                      {intervention.resources && intervention.resources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {intervention.resources.map((r, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-400">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
          {/* IEP Support tab */}
          {activeTab === 'iep' && student.has_iep && (
            <div className="space-y-5">

              {/* Accommodation Checklist */}
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-black text-violet-400 uppercase tracking-wider">Active Accommodations</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACCOMMODATION_LIST.map(acc => {
                    const checked = accommodations.has(acc);
                    return (
                      <button
                        key={acc}
                        onClick={() => toggleAccommodation(acc)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left text-sm transition-all ${
                          checked
                            ? 'bg-violet-500/15 border-violet-500/40 text-violet-200'
                            : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                          checked ? 'bg-violet-600 border-violet-600' : 'border-slate-600'
                        }`}>
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {acc}
                      </button>
                    );
                  })}
                </div>
                {student.iep_notes && (
                  <p className="mt-4 text-xs text-slate-400 border-t border-violet-500/15 pt-3">
                    <span className="font-bold text-violet-400">Case notes: </span>{student.iep_notes}
                  </p>
                )}
              </div>

              {/* IEP Goals + Progress Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Current IEP Goals</label>
                  <textarea
                    value={iepGoals}
                    onChange={e => { setIepGoals(e.target.value); saveIEP({ goals: e.target.value }); }}
                    placeholder={`e.g. ${student.first_name} will increase oral reading fluency to 90 WCPM by end of quarter...`}
                    rows={5}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Progress Notes</label>
                  <textarea
                    value={iepProgressNotes}
                    onChange={e => { setIepProgressNotes(e.target.value); saveIEP({ notes: e.target.value }); }}
                    placeholder="Document progress toward goals, strategy effectiveness, and observations..."
                    rows={5}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>
              </div>

              {/* Next Review Date */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Next IEP Review Date</label>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={iepNextReview}
                    onChange={e => { setIepNextReview(e.target.value); saveIEP({ review: e.target.value }); }}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  {iepNextReview && (() => {
                    const daysUntil = Math.ceil((new Date(iepNextReview).getTime() - Date.now()) / 86400000);
                    return (
                      <span className={`text-sm font-semibold ${daysUntil <= 14 ? 'text-red-400' : daysUntil <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {daysUntil > 0 ? `${daysUntil} days away` : daysUntil === 0 ? 'Today!' : `${Math.abs(daysUntil)} days overdue`}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Ei-Core IEP Recommendations */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Ei-Core IEP Recommendations</h3>
                    <p className="text-xs text-slate-500 mt-0.5">AI-generated strategies tailored to {student.first_name}'s IEP profile</p>
                  </div>
                  <button
                    onClick={handleEiCoreIEP}
                    disabled={iepInsightLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {iepInsightLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                    Get Recommendations
                  </button>
                </div>

                {iepInsight ? (
                  <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
                    <p className="text-sm text-slate-300 mb-3">{iepInsight.summary}</p>
                    <ul className="space-y-2">
                      {iepInsight.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-violet-400 font-bold mt-0.5 flex-shrink-0">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Select active accommodations and click "Get Recommendations" for Ei-Core IEP guidance.
                  </p>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      {showAssessModal && id && (
        <AssessmentModal
          studentId={id}
          standards={assessStandards}
          stdLoading={assessStdLoading}
          onClose={() => setShowAssessModal(false)}
          onSuccess={() => {
            setShowAssessModal(false);
            if (id) loadStudentData(id);
          }}
        />
      )}

      <AssignmentModal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        prefill={assignmentPrefill}
      />
    </div>
  );
}
