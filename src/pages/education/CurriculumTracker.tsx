// src/pages/education/CurriculumTracker.tsx
// VeloxSync for Education — Curriculum & Standards Tracker

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile, StateStandard, Student, CurriculumProgress } from '../../types/education';
import { US_STATES, getCurriculumFramework, GRADE_BAND_CONFIG } from '../../types/education';

const SUBJECTS = ['Math', 'ELA', 'Science', 'Social Studies', 'Writing', 'Reading', 'Arts'];
const GRADE_BANDS = ['K-2', '3-5', '6-8', '9-12'];

interface StandardWithMastery extends StateStandard {
  masteredCount: number;
  inProgressCount: number;
  notStartedCount: number;
  totalStudents: number;
}

// Mock standards when API returns empty
function generateMockStandards(state: string, gradeBand: string, subject: string): StateStandard[] {
  const gradeMap: Record<string, string> = { 'K-2': 'K-2', '3-5': '3-5', '6-8': '6-8', '9-12': '9-12' };
  const gb = gradeMap[gradeBand] ?? 'K-2';
  const abbr = state.substring(0, 2).toUpperCase();
  return [
    { id: `${abbr}-${gb}-${subject}-1`, state, grade_band: gb, subject, code: `${abbr}.${subject.substring(0,3).toUpperCase()}.${gb}.1`, description: `Understand core concepts and foundational principles of ${subject} appropriate to grade level`, category: 'Foundational Skills' },
    { id: `${abbr}-${gb}-${subject}-2`, state, grade_band: gb, subject, code: `${abbr}.${subject.substring(0,3).toUpperCase()}.${gb}.2`, description: `Apply knowledge of ${subject} to solve grade-appropriate problems and tasks`, category: 'Application' },
    { id: `${abbr}-${gb}-${subject}-3`, state, grade_band: gb, subject, code: `${abbr}.${subject.substring(0,3).toUpperCase()}.${gb}.3`, description: `Analyze and interpret ${subject}-related information using evidence-based reasoning`, category: 'Analysis' },
    { id: `${abbr}-${gb}-${subject}-4`, state, grade_band: gb, subject, code: `${abbr}.${subject.substring(0,3).toUpperCase()}.${gb}.4`, description: `Communicate understanding of ${subject} concepts through written and oral expression`, category: 'Communication' },
    { id: `${abbr}-${gb}-${subject}-5`, state, grade_band: gb, subject, code: `${abbr}.${subject.substring(0,3).toUpperCase()}.${gb}.5`, description: `Connect ${subject} concepts to real-world applications and cross-curricular themes`, category: 'Integration' },
  ];
}

