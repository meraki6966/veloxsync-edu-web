// src/pages/education/PacingGuide.tsx
// VeloxSync for Education — Daily Plan (V3 cream/green)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile, Classroom, Student } from '../../types/education';
import { GRADE_BAND_CONFIG } from '../../types/education';

interface PacingStandard {
  id: string;
  code: string;
  description: string;
  subject: string;
  mastery_pct?: number;
}

interface SupportStudent {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  reason: string;
  overall_progress: number;
}

interface PacingData {
  this_week: PacingStandard[];
  behind_schedule: PacingStandard[];
  ready_to_advance: PacingStandard[];
  students_needing_support: SupportStudent[];
  recommendations: string[];
}

// Category accent colors — left stripe + soft tint per section.
const CAT_GREEN = '#3D6B4F';   // This week's focus
const CAT_PEACH = '#B8794A';   // Behind schedule
const CAT_LAVENDER = '#6B4F8F'; // Ready to advance

// ── Mock fallback ─────────────────────────────────────────────────────────────

function buildMockPacing(classroom: Classroom, students: Student[]): PacingData {
  const gb = classroom.grade_band;
  const subj = classroom.subject ?? 'ELA';

  const thisWeek: PacingStandard[] = [
    { id: '1', code: `${gb}.${subj}.W1`, description: `Understand foundational concepts in ${subj} appropriate to ${gb} level`, subject: subj, mastery_pct: 58 },
    { id: '2', code: `${gb}.${subj}.W2`, description: `Apply grade-appropriate vocabulary and conventions in ${subj} tasks`, subject: subj, mastery_pct: 63 },
    { id: '3', code: `${gb}.${subj}.W3`, description: `Analyze and respond to ${subj} texts using evidence-based reasoning`, subject: subj, mastery_pct: 47 },
  ];
  const behind: PacingStandard[] = [
    { id: '4', code: `${gb}.${subj}.B1`, description: `Demonstrate understanding of core ${subj} principles through written expression`, subject: subj, mastery_pct: 29 },
    { id: '5', code: `${gb}.${subj}.B2`, description: `Connect ${subj} concepts to real-world applications and cross-curricular themes`, subject: subj, mastery_pct: 35 },
  ];
  const ready: PacingStandard[] = [
    { id: '6', code: `${gb}.${subj}.R1`, description: `Produce clear and coherent writing appropriate to task and audience`, subject: subj, mastery_pct: 88 },
    { id: '7', code: `${gb}.${subj}.R2`, description: `Demonstrate command of grammar conventions in writing and speaking`, subject: subj, mastery_pct: 91 },
  ];

  const atRisk = students
    .filter(s => s.overall_progress < 50)
    .slice(0, 5)
    .map(s => ({
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      grade_level: s.grade_level,
      overall_progress: s.overall_progress,
      reason: s.overall_progress < 30 ? 'Significantly below grade level — immediate support needed' : 'Below 50% mastery — targeted small-group instruction recommended',
    }));

  return {
    this_week: thisWeek,
    behind_schedule: behind,
    ready_to_advance: ready,
    students_needing_support: atRisk,
    recommendations: [
      `Focus Week's core skill for ${gb}: prioritize the three standards above before introducing new content`,
      `${behind.length} standards are behind pacing. Consider 15-minute daily spiral review to close gaps before end of unit`,
      `${ready.length} standards are mastered class-wide — these students are ready for enrichment or acceleration activities`,
      atRisk.length > 0 ? `${atRisk.length} student${atRisk.length > 1 ? 's' : ''} may benefit from Tier 2 small-group intervention this week` : 'All students are on pace — maintain current instruction cadence',
      `Upcoming: ensure all assessments are completed before end-of-unit review on Friday`,
    ],
  };
}

// ── V3 styles (cream/green) ─────────────────────────────────────────────────────

