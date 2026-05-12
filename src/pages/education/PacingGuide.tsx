// src/pages/education/PacingGuide.tsx
// VeloxSync for Education — Pacing Guide

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

// ── Column card ───────────────────────────────────────────────────────────────

function PacingColumn({
  title, icon, color, standards, emptyMsg,
}: {
  title: string;
  icon: string;
  color: string;
  standards: PacingStandard[];
  emptyMsg: string;
}) {
  return (
    <div className="flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className={`px-5 py-4 border-b border-slate-700/50 flex items-center gap-3`}>
        <span className="text-xl">{icon}</span>
        <div>
          <h3 className="text-sm font-black text-white">{title}</h3>
          <p className={`text-xs font-bold ${color}`}>{standards.length} standard{standards.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2.5 min-h-[160px]">
        {standards.length === 0 ? (
          <p className="text-xs text-slate-600 text-center pt-6">{emptyMsg}</p>
        ) : standards.map(s => (
          <div key={s.id} className="p-3 rounded-xl border border-slate-700/40 bg-slate-900/40">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                {s.code}
              </span>
              <span className="text-[10px] text-slate-500">{s.subject}</span>
              {s.mastery_pct !== undefined && (
                <span className={`ml-auto text-[10px] font-black ${s.mastery_pct >= 80 ? 'text-emerald-400' : s.mastery_pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {s.mastery_pct}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
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

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/login'));
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

  const classroom = classrooms.find(c => c.id === selectedId);
  const gbCfg = classroom ? GRADE_BAND_CONFIG[classroom.grade_band as keyof typeof GRADE_BAND_CONFIG] : null;
  const safeSupport = pacing ? (Array.isArray(pacing.students_needing_support) ? pacing.students_needing_support : []) : [];
  const safeRecs = pacing ? (Array.isArray(pacing.recommendations) ? pacing.recommendations : []) : [];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <EducationSidebar user={user} eduProfile={eduProfile} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-black">Pacing Guide</span>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white">Pacing Guide</h1>
              <p className="text-slate-400 text-sm mt-0.5">See what to teach this week, what's behind, and who's ready to advance</p>
            </div>

            {/* Classroom selector + Generate */}
            <div className="flex items-center gap-3">
              <select
                value={selectedId}
                onChange={e => { setSelectedId(e.target.value); setPacing(null); }}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              >
                <option value="">Select classroom...</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                disabled={!selectedId || generating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generating ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                Generate Pacing Guide
              </button>
            </div>
          </div>

          {/* Classroom context badge */}
          {classroom && gbCfg && (
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${gbCfg.badge}`}>
                {gbCfg.icon} {classroom.name} · {gbCfg.label}
              </span>
              <span className="text-xs text-slate-500">{students.length} students loaded</span>
            </div>
          )}

          {/* Empty state */}
          {!pacing && !generating && (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-slate-500 text-sm mb-1">Select a classroom and click "Generate Pacing Guide"</p>
              <p className="text-slate-600 text-xs">Ei-Core will analyze your class data and build a weekly focus plan</p>
            </div>
          )}

          {/* Pacing data */}
          {pacing && (
            <>
              {/* 3-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <PacingColumn
                  title="This Week's Focus"
                  icon="📌"
                  color="text-blue-400"
                  standards={pacing.this_week}
                  emptyMsg="No standards assigned for this week"
                />
                <PacingColumn
                  title="Behind Schedule"
                  icon="⚠️"
                  color="text-amber-400"
                  standards={pacing.behind_schedule}
                  emptyMsg="Great — no standards are behind schedule"
                />
                <PacingColumn
                  title="Ready to Advance"
                  icon="🚀"
                  color="text-emerald-400"
                  standards={pacing.ready_to_advance}
                  emptyMsg="No standards have reached class-wide mastery yet"
                />
              </div>

              {/* Student support list */}
              {safeSupport.length > 0 && (
                <div className="bg-slate-800/50 border border-amber-500/20 rounded-2xl p-5 mb-6">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Students Needing Extra Support This Week
                  </h3>
                  <div className="divide-y divide-slate-700/30">
                    {safeSupport.map(s => (
                      <div key={s.id} className="flex items-center gap-4 py-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-300 flex-shrink-0">
                          {s.first_name[0]}{s.last_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{s.first_name} {s.last_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{s.reason}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-black text-red-400">{s.overall_progress}%</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">progress</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ei-Core recommendations */}
              <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider">Ei-Core Pacing Recommendations</h3>
                </div>
                <ul className="space-y-3">
                  {safeRecs.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