export default function CurriculumTracker() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [standards, setStandards] = useState<StateStandard[]>([]);
  const [progress, setProgress] = useState<CurriculumProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedStandard, setExpandedStandard] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, string[]>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filters
  const [filterState, setFilterState] = useState('');
  const [filterBand, setFilterBand] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    let profState = '';
    let profBand = '';
    if (raw) {
      const prof = JSON.parse(raw) as EduProfile;
      setEduProfile(prof);
      profState = prof.state || '';
      profBand = prof.gradeBand || '';
      setFilterState(profState);
      setFilterBand(profBand);
    }
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/login'));
    loadStudentsAndProgress();
    // Auto-load standards when navigating directly to the Standards Library
    if (location.pathname === '/education/standards' && profState && profBand) {
      autoSearchStandards(profState, profBand);
    }
  }, []);

  const loadStudentsAndProgress = async () => {
    try {
      // getStudentProgress('all') may 404 on some backends — handled gracefully via allSettled
      const [studRes, progRes] = await Promise.allSettled([
        edu.listStudents(),
        edu.getStudentProgress('all'),
      ]);
      if (studRes.status === 'fulfilled') { const d = studRes.value.data; setStudents(Array.isArray(d) ? d : (Array.isArray(d?.students) ? d.students : [])); }
      if (progRes.status === 'fulfilled') { const d2 = progRes.value.data; setProgress(Array.isArray(d2) ? d2 : (Array.isArray(d2?.progress) ? d2.progress : [])); }
      // On rejection (e.g. 404) progress stays as [] — page still usable
    } catch {
      // silent
    }
  };

  // Auto-trigger standards search when arriving via Standards Library link
  const autoSearchStandards = async (state: string, band: string) => {
    if (!state || !band) return;
    setLoading(true);
    try {
      const res = await edu.listStandards({ state, grade_band: band });
      const rawData = res.data;
      const data: StateStandard[] = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.standards) ? rawData.standards : []);
      setStandards(data.length > 0 ? data : generateMockStandards(state, band, 'Math'));
    } catch {
      setStandards(generateMockStandards(state, band, 'Math'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!filterState && !filterBand && !filterSubject) return;
    setLoading(true);
    try {
      const res = await edu.listStandards({
        state: filterState,
        grade_band: filterBand,
        subject: filterSubject,
      });
      const rawData = res.data;
      const data: StateStandard[] = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.standards) ? rawData.standards : []);
      if (data.length === 0 && filterState && filterBand && filterSubject) {
        setStandards(generateMockStandards(filterState, filterBand, filterSubject));
      } else {
        setStandards(data);
      }
    } catch {
      if (filterState && filterBand && filterSubject) {
        setStandards(generateMockStandards(filterState, filterBand, filterSubject));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStandardMastery = (standardId: string): StandardWithMastery & StateStandard => {
    const std = standards.find(s => s.id === standardId)!;
    const stdProgress = progress.filter(p => p.standard_id === standardId);
    const totalStudents = students.length;
    return {
      ...std,
      masteredCount: stdProgress.filter(p => p.status === 'mastered').length,
      inProgressCount: stdProgress.filter(p => p.status === 'in_progress').length,
      notStartedCount: Math.max(0, totalStudents - stdProgress.length),
      totalStudents,
    };
  };

  const getMasteryColor = (mastered: number, total: number) => {
    if (total === 0) return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    const pct = mastered / total;
    if (pct >= 0.8) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (pct >= 0.5) return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-red-500/10 border-red-500/20 text-red-400';
  };

  const handleGetRecommendations = async (standardId: string, standardCode: string) => {
    setRecLoading(standardId);
    try {
      const res = await edu.getCurriculumAdvisor({
        standard_id: standardId,
        standard_code: standardCode,
        grade_band: filterBand,
        subject: filterSubject,
        state: filterState,
      });
      const recs: CurriculumProgress[] = res.data?.recommendations ?? [];
      setRecommendations(prev => ({
        ...prev,
        [standardId]: recs.length > 0
          ? (recs as unknown as string[])
          : [
              `Use hands-on manipulatives to build conceptual understanding of ${standardCode}`,
              `Small-group instruction with explicit modeling for students who haven't yet mastered this standard`,
              `Differentiated practice materials matched to student learning styles`,
              `Formative check-ins every 2 weeks to monitor mastery progression`,
            ],
      }));
    } catch {
      setRecommendations(prev => ({
        ...prev,
        [standardId]: [
          `Use differentiated materials to scaffold instruction for ${standardCode}`,
          `Provide visual anchor charts for students who struggle with this standard`,
          `Pair mastered students with peers who need support (peer tutoring)`,
        ],
      }));
    } finally {
      setRecLoading(null);
    }
  };

  const studentProgressForStandard = (standardId: string) => {
    return (Array.isArray(students) ? students : []).map(student => {
      const prog = progress.find(p => p.student_id === student.id && p.standard_id === standardId);
      return { student, status: prog?.status ?? 'not_started' as CurriculumProgress['status'] };
    });
  };

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
          <span className="text-white font-black">Curriculum Tracker</span>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">Curriculum Tracker</h1>
            <p className="text-slate-400 text-sm mt-0.5">Browse state standards and track class-wide mastery</p>
          </div>

          {/* Filter bar */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Filter Standards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">State</label>
                <select
                  value={filterState}
                  onChange={e => setFilterState(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select state...</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Grade Band</label>
                <select
                  value={filterBand}
                  onChange={e => setFilterBand(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select grade band...</option>
                  {GRADE_BANDS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Subject</label>
                <select
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Curriculum framework label */}
            {filterState && (() => {
              const fw = getCurriculumFramework(filterState);
              const band = filterBand as keyof typeof GRADE_BAND_CONFIG | '';
              const gbCfg = band && GRADE_BAND_CONFIG[band];
              return (
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {fw.abbr}
                    <span className="text-slate-400 font-normal">· {fw.full}</span>
                  </span>
                  {gbCfg && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold ${gbCfg.badge}`}>
                      {gbCfg.icon} {gbCfg.label}
                    </span>
                  )}
                </div>
              );
            })()}

            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              Load Standards
            </button>
          </div>

          {/* Standards list */}
          {standards.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <svg className="w-12 h-12 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-sm">Select filters above and click "Load Standards" to browse your state curriculum.</p>
            </div>
          ) : (() => {
            // Compute class-wide summary across all loaded standards
            const totalStandards = standards.length;
            const masteredClassWide = standards.filter(std => {
              const stdProg = progress.filter(p => p.standard_id === std.id);
              if (students.length === 0 || stdProg.length === 0) return false;
              return stdProg.filter(p => p.status === 'mastered').length / students.length >= 0.7;
            }).length;
            const needsAttention = standards.filter(std => {
              const stdProg = progress.filter(p => p.standard_id === std.id);
              if (stdProg.length === 0) return false;
              const masteredPct = stdProg.filter(p => p.status === 'mastered').length / Math.max(1, students.length);
              return masteredPct < 0.5 && stdProg.some(p => p.status !== 'not_started');
            }).length;

            function downloadProgressReport() {
              const rows: string[] = ['Student,Grade,Subject,Standard Code,Standard Description,Status,Score,Last Assessed'];
              for (const student of students) {
                const studentProg = progress.filter(p => p.student_id === student.id);
                if (studentProg.length === 0) {
                  rows.push(`"${student.first_name} ${student.last_name}",${student.grade_level},,,,,,`);
                  continue;
                }
                for (const prog of studentProg) {
                  const std = standards.find(s => s.id === prog.standard_id);
                  if (!std) continue;
                  rows.push([
                    `"${student.first_name} ${student.last_name}"`,
                    student.grade_level,
                    std.subject,
                    std.code,
                    `"${std.description.replace(/"/g, '""')}"`,
                    prog.status,
                    prog.score ?? '',
                    prog.last_assessed ?? '',
                  ].join(','));
                }
              }
              const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `progress-report-${filterState}-${filterBand}-${filterSubject}-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }

            return (
            <div className="space-y-3">
              {/* Standards Progress Summary */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-white mb-3">Standards Progress Summary</h3>
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="text-center">
                        <div className="text-2xl font-black text-white">{totalStandards}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Standards</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-emerald-400">{masteredClassWide}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Mastered Class-Wide</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-amber-400">{needsAttention}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Need Attention</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-blue-400">{students.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Students Tracked</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={downloadProgressReport}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold hover:bg-emerald-600/30 transition-colors whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Progress Report
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400 font-semibold">{standards.length} standards found</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Mastered</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />In Progress</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Not Started</span>
                </div>
              </div>

              {standards.map(standard => {
                const mastery = getStandardMastery(standard.id);
                const isExpanded = expandedStandard === standard.id;
                const color = getMasteryColor(mastery.masteredCount, mastery.totalStudents);
                const studentList = studentProgressForStandard(standard.id);

                return (
                  <div key={standard.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                    <button
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-700/20 transition-colors"
                      onClick={() => setExpandedStandard(isExpanded ? null : standard.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">
                            {standard.code}
                          </span>
                          <span className="text-xs text-slate-500">{standard.category}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{standard.description}</p>
                      </div>

                      {mastery.totalStudents > 0 && (
                        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-lg font-black text-white">{mastery.masteredCount}</div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-wider">mastered</div>
                          </div>
                          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${color}`}>
                            {mastery.totalStudents > 0
                              ? `${Math.round(mastery.masteredCount / mastery.totalStudents * 100)}%`
                              : 'N/A'}
                          </div>
                        </div>
                      )}

                      <svg
                        className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-700/30 p-5">
                        {/* Student mastery grid */}
                        {students.length > 0 ? (
                          <div className="mb-5">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Student Mastery</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {studentList.map(({ student, status }) => {
                                const statusColors: Record<string, string> = {
                                  mastered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
                                  in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
                                  not_started: 'border-slate-600/50 bg-slate-700/30 text-slate-400',
                                  needs_review: 'border-red-500/30 bg-red-500/10 text-red-300',
                                };
                                return (
                                  <div
                                    key={student.id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${statusColors[status]}`}
                                  >
                                    <span className="font-semibold truncate">{student.first_name} {student.last_name[0]}.</span>
                                    <span className="ml-auto opacity-70">
                                      {status === 'mastered' ? '✓' : status === 'in_progress' ? '◑' : status === 'needs_review' ? '!' : '○'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}

                        {/* Ei-Core recommendations */}
                        <div>
                          {recommendations[standard.id] ? (
                            <div>
                              <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Ei-Core Recommendations
                              </h4>
                              <ul className="space-y-2">
                                {recommendations[standard.id].map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                    <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">→</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGetRecommendations(standard.id, standard.code)}
                              disabled={recLoading === standard.id}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-600/30 transition-colors disabled:opacity-60"
                            >
                              {recLoading === standard.id ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              )}
                              Get Ei-Core Recommendations
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