const PACING_CSS = `
.edu-pacing {
  display: flex; min-height: 100vh; background: #FAF7F2;
  background-image: radial-gradient(circle, rgba(28,24,18,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Open Sans', sans-serif; color: #1C1812;
}
.edu-pacing-main { flex: 1; overflow-y: auto; min-width: 0; }

@keyframes eduSpin { to { transform: rotate(360deg); } }

.edu-pacing-mobile-bar { display: none; }
@media (max-width: 767px) {
  .edu-pacing-mobile-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; border-bottom: 1px solid rgba(28,24,18,0.08);
    background: #FAF7F2;
  }
  .edu-pacing-mobile-bar button { background: none; border: none; color: #1C1812; padding: 0; cursor: pointer; }
  .edu-pacing-mobile-bar-title {
    font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 500; color: #1C1812;
  }
}

.edu-pacing-content { padding: 48px 56px; max-width: 1080px; margin: 0 auto; }
@media (max-width: 767px) { .edu-pacing-content { padding: 24px 18px; } }

/* Header */
.pacing-head {
  display: flex; flex-direction: column; gap: 18px;
  margin-bottom: 28px;
}
@media (min-width: 768px) {
  .pacing-head { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 24px; }
}
.pacing-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px; font-weight: 400; line-height: 1.1; color: #1C1812; margin: 0;
}
.pacing-title em { font-style: italic; color: #3D6B4F; }
.pacing-sub { font-size: 14px; color: rgba(28,24,18,0.5); margin-top: 8px; line-height: 1.55; }

.pacing-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pacing-select {
  background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1); border-radius: 100px;
  padding: 11px 18px; font-family: 'Open Sans', sans-serif; font-size: 13px; color: #1C1812;
  min-width: 200px; transition: border-color 0.2s;
}
.pacing-select:focus { outline: none; border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
.pacing-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 600;
  color: #FFFFFF; background: #3D6B4F; border: none; cursor: pointer;
  padding: 12px 24px; border-radius: 100px; transition: background 0.2s;
}
.pacing-btn:hover { background: #5A8F6A; }
.pacing-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Classroom context badge */
.pacing-context { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
.pacing-context-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
  color: #3D6B4F; background: #EBF2EC; border: 1px solid rgba(61,107,79,0.25);
  padding: 6px 14px; border-radius: 100px;
}
.pacing-context-meta { font-size: 12px; color: rgba(28,24,18,0.5); }

/* Section */
.pacing-section { margin-bottom: 32px; }
.pacing-section-label {
  display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.16em;
  text-transform: uppercase; color: #3D6B4F; margin-bottom: 14px;
}
.pacing-section-label .pacing-count { color: rgba(28,24,18,0.4); font-weight: 600; letter-spacing: 0.04em; }
.pacing-section-empty {
  background: #FFFFFF; border: 1px dashed rgba(28,24,18,0.15); border-radius: 16px;
  padding: 22px; text-align: center; font-size: 13px; color: rgba(28,24,18,0.5);
}

.pacing-blocks { display: flex; flex-direction: column; gap: 12px; }
.pacing-block {
  position: relative; background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1);
  border-radius: 16px; padding: 16px 20px 16px 28px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 14px rgba(28,24,18,0.04);
  transition: box-shadow 0.2s; overflow: hidden;
}
.pacing-block:hover { box-shadow: 0 8px 24px rgba(28,24,18,0.07); }
.pacing-block-stripe { position: absolute; top: 0; left: 0; bottom: 0; width: 6px; }
.pacing-block-icon {
  width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; color: #3D6B4F;
}
.pacing-block-text { flex: 1; min-width: 0; }
.pacing-block-title {
  font-size: 13px; font-weight: 700; color: #1C1812; margin: 0 0 3px;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.pacing-block-code {
  font-family: Verdana, Geneva, sans-serif; font-size: 10px; font-weight: 700;
  letter-spacing: 0.04em; color: #3D6B4F; background: #EBF2EC;
  border: 1px solid rgba(61,107,79,0.2); padding: 2px 8px; border-radius: 100px;
}
.pacing-block-subject { font-size: 11px; font-weight: 400; color: rgba(28,24,18,0.45); }
.pacing-block-desc { font-size: 12px; color: rgba(28,24,18,0.6); line-height: 1.55; margin: 0; }
.pacing-block-meta { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.pacing-pill {
  font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; white-space: nowrap;
}
.pacing-pill-high { color: #2F6B45; background: #E3F0E6; }
.pacing-pill-mid  { color: #8A6320; background: #F8EEDC; }
.pacing-pill-low  { color: #A8413D; background: #F6E2E1; }
.pacing-check {
  width: 24px; height: 24px; border-radius: 50%;
  border: 1.5px solid rgba(28,24,18,0.18); background: #FFFFFF; cursor: pointer;
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, border-color 0.2s; padding: 0;
}
.pacing-check:hover { border-color: #3D6B4F; }
.pacing-check.is-done { background: #3D6B4F; border-color: #3D6B4F; }
.pacing-check svg { color: #FFFFFF; opacity: 0; transition: opacity 0.2s; width: 14px; height: 14px; }
.pacing-check.is-done svg { opacity: 1; }

/* Support list */
.pacing-card {
  background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1); border-radius: 16px;
  padding: 24px 26px; margin-bottom: 24px; box-shadow: 0 2px 14px rgba(28,24,18,0.04);
}
.pacing-support-row { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-top: 1px solid rgba(28,24,18,0.07); }
.pacing-support-row:first-of-type { border-top: none; }
.pacing-support-avatar {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #8A6320; background: #F8EEDC; border: 1px solid rgba(184,121,74,0.3);
}
.pacing-support-info { flex: 1; min-width: 0; }
.pacing-support-name { font-size: 14px; font-weight: 600; color: #1C1812; }
.pacing-support-reason { font-size: 12px; color: rgba(28,24,18,0.55); margin-top: 2px; }
.pacing-support-pct { text-align: right; flex-shrink: 0; }
.pacing-support-pct-val { font-size: 16px; font-weight: 700; color: #A8413D; }
.pacing-support-pct-label { font-size: 10px; color: rgba(28,24,18,0.45); text-transform: uppercase; letter-spacing: 0.08em; }

/* Recommendations */
.pacing-recs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.pacing-rec { display: flex; align-items: flex-start; gap: 12px; font-size: 13px; color: rgba(28,24,18,0.75); line-height: 1.6; }
.pacing-rec-num {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #3D6B4F; background: #EBF2EC; border: 1px solid rgba(61,107,79,0.2);
}

/* Empty state */
.pacing-empty {
  background: #FFFFFF; border: 1px dashed rgba(28,24,18,0.15); border-radius: 16px;
  padding: 72px 24px; text-align: center;
}
.pacing-empty-icon { color: #3D6B4F; margin: 0 auto 16px; display: block; }
.pacing-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 400; color: #1C1812; margin: 0 0 8px; }
.pacing-empty-sub { font-size: 13px; color: rgba(28,24,18,0.55); line-height: 1.6; margin: 0; }
`;

