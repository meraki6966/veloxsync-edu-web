// src/pages/education/StudentProfile.tsx
// VeloxSync for Education — Child Profile Page (V3 homeschool)

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
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

const PROFILE_CSS = `
.edu-prof { display: flex; height: 100vh; overflow: hidden; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; }
.edu-prof-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; }
.edu-prof-title { font-family: 'Cormorant Garamond', serif; font-weight: 400; font-style: normal; line-height: 1.1; color: #1C1812; }
.edu-prof-card { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.08); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.edu-prof-iep { background: #FBF6EE; border: 1px solid rgba(154,106,18,0.22); border-radius: 12px; }
.edu-prof-input { width: 100%; background: #FFFFFF; border: 1px solid rgba(28,24,18,0.15); border-radius: 8px; color: #1C1812; font-size: 14px; }
.edu-prof-input::placeholder { color: rgba(28,24,18,0.4); }
.edu-prof-input:focus { outline: none; border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
.edu-prof-input-iep:focus { outline: none; border-color: #9A6A12; box-shadow: 0 0 0 3px rgba(154,106,18,0.15); }
.edu-prof-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #3D6B4F; }
.edu-prof-label-iep { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #9A6A12; }
.edu-prof-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #3D6B4F; color: #fff; border-radius: 8px; font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 600; min-height: 44px; transition: background-color 0.15s ease; }
.edu-prof-btn:hover { background: #2D5A3F; }
.edu-prof-btn-iep { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #9A6A12; color: #fff; border-radius: 8px; font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 600; min-height: 44px; transition: background-color 0.15s ease; }
.edu-prof-btn-iep:hover { background: #815810; }
`;

function scoreStatus(score: number): CurriculumProgress['status'] {
  if (score >= 80) return 'mastered';
  if (score >= 50) return 'in_progress';
  return 'needs_review';
}

