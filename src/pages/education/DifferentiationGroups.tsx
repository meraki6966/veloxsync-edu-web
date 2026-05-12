// src/pages/education/DifferentiationGroups.tsx
// VeloxSync for Education — Differentiation Groups

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile, Classroom, Student } from '../../types/education';
import { GRADE_BAND_CONFIG, getGradeBand } from '../../types/education';

const safeBand = (grade: string | null | undefined) => GRADE_BAND_CONFIG[getGradeBand(grade ?? '4')] ?? GRADE_BAND_CONFIG['3-5'];

// ── Types ─────────────────────────────────────────────────────────────────────

interface DiffGroupStudent {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  overall_progress: number;
  learning_style?: string;
}

interface DiffGroup {
  level: 'advanced' | 'on_grade' | 'needs_support';
  label: string;
  students: DiffGroupStudent[];
  strategies: string[];
  activities: string[];
}

// ── Mock builder ──────────────────────────────────────────────────────────────

function buildMockGroups(students: Student[]): DiffGroup[] {
  const sorted = [...students].sort((a, b) => b.overall_progress - a.overall_progress);
  const advanced   = sorted.filter(s => s.overall_progress >= 80);
  const onGrade    = sorted.filter(s => s.overall_progress >= 50 && s.overall_progress < 80);
  const needsSupp  = sorted.filter(s => s.overall_progress < 50);

  const toGroup = (s: Student): DiffGroupStudent => ({
    id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    grade_level: s.grade_level,
    overall_progress: s.overall_progress,
    learning_style: s.learning_style,
  });

  return [
    {
      level: 'advanced',
      label: 'Advanced',
      students: advanced.map(toGroup),
      strategies: [
        'Provide open-ended extension projects that connect to real-world applications',
        'Offer student choice boards with higher-order thinking tasks (Bloom\'s levels 4–6)',
        'Facilitate peer mentoring — these students benefit from teaching concepts to others',
        'Introduce above-grade-level texts and independent research opportunities',
      ],
      activities: [
        'Independent research project on a self-selected topic',
        'Socratic seminar discussion with text-based evidence requirements',
        'Cross-curricular challenge task connecting two subject areas',
      ],
    },
    {
      level: 'on_grade',
      label: 'On Grade Level',
      students: onGrade.map(toGroup),
      strategies: [
        'Maintain current instructional pacing with regular formative check-ins',
        'Use collaborative learning structures (think-pair-share, jigsaw) to deepen understanding',
        'Provide graphic organizers and anchor charts for new concepts',
        'Offer guided practice before independent work on key standards',
      ],
      activities: [
        'Partner reading with structured response protocol',
        'Collaborative problem-solving with sentence frames',
        'Standards-aligned practice stations with teacher check-in',
      ],
    },
    {
      level: 'needs_support',
      label: 'Needs Support',
      students: needsSupp.map(toGroup),
      strategies: [
        'Implement explicit instruction with think-alouds for every new concept',
        'Break complex tasks into smaller steps with visual checklists',
        'Provide multisensory learning materials matched to each student\'s learning style',
        'Schedule daily 15-minute small-group re-teaching sessions targeting priority standards',
      ],
      activities: [
        'Teacher-led small group with hands-on manipulatives',
        'Scaffolded reading: pre-teach vocabulary and background knowledge',
        'Chunked practice with immediate corrective feedback',
      ],
    },
  ];
}

// ── Group card ────────────────────────────────────────────────────────────────