let pacingStylesInjected = false;
function ensurePacingStyles() {
  if (pacingStylesInjected) return;
  if (typeof document === 'undefined') return;
  if (document.head.querySelector('style[data-edu-pacing]')) {
    pacingStylesInjected = true;
    return;
  }
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-edu-pacing', 'true');
  styleEl.textContent = PACING_CSS;
  document.head.appendChild(styleEl);
  pacingStylesInjected = true;
}

// ── Subject icon (matches dashboard lesson-block pattern) ───────────────────────

function subjectIcon(subject: string) {
  const s = subject.toLowerCase();
  const common = { width: 18, height: 18, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.7 } as const;
  if (s.includes('math')) {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path strokeLinecap="round" d="M7 7h10M8 11h2m3 0h3M8 14h2m3 0h3M8 17h2m3 0h3" />
      </svg>
    );
  }
  if (s.includes('read') || s.includes('ela') || s.includes('english')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5C10 4.5 7 4 4 4.5v14c3-.5 6 0 8 2 2-2 5-2.5 8-2v-14c-3-.5-6 0-8 2zM12 6.5v14" />
      </svg>
    );
  }
  if (s.includes('science') || s.includes('nature')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 3v6.5L4 19a2 2 0 001.7 3h12.6a2 2 0 001.7-3L14 9.5V3M9 3h6" />
      </svg>
    );
  }
  if (s.includes('cod') || s.includes('python')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8l-5 4 5 4M15 8l5 4-5 4M14 6l-4 12" />
      </svg>
    );
  }
  if (s.includes('writ')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5z" />
      </svg>
    );
  }
  if (s.includes('history') || s.includes('social')) {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
      </svg>
    );
  }
  // default: notebook
  return (
    <svg {...common}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h11l3 3v13H5z" />
      <path strokeLinecap="round" d="M9 9h6M9 13h6M9 17h4" />
    </svg>
  );
}