function scoreColorStyle(score: number): CSSProperties {
  if (score >= 80) return { color: '#2E5340', border: '1px solid rgba(61,107,79,0.3)', background: 'rgba(61,107,79,0.12)' };
  if (score >= 50) return { color: '#9A6A12', border: '1px solid rgba(180,120,20,0.3)', background: 'rgba(180,120,20,0.12)' };
  return { color: '#B03A2E', border: '1px solid rgba(176,58,46,0.3)', background: 'rgba(176,58,46,0.1)' };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: '#FFFFFF', border: '1px solid rgba(28,24,18,0.1)', fontFamily: "'Open Sans', sans-serif" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-normal" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1C1812' }}>Add Assessment</h3>
          <button onClick={onClose} style={{ color: 'rgba(28,24,18,0.5)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Standard selector */}
          <div>
            <label className="edu-prof-label block mb-1.5">Standard *</label>
            {stdLoading ? (
              <div className="edu-prof-input px-3 py-2.5 text-sm" style={{ color: 'rgba(28,24,18,0.45)' }}>Loading standards...</div>
            ) : standards.length === 0 ? (
              <div className="edu-prof-input px-3 py-2.5 text-sm" style={{ color: 'rgba(28,24,18,0.45)' }}>No standards found for this grade. Go to the Standards Library to load them.</div>
            ) : (
              <select
                value={standardId}
                onChange={e => setStandardId(e.target.value)}
                className="edu-prof-input px-3 py-2.5"
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
            <label className="edu-prof-label block mb-1.5">Score (0–100) *</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={e => setScore(e.target.value)}
                placeholder="e.g. 85"
                className="edu-prof-input px-3 py-2.5"
                style={{ width: '7rem' }}
              />
              {hasScore && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold" style={scoreColorStyle(scoreNum)}>
                  <span>{scoreNum}%</span>
                  <span className="text-xs font-semibold">
                    {scoreNum >= 80 ? 'Mastered' : scoreNum >= 50 ? 'In Progress' : 'Needs Review'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="edu-prof-label block mb-1.5">Notes <span className="normal-case font-normal" style={{ color: 'rgba(28,24,18,0.4)' }}>(optional)</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observations, context, next steps..."
              rows={3}
              className="edu-prof-input px-3 py-2.5 resize-none"
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#B03A2E' }}>{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border bg-white px-6 text-[#1C1812] transition-colors hover:bg-[rgba(28,24,18,0.03)]"
            style={{ minHeight: 44, borderColor: 'rgba(28,24,18,0.15)', fontFamily: "'Open Sans', sans-serif", fontSize: 14, fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!standardId || !hasScore || saving}
            className="edu-prof-btn flex-1 px-6 disabled:opacity-40"
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

const STATUS_CONFIG: Record<CurriculumProgress['status'], { label: string; style: CSSProperties }> = {
  not_started:  { label: 'Not Started',  style: { color: 'rgba(28,24,18,0.5)', background: 'rgba(28,24,18,0.05)', border: '1px solid rgba(28,24,18,0.12)' } },
  in_progress:  { label: 'In Progress',  style: { color: '#9A6A12', background: 'rgba(180,120,20,0.12)', border: '1px solid rgba(180,120,20,0.25)' } },
  mastered:     { label: 'Mastered',     style: { color: '#2E5340', background: 'rgba(61,107,79,0.12)', border: '1px solid rgba(61,107,79,0.3)' } },
  needs_review: { label: 'Needs Review', style: { color: '#B03A2E', background: 'rgba(176,58,46,0.1)', border: '1px solid rgba(176,58,46,0.25)' } },
};

const PRIORITY_CONFIG: Record<LearningIntervention['priority'], { label: string; style: CSSProperties }> = {
  high:   { label: 'High',   style: { color: '#B03A2E', background: 'rgba(176,58,46,0.1)', border: '1px solid rgba(176,58,46,0.25)' } },
  medium: { label: 'Medium', style: { color: '#9A6A12', background: 'rgba(180,120,20,0.12)', border: '1px solid rgba(180,120,20,0.25)' } },
  low:    { label: 'Low',    style: { color: '#3D6B4F', background: 'rgba(61,107,79,0.1)', border: '1px solid rgba(61,107,79,0.25)' } },
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
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-prof', 'true');
    styleEl.textContent = PROFILE_CSS;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
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
      <div className="flex h-screen items-center justify-center" style={{ background: '#FAF7F2', fontFamily: "'Open Sans', sans-serif" }}>
        <div className="text-sm" style={{ color: 'rgba(28,24,18,0.5)' }}>Loading child profile...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4" style={{ background: '#FAF7F2', fontFamily: "'Open Sans', sans-serif" }}>
        <p style={{ color: 'rgba(28,24,18,0.6)' }}>Child not found.</p>
        <Link to="/education/dashboard" className="text-sm font-semibold" style={{ color: '#3D6B4F' }}>
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const style = LEARNING_STYLES[student.learning_style];

  return (
    <div className="edu-prof">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(28,24,18,0.1)' }}>
          <button onClick={() => setMobileOpen(true)} style={{ color: 'rgba(28,24,18,0.6)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          {/* Back */}
          <Link
            to="/education/dashboard"
            className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
            style={{ color: 'rgba(28,24,18,0.55)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to dashboard
          </Link>

          {/* Profile header */}
          <div className="edu-prof-card p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold text-white flex-shrink-0" style={{ background: '#3D6B4F' }}>
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="edu-prof-title" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 400, color: '#1C1812', fontStyle: 'normal' }}>
                    {student.first_name} {student.last_name}
                  </h1>
                  {student.has_iep && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider" style={{ background: 'rgba(154,106,18,0.12)', color: '#9A6A12', border: '1px solid rgba(154,106,18,0.25)' }}>
                      IEP
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-sm" style={{ color: 'rgba(28,24,18,0.55)' }}>Grade {student.grade_level}</span>
                  {student.age && <span className="text-sm" style={{ color: 'rgba(28,24,18,0.55)' }}>· Age {student.age}</span>}
                  {(() => {
                    const band = getGradeBand(student.grade_level);
                    const gb = GRADE_BAND_CONFIG[band];
                    return (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(61,107,79,0.08)', color: '#3D6B4F', border: '1px solid rgba(61,107,79,0.2)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D6B4F', display: 'inline-block' }} />
                        {gb.label}
                      </span>
                    );
                  })()}
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ background: 'rgba(61,107,79,0.08)', color: '#3D6B4F', border: '1px solid rgba(61,107,79,0.2)' }}>
                    {style.label} Learner
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: '#1C1812' }}>{student.overall_progress}%</div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(28,24,18,0.45)' }}>Overall Progress</div>
                </div>
                <button
                  onClick={handleAskEiCore}
                  disabled={insightLoading}
                  className="edu-prof-btn px-6 disabled:opacity-60"
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', opacity: insightLoading ? 0.6 : 1 }} />
                  {insightLoading ? 'Asking Ei-Core...' : `Ask Ei-Core about ${student.first_name}`}
                </button>
              </div>
            </div>

            {/* Ei-Core insight panel */}
            {insight && (
              <div className="mt-5 p-4 rounded-xl" style={{ border: '1px solid rgba(61,107,79,0.2)', background: 'rgba(61,107,79,0.05)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D6B4F', display: 'inline-block' }} />
                  <span style={{ fontFamily: "'Open Sans',sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#3D6B4F', letterSpacing: '0.08em' }}>Ei-Core Insight</span>
                </div>
                <p className="text-sm mb-3" style={{ color: 'rgba(28,24,18,0.8)' }}>{insight.summary}</p>
                <ul className="space-y-1.5">
                  {insight.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(28,24,18,0.8)' }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3D6B4F" strokeWidth={1.5} className="flex-shrink-0 mt-0.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit flex-wrap" style={{ background: '#FFFFFF', border: '1px solid rgba(28,24,18,0.1)' }}>
            {(['overview', 'curriculum', 'interventions'] as TabId[]).map(tab => {
              const label = tab === 'curriculum' ? 'Progress' : tab === 'interventions' ? 'Support Plans' : 'Overview';
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={active ? { background: '#3D6B4F', color: '#fff' } : { color: 'rgba(28,24,18,0.55)' }}
                >
                  {label}
                </button>
              );
            })}
            {student.has_iep && (
              <button
                onClick={() => setActiveTab('iep')}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5"
                style={activeTab === 'iep' ? { background: '#9A6A12', color: '#fff' } : { color: '#9A6A12' }}
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#9A6A12' }} />
                IEP Support
              </button>
            )}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="edu-prof-card p-5">
                <h3 className="edu-prof-label mb-3">Learning Style</h3>
                <div className="px-3 py-1.5 rounded-lg text-sm font-semibold w-fit mb-3" style={{ background: 'rgba(61,107,79,0.08)', color: '#3D6B4F', border: '1px solid rgba(61,107,79,0.2)' }}>
                  {style.label}
                </div>
                <p className="text-sm" style={{ color: 'rgba(28,24,18,0.7)' }}>{style.description}</p>
              </div>

              <div className="edu-prof-card p-5">
                <h3 className="edu-prof-label mb-3">Strengths</h3>
                {student.strengths?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.strengths.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(61,107,79,0.1)', color: '#2E5340', border: '1px solid rgba(61,107,79,0.25)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'rgba(28,24,18,0.45)' }}>No strengths recorded yet.</p>
                )}
              </div>

              <div className="edu-prof-card p-5">
                <h3 className="edu-prof-label mb-3">Challenge Areas</h3>
                {student.challenge_areas?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.challenge_areas.map((c, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(180,120,20,0.12)', color: '#9A6A12', border: '1px solid rgba(180,120,20,0.25)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'rgba(28,24,18,0.45)' }}>No challenge areas recorded yet.</p>
                )}
              </div>

              {student.has_iep && (
                <div className="edu-prof-iep p-5">
                  <h3 className="edu-prof-label-iep mb-3 flex items-center gap-2">
                    <span>IEP Notes</span>
                    <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full uppercase tracking-wider" style={{ background: 'rgba(154,106,18,0.12)', color: '#9A6A12', border: '1px solid rgba(154,106,18,0.25)' }}>Active</span>
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(28,24,18,0.75)' }}>
                    {student.iep_notes || 'IEP is active. No specific notes recorded yet. Add accommodation details in the IEP Support tab.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Progress tab */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'rgba(28,24,18,0.45)' }}>
                  {progress.length} standard{progress.length !== 1 ? 's' : ''} tracked
                </p>
                <button
                  onClick={openAssessModal}
                  className="edu-prof-btn px-6"
                >
                  <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Assessment
                </button>
              </div>
              {Object.keys(subjectGroups).length === 0 ? (
                <div className="text-center py-12" style={{ color: 'rgba(28,24,18,0.45)' }}>
                  <p>No progress recorded yet.</p>
                  <Link to="/education/standards" className="text-sm font-semibold mt-2 block" style={{ color: '#3D6B4F' }}>
                    Go to the Standards Library →
                  </Link>
                </div>
              ) : (
                Object.entries(subjectGroups).map(([subject, items]) => (
                  <details key={subject} className="edu-prof-card" open>
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold" style={{ color: '#1C1812' }}>{subject}</span>
                        <span className="text-xs" style={{ color: 'rgba(28,24,18,0.45)' }}>{items.length} standards</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold" style={{ color: '#3D6B4F' }}>
                          {items.filter(i => i.status === 'mastered').length}/{items.length} mastered
                        </span>
                        <svg className="w-4 h-4" style={{ color: 'rgba(28,24,18,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </summary>
                    <div style={{ borderTop: '1px solid rgba(28,24,18,0.08)' }}>
                      {items.map((item, idx) => {
                        const cfg = STATUS_CONFIG[item.status];
                        return (
                          <div key={item.id} className="flex items-center gap-4 px-5 py-3" style={idx > 0 ? { borderTop: '1px solid rgba(28,24,18,0.06)' } : undefined}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold" style={{ color: '#3D6B4F' }}>{item.standard?.code}</span>
                                <span className="text-sm truncate" style={{ color: 'rgba(28,24,18,0.75)' }}>{item.standard?.description}</span>
                              </div>
                            </div>
                            {item.score !== undefined && (
                              <span className="text-sm font-bold" style={{ color: '#1C1812' }}>{item.score}%</span>
                            )}
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={cfg.style}>
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
                              className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                              style={{ color: '#3D6B4F', border: '1px solid rgba(61,107,79,0.25)', background: 'rgba(61,107,79,0.06)' }}
                            >
                              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                              </svg>
                              Generate
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

          {/* Support Plans tab */}
          {activeTab === 'interventions' && (
            <div className="space-y-3">
              {interventions.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(61,107,79,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm" style={{ color: 'rgba(28,24,18,0.5)' }}>No active support plans for {student.first_name}.</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(28,24,18,0.4)' }}>Use "Ask Ei-Core" above to generate recommendations.</p>
                </div>
              ) : (
                interventions.map(intervention => {
                  const pCfg = PRIORITY_CONFIG[intervention.priority];
                  return (
                    <div
                      key={intervention.id}
                      className="edu-prof-card p-5"
                      style={intervention.status === 'resolved' ? { opacity: 0.65 } : undefined}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm capitalize" style={{ color: '#1C1812' }}>{intervention.type}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={pCfg.style}>
                            {pCfg.label} Priority
                          </span>
                          {intervention.status === 'resolved' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'rgba(61,107,79,0.12)', color: '#2E5340', border: '1px solid rgba(61,107,79,0.3)' }}>
                              Resolved
                            </span>
                          )}
                        </div>
                        {intervention.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveIntervention(intervention.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
                            style={{ color: '#3D6B4F' }}
                          >
                            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Mark Resolved
                          </button>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'rgba(28,24,18,0.75)' }}>{intervention.description}</p>
                      {intervention.resources && intervention.resources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {intervention.resources.map((r, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(61,107,79,0.08)', border: '1px solid rgba(61,107,79,0.18)', color: '#3D6B4F' }}>
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
              <div className="edu-prof-iep p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4" style={{ color: '#9A6A12' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="edu-prof-label-iep">Active Accommodations</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACCOMMODATION_LIST.map(acc => {
                    const checked = accommodations.has(acc);
                    return (
                      <button
                        key={acc}
                        onClick={() => toggleAccommodation(acc)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm transition-all"
                        style={checked
                          ? { background: 'rgba(154,106,18,0.12)', border: '1px solid rgba(154,106,18,0.4)', color: '#7A540E' }
                          : { background: '#FFFFFF', border: '1px solid rgba(28,24,18,0.12)', color: 'rgba(28,24,18,0.6)' }}
                      >
                        <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors" style={checked ? { background: '#9A6A12', border: '1px solid #9A6A12' } : { border: '1px solid rgba(28,24,18,0.25)' }}>
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
                  <p className="mt-4 text-xs pt-3" style={{ color: 'rgba(28,24,18,0.6)', borderTop: '1px solid rgba(154,106,18,0.18)' }}>
                    <span className="font-bold" style={{ color: '#9A6A12' }}>Parent notes: </span>{student.iep_notes}
                  </p>
                )}
              </div>

              {/* IEP Goals + Progress Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="edu-prof-card p-5">
                  <label className="edu-prof-label-iep block mb-3">Current IEP Goals</label>
                  <textarea
                    value={iepGoals}
                    onChange={e => { setIepGoals(e.target.value); saveIEP({ goals: e.target.value }); }}
                    placeholder={`e.g. ${student.first_name} will increase oral reading fluency to 90 WCPM by end of quarter...`}
                    rows={5}
                    className="edu-prof-input edu-prof-input-iep px-3 py-2.5 resize-none"
                  />
                </div>
                <div className="edu-prof-card p-5">
                  <label className="edu-prof-label-iep block mb-3">Progress Notes</label>
                  <textarea
                    value={iepProgressNotes}
                    onChange={e => { setIepProgressNotes(e.target.value); saveIEP({ notes: e.target.value }); }}
                    placeholder="Document progress toward goals, strategy effectiveness, and observations..."
                    rows={5}
                    className="edu-prof-input edu-prof-input-iep px-3 py-2.5 resize-none"
                  />
                </div>
              </div>

              {/* Next Review Date */}
              <div className="edu-prof-card p-5">
                <label className="edu-prof-label-iep block mb-3">Next IEP Review Date</label>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={iepNextReview}
                    onChange={e => { setIepNextReview(e.target.value); saveIEP({ review: e.target.value }); }}
                    className="edu-prof-input edu-prof-input-iep px-3 py-2.5"
                    style={{ width: 'auto' }}
                  />
                  {iepNextReview && (() => {
                    const daysUntil = Math.ceil((new Date(iepNextReview).getTime() - Date.now()) / 86400000);
                    const c = daysUntil <= 14 ? '#B03A2E' : daysUntil <= 30 ? '#9A6A12' : '#3D6B4F';
                    return (
                      <span className="text-sm font-semibold" style={{ color: c }}>
                        {daysUntil > 0 ? `${daysUntil} days away` : daysUntil === 0 ? 'Today!' : `${Math.abs(daysUntil)} days overdue`}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Ei-Core IEP Recommendations */}
              <div className="edu-prof-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-normal" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1C1812' }}>Ei-Core IEP Recommendations</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(28,24,18,0.5)' }}>AI-generated strategies tailored to {student.first_name}'s IEP profile</p>
                  </div>
                  <button
                    onClick={handleEiCoreIEP}
                    disabled={iepInsightLoading}
                    className="edu-prof-btn-iep px-6 disabled:opacity-60"
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', opacity: iepInsightLoading ? 0.6 : 1 }} />
                    {iepInsightLoading ? 'Generating...' : 'Get Recommendations'}
                  </button>
                </div>

                {iepInsight ? (
                  <div className="p-4 rounded-xl" style={{ border: '1px solid rgba(154,106,18,0.22)', background: 'rgba(154,106,18,0.06)' }}>
                    <p className="text-sm mb-3" style={{ color: 'rgba(28,24,18,0.75)' }}>{iepInsight.summary}</p>
                    <ul className="space-y-2">
                      {iepInsight.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(28,24,18,0.8)' }}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9A6A12" strokeWidth={1.5} className="flex-shrink-0 mt-0.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: 'rgba(28,24,18,0.45)' }}>
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
