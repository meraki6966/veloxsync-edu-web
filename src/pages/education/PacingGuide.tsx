// src/pages/education/PacingGuide.tsx
// VeloxSync for Education — Daily Plan (V3 cream/green, homeschool children)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile, HomeschoolChild } from '../../types/education';

// A single lesson block in a child's daily plan.
interface Lesson {
  id: string;
  subject: string;
  title: string;
  desc: string;
  duration: number;
}

// A generated daily plan for one child.
interface DayPlan {
  childId: string;
  childName: string;
  gradeLabel: string;
  curriculum?: string;
  hasIep: boolean;
  lessons: Lesson[];
}

// Rotating accent colors — one per lesson block (stripe + soft tint).
const LESSON_COLORS = ['#3D6B4F', '#6B4F8F', '#B8794A', '#2A7F7F'];

// ── Grade helpers ───────────────────────────────────────────────────────────────

type GradeBand = 'K-2' | '3-5' | '6-8' | '9-12';

function gradeBand(grade: string): GradeBand {
  if (grade === 'K' || grade === '1' || grade === '2') return 'K-2';
  if (grade === '3' || grade === '4' || grade === '5') return '3-5';
  if (grade === '6' || grade === '7' || grade === '8') return '6-8';
  return '9-12';
}

function gradeLabel(grade: string): string {
  return grade === 'K' ? 'Kindergarten' : `Grade ${grade}`;
}

// ── Mock daily plan ─────────────────────────────────────────────────────────────
// Age-appropriate lesson templates by grade band. Real plans come from Ei-Core
// in a later phase; these let the Generate button work immediately.

type LessonTemplate = Omit<Lesson, 'id'>;

const LESSON_TEMPLATES: Record<GradeBand, LessonTemplate[]> = {
  'K-2': [
    { subject: 'Math', title: 'Counting & Number Sense', desc: 'Count, compare, and build numbers with hands-on manipulatives.', duration: 20 },
    { subject: 'Reading', title: 'Phonics & Read-Aloud', desc: 'Sound out words, then read a short story together.', duration: 20 },
    { subject: 'Science', title: 'Science Exploration', desc: 'A guided nature walk or sensory activity — observe and wonder.', duration: 15 },
  ],
  '3-5': [
    { subject: 'Math', title: 'Multiplication & Fractions', desc: 'Practice problems with visual models and a quick game.', duration: 25 },
    { subject: 'Reading', title: 'Reading Comprehension', desc: 'Read a passage and answer questions about the main idea.', duration: 20 },
    { subject: 'Science', title: 'Hands-On Science', desc: 'Run a simple experiment and record what happens.', duration: 25 },
    { subject: 'Writing', title: 'Writing Workshop', desc: 'Draft a short paragraph with a clear topic sentence.', duration: 20 },
  ],
  '6-8': [
    { subject: 'Math', title: 'Pre-Algebra', desc: 'Equations, ratios, and step-by-step problem solving.', duration: 30 },
    { subject: 'Literature', title: 'Literature & Analysis', desc: 'Read a chapter, then discuss theme and character.', duration: 25 },
    { subject: 'Science', title: 'Life & Physical Science', desc: 'Investigate a concept with a guided lab activity.', duration: 25 },
    { subject: 'Coding', title: 'Python Basics', desc: 'Variables, loops, and a small build project.', duration: 30 },
  ],
  '9-12': [
    { subject: 'Advanced Math', title: 'Algebra II / Pre-Calculus', desc: 'Functions, graphing, and applied problem sets.', duration: 35 },
    { subject: 'Literature', title: 'Literature & Composition', desc: 'Close-read a text and outline an analytical essay.', duration: 30 },
    { subject: 'Science', title: 'Biology / Chemistry', desc: 'Work through a lab with written analysis.', duration: 30 },
    { subject: 'Coding', title: 'React & Python', desc: 'Build a component and a small script — portfolio work.', duration: 40 },
  ],
};

function buildLessonsForChild(child: HomeschoolChild): Lesson[] {
  const templates = LESSON_TEMPLATES[gradeBand(child.grade_level)];
  return templates.map((t, i) => ({ ...t, id: `${child.id}-${i}` }));
}

