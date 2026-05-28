// src/pages/education/CurriculumTracker.tsx
// VeloxSync for Education — Standards Library & Mastery (V3 homeschool, per-child)

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile, StateStandard, HomeschoolChild, CurriculumProgress } from '../../types/education';
import { US_STATES, getCurriculumFramework, GRADE_BAND_CONFIG } from '../../types/education';

const SUBJECTS = ['Math', 'ELA', 'Science', 'Social Studies', 'Writing', 'Reading', 'Arts'];
const GRADE_BANDS = ['K-2', '3-5', '6-8', '9-12'];

const TRK_CSS = `
.edu-trk { display: flex; height: 100vh; overflow: hidden; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; }
.edu-trk-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; }
.edu-trk-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; line-height: 1.1; color: #1C1812; }
.edu-trk-card { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1); border-radius: 16px; box-shadow: 0 2px 12px rgba(28,24,18,0.04); }
.edu-trk-input { width: 100%; background: #FFFFFF; border: 1px solid rgba(28,24,18,0.15); border-radius: 12px; color: #1C1812; font-size: 14px; }
.edu-trk-input:focus { outline: none; border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
.edu-trk-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; }
.edu-trk-btn { background: #3D6B4F; color: #fff; border-radius: 9999px; font-weight: 600; }
.edu-trk-btn:hover { opacity: 0.92; }
`;

interface StandardWithMastery extends StateStandard {
  masteredCount: number;
  inProgressCount: number;
  notStartedCount: number;
  totalChildren: number;
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
    { id: `${abbr}-${gb}-${subject}-5`, state, grade_band: gb, subject, code: `${abbr}.${subject.substring(0,3).toUpperCase()}.${gb}.5`, description: `Connect ${subject} concepts to real-world applications and cross-subject themes`, category: 'Integration' },
  ];
}

