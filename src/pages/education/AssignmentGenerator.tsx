// src/pages/education/AssignmentGenerator.tsx
// VeloxSync for Education — Standalone Assignment Generator Page

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile } from '../../types/education';
import { US_STATES } from '../../types/education';
import AssignmentModal from '../../components/AssignmentModal';

// Re-export the two-panel layout as a full page instead of a modal overlay.
// We embed the same AssignmentModal but immediately open it anchored inside
// the page layout. For a cleaner full-page experience we inline the panels
// directly here so they fill the main content area rather than a popup.

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

export default function AssignmentGenerator() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Modal is always "open" on this page — it's embedded as a full-page layout
  // We use the AssignmentModal in a lightweight wrapper mode
  const [showModal, setShowModal] = useState(false);

  // Pre-fill from eduProfile
  const [prefillGrade, setPrefillGrade] = useState('5');
  const [prefillState, setPrefillState] = useState('');
  const [prefillSubject, setPrefillSubject] = useState('');
  const [prefillLearningStyle, setPrefillLearningStyle] = useState('mixed');

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) {
      const prof = JSON.parse(raw) as EduProfile;
      setEduProfile(prof);
      if (prof.state) setPrefillState(prof.state);
    }
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/login'));
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-black">Assignment Generator</span>
        </div>

        {/* Page Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📝</span>
                <h1 className="text-xl font-black text-white">AI Assignment Generator</h1>
                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/20 uppercase tracking-wider">Ei-Core</span>
              </div>
              <p className="text-sm text-slate-400">
                Tell Ei-Core the grade, subject, state, and learning style. Get a complete, printable, standards-aligned assignment in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Quick-Start area — pre-fill from profile then open the modal */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">

            {/* Quick Setup */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-black text-white mb-4">Quick Setup</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Grade</label>
                  <select
                    value={prefillGrade}
                    onChange={e => setPrefillGrade(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                  <select
                    value={prefillState}
                    onChange={e => setPrefillState(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Any state</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                  <select
                    value={prefillSubject}
                    onChange={e => setPrefillSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Learning Style</label>
                  <select
                    value={prefillLearningStyle}
                    onChange={e => setPrefillLearningStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {LEARNING_STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm transition-colors"
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
                { emoji: '🎯', title: 'Standards-Aligned', desc: 'Every assignment maps to your state framework — TEKS, Common Core, Florida B.E.S.T., and 40+ more.' },
                { emoji: '🎨', title: 'Differentiation Built In', desc: 'Visual, auditory, and kinesthetic variations generated automatically for every learner profile.' },
                { emoji: '🖨️', title: 'Print-Ready Instantly', desc: 'Download as PDF or copy to clipboard. Every assignment is ready to use the moment it\'s generated.' },
              ].map(f => (
                <div key={f.title} className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4">
                  <div className="text-2xl mb-2">{f.emoji}</div>
                  <p className="text-sm font-black text-white mb-1">{f.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* What gets generated */}
            <div className="mt-6 bg-slate-800/30 border border-slate-700/40 rounded-xl p-5">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Every assignment includes</p>
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
                  '📝 Teacher notes',
                  '🔗 Bridge to next lesson',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-teal-400">✓</span>
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