// Forward-compatible mapping for when the real Ei-Core endpoint returns lessons.
// Returns null when the response has no usable lesson data, so we fall back to mock.
function coerceLessons(data: unknown, childId: string): Lesson[] | null {
  const obj = data as { lessons?: unknown } | unknown[] | null;
  const raw = Array.isArray(obj) ? obj : (Array.isArray((obj as { lessons?: unknown })?.lessons) ? (obj as { lessons: unknown[] }).lessons : null);
  if (!raw || raw.length === 0) return null;
  const lessons = raw
    .map((item, i): Lesson | null => {
      const l = item as Record<string, unknown>;
      if (!l || (l.subject == null && l.title == null && l.name == null)) return null;
      return {
        id: `${childId}-real-${(l.id as string | number) ?? i}`,
        subject: String(l.subject ?? 'Lesson'),
        title: String(l.title ?? l.name ?? 'Lesson'),
        desc: String(l.desc ?? l.description ?? ''),
        duration: Number(l.duration ?? l.minutes ?? 25) || 25,
      };
    })
    .filter((l): l is Lesson => l !== null);
  return lessons.length ? lessons : null;
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
  font-size: 36px; font-weight: 400; font-style: normal; line-height: 1.1; color: #1C1812; margin: 0;
}
.pacing-title em { font-style: normal; color: #1C1812; }
.pacing-sub { font-size: 14px; color: rgba(28,24,18,0.8); margin-top: 8px; line-height: 1.55; }

.pacing-controls { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.pacing-field { display: flex; flex-direction: column; gap: 6px; }
.pacing-field-label {
  font-family: 'Open Sans', sans-serif; font-size: 12px; font-weight: 600;
  text-transform: uppercase; color: #3D6B4F; letter-spacing: 0.1em;
}
.pacing-select {
  background: #FFFFFF; border: 1px solid rgba(28,24,18,0.15); border-radius: 8px;
  padding: 11px 16px; font-family: 'Open Sans', sans-serif; font-size: 14px; color: #1C1812;
  min-width: 220px; min-height: 44px; transition: border-color 0.2s;
}
.pacing-select:focus { outline: none; border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
.pacing-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 600;
  color: #FFFFFF; background: #3D6B4F; border: none; cursor: pointer;
  padding: 0 24px; min-height: 44px; border-radius: 8px; transition: background-color 0.2s;
}
.pacing-btn:hover { background: #2D5A3F; }
.pacing-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Child context badge */
.pacing-context { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
.pacing-context-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
  color: #3D6B4F; background: #EBF2EC; border: 1px solid rgba(61,107,79,0.25);
  padding: 6px 14px; border-radius: 100px;
}
.pacing-context-meta { font-size: 13px; color: rgba(28,24,18,0.8); }

/* Section */
.pacing-section { margin-bottom: 32px; }
.pacing-section-label {
  display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.16em;
  text-transform: uppercase; color: #3D6B4F; margin-bottom: 14px;
}
.pacing-section-label .pacing-count { color: rgba(28,24,18,0.4); font-weight: 600; letter-spacing: 0.04em; }

.pacing-blocks { display: flex; flex-direction: column; gap: 12px; }
.pacing-block {
  position: relative; background: #FFFFFF; border: 1px solid rgba(28,24,18,0.08);
  border-radius: 12px; padding: 16px 20px 16px 28px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s; overflow: hidden;
}
.pacing-block:hover { box-shadow: 0 4px 12px rgba(28,24,18,0.06); }
.pacing-block-stripe { position: absolute; top: 0; left: 0; bottom: 0; width: 4px; }
.pacing-block-icon {
  width: 28px; height: 28px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; color: #3D6B4F;
}
.pacing-block-text { flex: 1; min-width: 0; }
.pacing-block-title {
  font-size: 14px; font-weight: 600; color: #1C1812; margin: 0 0 3px;
}
.pacing-block-desc { font-size: 12px; color: rgba(28,24,18,0.6); line-height: 1.55; margin: 0; }
.pacing-block-meta { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.pacing-pill {
  font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; white-space: nowrap;
}
.pacing-pill-duration { color: rgba(28,24,18,0.8); background: rgba(28,24,18,0.05); }
.pacing-pill-focus { color: #6B4F8F; background: #EDE6F6; }
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

/* Empty state */
.pacing-empty {
  background: #FFFFFF; border: 1px dashed rgba(28,24,18,0.15); border-radius: 12px;
  padding: 72px 24px; text-align: center;
}
.pacing-empty-icon { color: #3D6B4F; margin: 0 auto 16px; display: block; }
.pacing-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 400; font-style: normal; color: #1C1812; margin: 0 0 8px; }
.pacing-empty-sub { font-size: 14px; color: rgba(28,24,18,0.8); line-height: 1.6; margin: 0; }
.pacing-empty-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px;
  font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 600; color: #FFFFFF;
  background: #3D6B4F; border: none; cursor: pointer; padding: 0 24px; min-height: 44px; border-radius: 8px;
  transition: background-color 0.2s;
}
.pacing-empty-btn:hover { background: #2D5A3F; }
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
  const common = { width: 20, height: 20, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.5 } as const;
  if (s.includes('math')) {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path strokeLinecap="round" d="M7 7h10M8 11h2m3 0h3M8 14h2m3 0h3M8 17h2m3 0h3" />
      </svg>
    );
  }
  if (s.includes('read') || s.includes('ela') || s.includes('english') || s.includes('liter')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5C10 4.5 7 4 4 4.5v14c3-.5 6 0 8 2 2-2 5-2.5 8-2v-14c-3-.5-6 0-8 2zM12 6.5v14" />
      </svg>
    );
  }
  if (s.includes('science') || s.includes('nature') || s.includes('biology') || s.includes('chem')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 3v6.5L4 19a2 2 0 001.7 3h12.6a2 2 0 001.7-3L14 9.5V3M9 3h6" />
      </svg>
    );
  }
  if (s.includes('cod') || s.includes('python') || s.includes('react')) {
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PacingGuide() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [children, setChildren] = useState<HomeschoolChild[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => { ensurePacingStyles(); }, []);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const res = await edu.listHomeschoolChildren();
      const d = res.data;
      const list: HomeschoolChild[] = Array.isArray(d) ? d : (Array.isArray(d?.children) ? d.children : []);
      setChildren(list);
      if (list.length > 0) setSelectedId(list[0].id);
    } catch {
      setChildren([]);
    }
  };

  const handleGenerate = async () => {
    const child = children.find(c => c.id === selectedId);
    if (!child) return;
    setGenerating(true);
    setCompleted({});

    let lessons: Lesson[] | null = null;
    try {
      // Best-effort real call — when Ei-Core lands it will return lesson data.
      const res = await edu.getPacingGuide(child.id);
      lessons = coerceLessons(res.data, child.id);
    } catch {
      lessons = null;
    }
    if (!lessons) lessons = buildLessonsForChild(child);

    setPlan({
      childId: child.id,
      childName: child.first_name,
      gradeLabel: gradeLabel(child.grade_level),
      curriculum: child.curriculum_type,
      hasIep: child.has_iep,
      lessons,
    });
    setGenerating(false);
  };

  const toggleComplete = (id: string) => setCompleted(prev => ({ ...prev, [id]: !prev[id] }));

  const selectedChild = children.find(c => c.id === selectedId) || null;

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
              <h1 className="pacing-title">Daily Plan</h1>
              <p className="pacing-sub">Your family's learning schedule</p>
            </div>

            <div className="pacing-controls">
              <div className="pacing-field">
                <label className="pacing-field-label" htmlFor="pacing-child-select">Child</label>
                <select
                  id="pacing-child-select"
                  className="pacing-select"
                  value={selectedId}
                  onChange={e => { setSelectedId(e.target.value); setPlan(null); setCompleted({}); }}
                  disabled={children.length === 0}
                >
                  <option value="">Select a child…</option>
                  {children.map(c => (
                    <option key={c.id} value={c.id}>{`${c.first_name} ${c.last_name}`.trim()}</option>
                  ))}
                </select>
              </div>
              <button className="pacing-btn" onClick={handleGenerate} disabled={!selectedId || generating}>
                {generating ? (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: 'eduSpin 0.8s linear infinite' }}>
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

          {/* Selected child context badge */}
          {selectedChild && (
            <div className="pacing-context">
              <span className="pacing-context-badge">{selectedChild.first_name} · {gradeLabel(selectedChild.grade_level)}</span>
              <span className="pacing-context-meta">{selectedChild.curriculum_type} approach</span>
            </div>
          )}

          {/* Empty states */}
          {!plan && !generating && (
            children.length === 0 ? (
              <div className="pacing-empty">
                <svg className="pacing-empty-icon" width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h2 className="pacing-empty-title">No children yet.</h2>
                <p className="pacing-empty-sub">Add your first child from your dashboard, then come back to build their daily plan.</p>
                <button className="pacing-empty-btn" onClick={() => navigate('/education/dashboard')}>
                  Go to dashboard
                </button>
              </div>
            ) : (
              <div className="pacing-empty">
                <svg className="pacing-empty-icon" width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="pacing-empty-title">Build today's plan.</h2>
                <p className="pacing-empty-sub">Select a child and Ei-Core will build a focused daily plan tailored to their grade level.</p>
              </div>
            )
          )}

          {/* Generated daily plan */}
          {plan && (
            <section className="pacing-section">
              <span className="pacing-section-label">
                Today's Plan · {plan.childName}
                <span className="pacing-count"> · {plan.lessons.length} lesson{plan.lessons.length !== 1 ? 's' : ''}</span>
              </span>
              <div className="pacing-blocks">
                {plan.lessons.map((lesson, i) => {
                  const color = LESSON_COLORS[i % LESSON_COLORS.length];
                  const done = !!completed[lesson.id];
                  return (
                    <div key={lesson.id} className="pacing-block">
                      <span className="pacing-block-stripe" style={{ background: color }} />
                      <span className="pacing-block-icon" style={{ color }}>
                        {subjectIcon(lesson.subject)}
                      </span>
                      <div className="pacing-block-text">
                        <p className="pacing-block-title">{lesson.subject} — {lesson.title}</p>
                        <p className="pacing-block-desc">{lesson.desc}</p>
                      </div>
                      <div className="pacing-block-meta">
                        {plan.hasIep && (
                          <span className="pacing-pill pacing-pill-focus">Focus Mode</span>
                        )}
                        <span className="pacing-pill pacing-pill-duration">{lesson.duration} min</span>
                        <button
                          type="button"
                          className={`pacing-check${done ? ' is-done' : ''}`}
                          onClick={() => toggleComplete(lesson.id)}
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
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