const GROUP_CONFIG = {
  advanced:      { border: 'border-violet-500/30', header: 'bg-violet-500/10', titleColor: 'text-violet-300', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25', dot: 'bg-violet-400', avatar: 'bg-violet-500/20 text-violet-300' },
  on_grade:      { border: 'border-blue-500/30',   header: 'bg-blue-500/10',   titleColor: 'text-blue-300',   badge: 'bg-blue-500/15 text-blue-300 border-blue-500/25',       dot: 'bg-blue-400',   avatar: 'bg-blue-500/20 text-blue-300' },
  needs_support: { border: 'border-red-500/30',    header: 'bg-red-500/10',    titleColor: 'text-red-300',    badge: 'bg-red-500/15 text-red-300 border-red-500/25',           dot: 'bg-red-400',    avatar: 'bg-red-500/20 text-red-300' },
};

const GROUP_ICONS = { advanced: '🚀', on_grade: '📘', needs_support: '🤝' };
const safeGroupCfg = (level: string) => GROUP_CONFIG[level as keyof typeof GROUP_CONFIG] ?? GROUP_CONFIG['on_grade'];

function GroupCard({ group }: { group: DiffGroup }) {
  const cfg = safeGroupCfg(group.level);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`bg-slate-800/50 border ${cfg.border} rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div className={`${cfg.header} border-b ${cfg.border} px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{GROUP_ICONS[group.level]}</span>
            <div>
              <h3 className={`font-black text-base ${cfg.titleColor}`}>{group.label}</h3>
              <p className="text-xs text-slate-400">{group.students.length} student{group.students.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Student avatars */}
        {group.students.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {group.students.filter(Boolean).map(s => {
              const gbCfg = safeBand(s?.grade_level ?? '4');
              return (
                <div
                  key={s.id}
                  title={`${s.first_name ?? '?'} ${s.last_name ?? '?'} — ${s.overall_progress ?? 0}%`}
                  className={`w-8 h-8 rounded-full ${gbCfg.bg} ring-1 ${gbCfg.ring} flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 cursor-default`}
                >
                  {(s.first_name ?? '?')[0]}{(s.last_name ?? '?')[0]}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Student list with progress */}
          {group.students.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-2">No students in this group</p>
          ) : (
            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Students</h4>
              <div className="space-y-1.5">
                {group.students.map(s => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 flex-1">{s.first_name} {s.last_name}</span>
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className={`h-full rounded-full ${s.overall_progress >= 80 ? 'bg-emerald-500' : s.overall_progress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${s.overall_progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-8 text-right">{s.overall_progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Differentiation strategies */}
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Ei-Core Strategies
            </h4>
            <ul className="space-y-2">
              {group.strategies.map((str, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className={`${cfg.dot} w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5`} />
                  {str}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested activities */}
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Suggested Activities</h4>
            <div className="space-y-2">
              {group.activities.map((act, i) => (
                <div key={i} className={`px-3 py-2 rounded-xl border text-xs text-slate-300 ${cfg.border} ${cfg.header}`}>
                  {act}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DifferentiationGroups() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [groups, setGroups] = useState<DiffGroup[] | null>(null);
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
      const res = await edu.generateGroups(selectedId);
      const gData = res.data?.groups;
      setGroups(Array.isArray(gData) ? gData : buildMockGroups(students));
    } catch {
      setGroups(buildMockGroups(students));
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = () => {
    if (!groups) return;
    const lines: string[] = ['VeloxSync Differentiation Groups Export', '='.repeat(40), ''];
    for (const g of groups) {
      lines.push(`${GROUP_ICONS[g.level]} ${g.label} (${g.students.length} students)`);
      lines.push('-'.repeat(30));
      lines.push('Students:');
      for (const s of g.students) lines.push(`  • ${s.first_name} ${s.last_name} — ${s.overall_progress}%`);
      lines.push('');
      lines.push('Strategies:');
      for (const str of g.strategies) lines.push(`  → ${str}`);
      lines.push('');
      lines.push('Activities:');
      for (const act of g.activities) lines.push(`  ○ ${act}`);
      lines.push('', '');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `differentiation-groups-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const classroom = classrooms.find(c => c.id === selectedId);
  const gbCfg = classroom ? safeBand(classroom.grade_band) : null;
  const totalStudents = groups ? groups.reduce((s, g) => s + g.students.length, 0) : 0;

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
          <span className="text-white font-black">Diff. Groups</span>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white">Differentiation Groups</h1>
              <p className="text-slate-400 text-sm mt-0.5">Ei-Core groups students by readiness and generates targeted strategies</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {groups && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 border border-slate-600/50 text-slate-300 text-sm font-bold hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export for Co-Teachers
                </button>
              )}
              <select
                value={selectedId}
                onChange={e => { setSelectedId(e.target.value); setGroups(null); }}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              >
                <option value="">Select classroom...</option>
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button
                onClick={handleGenerate}
                disabled={!selectedId || generating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generating ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                Generate Groups
              </button>
            </div>
          </div>

          {/* Context bar */}
          {classroom && gbCfg && (
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${gbCfg.badge}`}>
                {gbCfg.icon} {classroom.name} · {gbCfg.label}
              </span>
              {groups && (
                <span className="text-xs text-slate-500">{totalStudents} students grouped</span>
              )}
            </div>
          )}

          {/* Empty state */}
          {!groups && !generating && (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-500 text-sm mb-1">Select a classroom and click "Generate Groups"</p>
              <p className="text-slate-600 text-xs">Ei-Core will sort students by readiness and generate differentiated strategies for each group</p>
            </div>
          )}

          {/* Groups grid */}
          {groups && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {groups.map(group => <GroupCard key={group.level} group={group} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
