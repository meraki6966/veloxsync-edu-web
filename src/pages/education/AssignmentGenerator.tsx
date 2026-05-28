// src/pages/education/AssignmentGenerator.tsx
// VeloxSync for Education — Standalone Assignment Generator Page (V3 homeschool)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile } from '../../types/education';
import { US_STATES } from '../../types/education';
import AssignmentModal from '../../components/AssignmentModal';

// ── Constants (mirrors AssignmentModal) ────────────────────────────────────
const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const LEARNING_STYLE_OPTIONS = [
  { value: 'visual', label: 'Visual' },
  { value: 'auditory', label: 'Auditory' },
  { value: 'kinesthetic', label: 'Kinesthetic' },
  { value: 'reading_writing', label: 'Reading/Writing' },
  { value: 'mixed', label: 'Mixed / Universal Design' },
];
const SUBJECTS = ['Math', 'ELA', 'Science', 'Social Studies', 'Writing', 'Reading', 'Arts', 'STEM', 'Foreign Language'];

const GEN_CSS = `
.edu-gen { display: flex; height: 100vh; overflow: hidden; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; }
.edu-gen-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; }
.edu-gen-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; line-height: 1.1; color: #1C1812; }
.edu-gen-card { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1); border-radius: 16px; box-shadow: 0 2px 16px rgba(28,24,18,0.05); }
.edu-gen-soft { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.08); border-radius: 16px; }
.edu-gen-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; }
.edu-gen-input { width: 100%; background: #FFFFFF; border: 1px solid rgba(28,24,18,0.15); border-radius: 12px; padding: 10px 12px; color: #1C1812; font-size: 14px; }
.edu-gen-input:focus { outline: none; border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
.edu-gen-btn { background: #3D6B4F; color: #fff; border-radius: 9999px; font-weight: 600; }
.edu-gen-btn:hover { opacity: 0.92; }
`;

export default function AssignmentGenerator() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);

  // Pre-fill from eduProfile
  const [prefillGrade, setPrefillGrade] = useState('5');
  const [prefillState, setPrefillState] = useState('');
  const [prefillSubject, setPrefillSubject] = useState('');
  const [prefillLearningStyle, setPrefillLearningStyle] = useState('mixed');

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-gen', 'true');
    styleEl.textContent = GEN_CSS;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) {
      const prof = JSON.parse(raw) as EduProfile;
      setEduProfile(prof);
      if (prof.state) setPrefillState(prof.state);
    }
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
  }, []);

  return (
    <div className="edu-gen">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(28,24,18,0.1)' }}>
          <button onClick={() => setMobileOpen(true)} style={{ color: 'rgba(28,24,18,0.6)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold" style={{ color: '#1C1812' }}>Assignment Generator</span>
        </div>

        {/* Page Header */}
        <div className="px-8 py-7 flex-shrink-0" style={{ borderBottom: '1px solid rgba(28,24,18,0.08)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="edu-gen-eyebrow">EI-CORE</span>
          </div>
          <h1 className="edu-gen-title mb-2">Build an assignment for your child</h1>
          <p className="text-sm" style={{ color: 'rgba(28,24,18,0.6)', maxWidth: 620, lineHeight: 1.65 }}>
            Tell Ei-Core the grade, subject, state, and learning style. Get a complete, printable, standards-aligned assignment in seconds.
          </p>
        </div>

        {/* Quick-Start area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl mx-auto">

            {/* Quick Setup */}
            <div className="edu-gen-card p-6 mb-6">
              <h2 className="text-base font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#1C1812' }}>Quick Setup</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="edu-gen-label block mb-1.5">Grade</label>
                  <select value={prefillGrade} onChange={e => setPrefillGrade(e.target.value)} className="edu-gen-input">
                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="edu-gen-label block mb-1.5">State</label>
                  <select value={prefillState} onChange={e => setPrefillState(e.target.value)} className="edu-gen-input">
                    <option value="">Any state</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="edu-gen-label block mb-1.5">Subject</label>
                  <select value={prefillSubject} onChange={e => setPrefillSubject(e.target.value)} className="edu-gen-input">
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="edu-gen-label block mb-1.5">Learning Style</label>
                  <select value={prefillLearningStyle} onChange={e => setPrefillLearningStyle(e.target.value)} className="edu-gen-input">
                    {LEARNING_STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="edu-gen-btn w-full flex items-center justify-center gap-2 py-3 text-sm transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Open Assignment Builder
              </button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { emoji: '🎯', title: 'Standards-Aligned', desc: 'Every assignment maps to your state standards so your child stays on track wherever you live.' },
                { emoji: '🎨', title: 'Differentiation Built In', desc: 'Visual, auditory, and kinesthetic variations generated automatically for how your child learns best.' },
                { emoji: '🖨️', title: 'Print-Ready Instantly', desc: 'Download as PDF or copy to clipboard. Every assignment is ready to use the moment it\'s generated.' },
              ].map(f => (
                <div key={f.title} className="edu-gen-soft p-4">
                  <div className="text-2xl mb-2">{f.emoji}</div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#1C1812' }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(28,24,18,0.6)' }}>{f.desc}</p>
                </div>
              ))}
            </div>

            {/* What gets generated */}
            <div className="edu-gen-soft p-5 mt-6">
              <p className="edu-gen-label mb-3">Every assignment includes</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  '📌 Standard code + I Can statement',
                  '⏱ Estimated duration',
                  '📦 Materials list',
                  '🃏 Activity sections (cards, compare, sort)',
                  '💬 Discussion question',
                  '✍️ Narration / reflection prompt',
                  '👁 Visual differentiation options',
                  '👂 Auditory differentiation options',
                  '✋ Kinesthetic differentiation options',
                  '📊 Four-tier rubric (Distinguished → Novice)',
                  '📝 Parent notes',
                  '🔗 Bridge to next lesson',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(28,24,18,0.75)' }}>
                    <span style={{ color: '#3D6B4F' }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* The Assignment Generator Modal */}
      <AssignmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        prefill={{
          gradeLevel: prefillGrade,
          state: prefillState,
          subject: prefillSubject,
          learningStyle: prefillLearningStyle,
        }}
      />
    </div>
  );
}