export default function CurriculumTracker() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [children, setChildren] = useState<HomeschoolChild[]>([]);
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
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-trk', 'true');
    styleEl.textContent = TRK_CSS;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

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
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
    loadChildrenAndProgress();
    if (location.pathname === '/education/standards' && profState && profBand) {
      autoSearchStandards(profState, profBand);
    }
  }, []);

  const loadChildrenAndProgress = async () => {
    try {
      const [childRes, progRes] = await Promise.allSettled([
        edu.listHomeschoolChildren(),
        edu.getStudentProgress('all'),
      ]);
      if (childRes.status === 'fulfilled') { const d = childRes.value.data; setChildren(Array.isArray(d) ? d : (Array.isArray(d?.children) ? d.children : [])); }
      if (progRes.status === 'fulfilled') { const d2 = progRes.value.data; setProgress(Array.isArray(d2) ? d2 : (Array.isArray(d2?.progress) ? d2.progress : [])); }
    } catch {
      // silent
    }
  };

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
    const totalChildren = children.length;
    return {
      ...std,
      masteredCount: stdProgress.filter(p => p.status === 'mastered').length,
      inProgressCount: stdProgress.filter(p => p.status === 'in_progress').length,
      notStartedCount: Math.max(0, totalChildren - stdProgress.length),
      totalChildren,
    };
  };

  const getMasteryColor = (mastered: number, total: number) => {
    if (total === 0) return { color: 'rgba(28,24,18,0.55)', background: 'rgba(28,24,18,0.06)', border: '1px solid rgba(28,24,18,0.15)' };
    const pct = mastered / total;
    if (pct >= 0.8) return { color: '#2E5340', background: 'rgba(61,107,79,0.12)', border: '1px solid rgba(61,107,79,0.3)' };
    if (pct >= 0.5) return { color: '#9A6A12', background: 'rgba(180,120,20,0.12)', border: '1px solid rgba(180,120,20,0.25)' };
    return { color: '#B03A2E', background: 'rgba(176,58,46,0.1)', border: '1px solid rgba(176,58,46,0.25)' };
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
              `Sit down for focused practice with explicit modeling on the parts your child hasn't mastered yet`,
              `Differentiated practice materials matched to how your child learns best`,
              `Quick check-ins every 2 weeks to watch mastery grow`,
            ],
      }));
    } catch {
      setRecommendations(prev => ({
        ...prev,
        [standardId]: [
          `Use differentiated materials to scaffold instruction for ${standardCode}`,
          `Provide visual anchor charts if your child struggles with this standard`,
          `Work through it together with guided practice with you`,
        ],
      }));
    } finally {
      setRecLoading(null);
    }
  };

  const childProgressForStandard = (standardId: string) => {
    return (Array.isArray(children) ? children : []).map(child => {
      const prog = progress.find(p => p.student_id === child.id && p.standard_id === standardId);
      return { child, status: prog?.status ?? 'not_started' as CurriculumProgress['status'] };
    });
  };

  return (
    <div className="edu-trk">
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
          <span className="font-semibold" style={{ color: '#1C1812' }}>Standards Library</span>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-7">
            <div className="edu-trk-eyebrow mb-2">EI-CORE</div>
            <h1 className="edu-trk-title">Standards Library</h1>
            <p className="text-sm mt-2" style={{ color: 'rgba(28,24,18,0.6)' }}>Browse state standards and track each child's mastery.</p>
          </div>

          {/* Filter bar */}
          <div className="edu-trk-card p-5 mb-6">
            <h2 className="edu-trk-label mb-4">Filter Standards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(28,24,18,0.55)' }}>State</label>
                <select value={filterState} onChange={e => setFilterState(e.target.value)} className="edu-trk-input px-3 py-2.5">
                  <option value="">Select state...</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(28,24,18,0.55)' }}>Grade Band</label>
                <select value={filterBand} onChange={e => setFilterBand(e.target.value)} className="edu-trk-input px-3 py-2.5">
                  <option value="">Select grade band...</option>
                  {GRADE_BANDS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(28,24,18,0.55)' }}>Subject</label>
                <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="edu-trk-input px-3 py-2.5">
                  <option value="">Select subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* State standards framework label */}
            {filterState && (() => {
              const fw = getCurriculumFramework(filterState);
              const band = filterBand as keyof typeof GRADE_BAND_CONFIG | '';
              const gbCfg = band && GRADE_BAND_CONFIG[band];
              return (
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(61,107,79,0.08)', border: '1px solid rgba(61,107,79,0.2)', color: '#3D6B4F' }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {fw.abbr}
                    <span className="font-normal" style={{ color: 'rgba(28,24,18,0.5)' }}>· {fw.full}</span>
                  </span>
                  {gbCfg && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(61,107,79,0.08)', border: '1px solid rgba(61,107,79,0.2)', color: '#3D6B4F' }}>
                      {gbCfg.icon} {gbCfg.label}
                    </span>
                  )}
                </div>
              );
            })()}

            <button
              onClick={handleSearch}
              disabled={loading}
              className="edu-trk-btn flex items-center gap-2 px-6 py-2.5 text-sm transition-opacity disabled:opacity-60"
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
            <div className="text-center py-16" style={{ color: 'rgba(28,24,18,0.45)' }}>
              <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(28,24,18,0.2)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-sm">Select filters above and click "Load Standards" to browse your state curriculum.</p>
            </div>
          ) : (() => {
            const totalStandards = standards.length;
            const masteredAcrossFamily = standards.filter(std => {
              const stdProg = progress.filter(p => p.standard_id === std.id);
              if (children.length === 0 || stdProg.length === 0) return false;
              return stdProg.filter(p => p.status === 'mastered').length / children.length >= 0.7;
            }).length;
            const needsAttention = standards.filter(std => {
              const stdProg = progress.filter(p => p.standard_id === std.id);
              if (stdProg.length === 0) return false;
              const masteredPct = stdProg.filter(p => p.status === 'mastered').length / Math.max(1, children.length);
              return masteredPct < 0.5 && stdProg.some(p => p.status !== 'not_started');
            }).length;

            function downloadProgressReport() {
              const rows: string[] = ['Child,Grade,Subject,Standard Code,Standard Description,Status,Score,Last Assessed'];
              for (const child of children) {
                const childProg = progress.filter(p => p.student_id === child.id);
                if (childProg.length === 0) {
                  rows.push(`"${child.first_name} ${child.last_name}",${child.grade_level},,,,,,`);
                  continue;
                }
                for (const prog of childProg) {
                  const std = standards.find(s => s.id === prog.standard_id);
                  if (!std) continue;
                  rows.push([
                    `"${child.first_name} ${child.last_name}"`,
                    child.grade_level,
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
              {/* Progress Summary */}
              <div className="edu-trk-card p-5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: '#1C1812' }}>Standards Progress Summary</h3>
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: '#1C1812' }}>{totalStandards}</div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(28,24,18,0.45)' }}>Total Standards</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: '#3D6B4F' }}>{masteredAcrossFamily}</div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(28,24,18,0.45)' }}>Mastered Across Family</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: '#9A6A12' }}>{needsAttention}</div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(28,24,18,0.45)' }}>Need Attention</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: '#1C1812' }}>{children.length}</div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(28,24,18,0.45)' }}>Children Tracked</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={downloadProgressReport}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
                    style={{ background: 'rgba(61,107,79,0.12)', border: '1px solid rgba(61,107,79,0.3)', color: '#2E5340' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Progress Report
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: 'rgba(28,24,18,0.6)' }}>{standards.length} standards found</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(28,24,18,0.5)' }}>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#3D6B4F' }} />Mastered</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#C99A2E' }} />In Progress</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#B03A2E' }} />Not Started</span>
                </div>
              </div>

              {standards.map(standard => {
                const mastery = getStandardMastery(standard.id);
                const isExpanded = expandedStandard === standard.id;
                const colorStyle = getMasteryColor(mastery.masteredCount, mastery.totalChildren);
                const childList = childProgressForStandard(standard.id);

                return (
                  <div key={standard.id} className="edu-trk-card overflow-hidden">
                    <button
                      className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-[rgba(61,107,79,0.03)]"
                      onClick={() => setExpandedStandard(isExpanded ? null : standard.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ color: '#3D6B4F', background: 'rgba(61,107,79,0.08)', border: '1px solid rgba(61,107,79,0.2)' }}>
                            {standard.code}
                          </span>
                          <span className="text-xs" style={{ color: 'rgba(28,24,18,0.45)' }}>{standard.category}</span>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: '#1C1812' }}>{standard.description}</p>
                      </div>

                      {mastery.totalChildren > 0 && (
                        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: '#1C1812' }}>{mastery.masteredCount}</div>
                            <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(28,24,18,0.45)' }}>mastered</div>
                          </div>
                          <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={colorStyle}>
                            {mastery.totalChildren > 0
                              ? `${Math.round(mastery.masteredCount / mastery.totalChildren * 100)}%`
                              : 'N/A'}
                          </div>
                        </div>
                      )}

                      <svg
                        className={`w-5 h-5 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        style={{ color: 'rgba(28,24,18,0.4)' }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="p-5" style={{ borderTop: '1px solid rgba(28,24,18,0.08)' }}>
                        {/* Child mastery */}
                        {children.length > 0 ? (
                          <div className="mb-5">
                            <h4 className="edu-trk-label mb-3">Child's Mastery</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {childList.map(({ child, status }) => {
                                const statusStyle: Record<string, CSSProperties> = {
                                  mastered: { color: '#2E5340', background: 'rgba(61,107,79,0.12)', border: '1px solid rgba(61,107,79,0.3)' },
                                  in_progress: { color: '#9A6A12', background: 'rgba(180,120,20,0.12)', border: '1px solid rgba(180,120,20,0.25)' },
                                  not_started: { color: 'rgba(28,24,18,0.5)', background: 'rgba(28,24,18,0.04)', border: '1px solid rgba(28,24,18,0.12)' },
                                  needs_review: { color: '#B03A2E', background: 'rgba(176,58,46,0.1)', border: '1px solid rgba(176,58,46,0.25)' },
                                };
                                return (
                                  <div
                                    key={child.id}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                                    style={statusStyle[status]}
                                  >
                                    <span className="font-semibold truncate">{child.first_name} {child.last_name[0]}.</span>
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
                              <h4 className="edu-trk-label mb-2 flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Ei-Core Recommendations
                              </h4>
                              <ul className="space-y-2">
                                {recommendations[standard.id].map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(28,24,18,0.7)' }}>
                                    <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: '#3D6B4F' }}>→</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGetRecommendations(standard.id, standard.code)}
                              disabled={recLoading === standard.id}
                              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors disabled:opacity-60"
                              style={{ background: 'rgba(61,107,79,0.1)', border: '1px solid rgba(61,107,79,0.25)', color: '#3D6B4F' }}
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