function masteryPillClass(pct?: number) {
  if (pct === undefined) return 'pacing-pill-mid';
  if (pct >= 80) return 'pacing-pill-high';
  if (pct >= 50) return 'pacing-pill-mid';
  return 'pacing-pill-low';
}

// ── Section of standards rendered as lesson-style blocks ────────────────────────

function PacingSection({
  label, color, standards, emptyMsg, completed, onToggle,
}: {
  label: string;
  color: string;
  standards: PacingStandard[];
  emptyMsg: string;
  completed: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <section className="pacing-section">
      <span className="pacing-section-label">
        {label} <span className="pacing-count">· {standards.length} standard{standards.length !== 1 ? 's' : ''}</span>
      </span>
      {standards.length === 0 ? (
        <div className="pacing-section-empty">{emptyMsg}</div>
      ) : (
        <div className="pacing-blocks">
          {standards.map(s => {
            const done = !!completed[s.id];
            return (
              <div key={s.id} className="pacing-block" style={{ background: `${color}12` }}>
                <span className="pacing-block-stripe" style={{ background: color }} />
                <span className="pacing-block-icon" style={{ background: `${color}26`, color }}>
                  {subjectIcon(s.subject)}
                </span>
                <div className="pacing-block-text">
                  <p className="pacing-block-title">
                    <span className="pacing-block-code">{s.code}</span>
                    <span className="pacing-block-subject">{s.subject}</span>
                  </p>
                  <p className="pacing-block-desc">{s.description}</p>
                </div>
                <div className="pacing-block-meta">
                  {s.mastery_pct !== undefined && (
                    <span className={`pacing-pill ${masteryPillClass(s.mastery_pct)}`}>{s.mastery_pct}%</span>
                  )}
                  <button
                    type="button"
                    className={`pacing-check${done ? ' is-done' : ''}`}
                    onClick={() => onToggle(s.id)}
                    aria-pressed={done}
                    aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PacingGuide() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [pacing, setPacing] = useState<PacingData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => { ensurePacingStyles(); }, []);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
    loadInit();
  }, []);

  const loadInit = async () => {
    try {
      const [clRes, stRes] = await Promise.allSettled([edu.listClassrooms(), edu.listStudents()]);
      if (clRes.status === 'fulfilled') {
        const clData = clRes.value.data;
        const cls: Classroom[] = Array.isArray(clData) ? clData : (Array.isArray(clData?.classrooms) ? clData.classrooms : []);
        setClassrooms(cls);
        if (cls.length > 0) setSelectedId(cls[0].id);
      }
      if (stRes.status === 'fulfilled') { const sd = stRes.value.data; setStudents(Array.isArray(sd) ? sd : (Array.isArray(sd?.students) ? sd.students : [])); }
    } catch { /* silent */ }
  };

  const handleGenerate = async () => {
    if (!selectedId) return;
    setGenerating(true);
    setCompleted({});
    try {
      const res = await edu.getPacingGuide(selectedId);
      setPacing(res.data);
    } catch {
      const classroom = classrooms.find(c => c.id === selectedId);
      if (classroom) setPacing(buildMockPacing(classroom, students));
    } finally {
      setGenerating(false);
    }
  };

  const toggleComplete = (id: string) => setCompleted(prev => ({ ...prev, [id]: !prev[id] }));

  const classroom = classrooms.find(c => c.id === selectedId);
  const gbCfg = classroom ? GRADE_BAND_CONFIG[classroom.grade_band as keyof typeof GRADE_BAND_CONFIG] : null;
  const safeSupport = pacing ? (Array.isArray(pacing.students_needing_support) ? pacing.students_needing_support : []) : [];
  const safeRecs = pacing ? (Array.isArray(pacing.recommendations) ? pacing.recommendations : []) : [];

  return (
    <div className="edu-pacing">
      <EducationSidebar user={user} eduProfile={eduProfile} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="edu-pacing-main">
        <div className="edu-pacing-mobile-bar">
          <button onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="edu-pacing-mobile-bar-title">Daily Plan</span>
        </div>

        <div className="edu-pacing-content">
          {/* Header */}
          <div className="pacing-head">
            <div>
              <h1 className="pacing-title">Daily <em>Plan</em></h1>
              <p className="pacing-sub">Your family's learning schedule</p>
            </div>

            <div className="pacing-controls">
              <select
                className="pacing-select"
                value={selectedId}
                onChange={e => { setSelectedId(e.target.value); setPacing(null); setCompleted({}); }}
              >
                <option value="">Select a learner group…</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button className="pacing-btn" onClick={handleGenerate} disabled={!selectedId || generating}>
                {generating ? (
                  <svg width="16" height="16" className="pacing-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: 'eduSpin 0.8s linear infinite' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                Generate Daily Plan
              </button>
            </div>
          </div>

          {/* Classroom context badge */}
          {classroom && gbCfg && (
            <div className="pacing-context">
              <span className="pacing-context-badge">{gbCfg.icon} {classroom.name} · {gbCfg.label}</span>
              <span className="pacing-context-meta">{students.length} learners loaded</span>
            </div>
          )}

          {/* Empty state */}
          {!pacing && !generating && (
            <div className="pacing-empty">
              <svg className="pacing-empty-icon" width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="pacing-empty-title">Build today's plan.</h2>
              <p className="pacing-empty-sub">Select a learner group and Ei-Core will build a focused daily plan from your family's pacing.</p>
            </div>
          )}

          {/* Pacing data */}
          {pacing && (
            <>
              <PacingSection
                label="This Week's Focus"
                color={CAT_GREEN}
                standards={pacing.this_week}
                emptyMsg="No standards assigned for this week"
                completed={completed}
                onToggle={toggleComplete}
              />
              <PacingSection
                label="Behind Schedule"
                color={CAT_PEACH}
                standards={pacing.behind_schedule}
                emptyMsg="Great — no standards are behind schedule"
                completed={completed}
                onToggle={toggleComplete}
              />
              <PacingSection
                label="Ready to Advance"
                color={CAT_LAVENDER}
                standards={pacing.ready_to_advance}
                emptyMsg="No standards have reached mastery yet"
                completed={completed}
                onToggle={toggleComplete}
              />

              {/* Learners needing support */}
              {safeSupport.length > 0 && (
                <div className="pacing-card">
                  <span className="pacing-section-label">Learners Needing Extra Support This Week</span>
                  {safeSupport.map(s => (
                    <div key={s.id} className="pacing-support-row">
                      <div className="pacing-support-avatar">{s.first_name[0]}{s.last_name[0]}</div>
                      <div className="pacing-support-info">
                        <p className="pacing-support-name">{s.first_name} {s.last_name}</p>
                        <p className="pacing-support-reason">{s.reason}</p>
                      </div>
                      <div className="pacing-support-pct">
                        <div className="pacing-support-pct-val">{s.overall_progress}%</div>
                        <div className="pacing-support-pct-label">progress</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ei-Core recommendations */}
              {safeRecs.length > 0 && (
                <div className="pacing-card">
                  <span className="pacing-section-label">Ei-Core Pacing Recommendations</span>
                  <ul className="pacing-recs">
                    {safeRecs.map((rec, i) => (
                      <li key={i} className="pacing-rec">
                        <span className="pacing-rec-num">{i + 1}</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
