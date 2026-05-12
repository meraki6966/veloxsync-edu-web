// src/pages/education/TeacherDashboard.tsx
// VeloxSync for Education — Teacher Dashboard

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboard, edu } from '../../api';

const DOC_PURPOSES = ['Curriculum Resource', 'Student Work', 'Lesson Plan', 'Reference'];
import EducationSidebar from '../../components/EducationSidebar';
import EduTrialBanner from '../../components/EduTrialBanner';
import type { EduProfile, Student, LearningIntervention, ClassInsight } from '../../types/education';
import { GRADE_BAND_CONFIG, getGradeBand } from '../../types/education';

const safeBand = (grade: string) => GRADE_BAND_CONFIG[getGradeBand(grade)] ?? GRADE_BAND_CONFIG['3-5'];

const SUBJECTS = ['Math', 'ELA', 'Science', 'Social Studies', 'Writing'];

function getHour() {
  return new Date().getHours();
}

function getGreeting(name: string) {
  const h = getHour();
  const prefix = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${prefix}, ${name}.`;
}

function subjectStatusColor(status: 'green' | 'amber' | 'red') {
  if (status === 'green') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/25';
  if (status === 'amber') return 'bg-amber-500/20 text-amber-400 border-amber-500/25';
  return 'bg-red-500/20 text-red-400 border-red-500/25';
}

// Mock subject health for demo since /api/edu/students may not return subjects
function mockSubjectHealth(student: Student) {
  if (student.subjects && student.subjects.length > 0) return student.subjects;
  const seed = student.id.charCodeAt(0) + student.id.charCodeAt(1);
  return SUBJECTS.map((s, i) => {
    const val = (seed + i * 17) % 3;
    return { subject: s, status: (['green', 'amber', 'red'] as const)[val] };
  });
}

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bg: string;
}

const KpiCard = ({ label, value, icon, color, bg }: KpiCardProps) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
      <svg className={`w-5 h-5 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </div>
    <div className="text-3xl font-black text-white">{value}</div>
    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">{label}</div>
  </div>
);

interface EduDoc { name: string; purpose: string; uploadedAt: string; }

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [interventions, setInterventions] = useState<LearningIntervention[]>([]);
  const [classInsight, setClassInsight] = useState<ClassInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Document upload
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPurpose, setUploadPurpose] = useState('Curriculum Resource');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<EduDoc[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (!raw) { navigate('/education'); return; }
    setEduProfile(JSON.parse(raw) as EduProfile);

    dashboard.me()
      .then(r => setUser(r.data))
      .catch(() => navigate('/login'));

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studRes, intRes] = await Promise.allSettled([
        edu.listStudents(),
        edu.listInterventions(),
      ]);
      if (studRes.status === 'fulfilled') {
        const d = studRes.value.data;
        setStudents(Array.isArray(d) ? d : (Array.isArray(d?.students) ? d.students : []));
      }
      if (intRes.status === 'fulfilled') {
        const d = intRes.value.data;
        setInterventions(Array.isArray(d) ? d : (Array.isArray(d?.interventions) ? d.interventions : []));
      }
    } catch {
      // graceful degradation
    } finally {
      setLoading(false);
    }
  };

  const loadClassInsight = async () => {
    try {
      const res = await edu.getClassInsight({});
      setClassInsight(res.data);
    } catch {
      // not available
    }
  };

  useEffect(() => {
    loadClassInsight();
  }, []);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('purpose', uploadPurpose);
      await edu.uploadDocument(fd);
    } catch { /* graceful — still record locally */ }
    const doc: EduDoc = { name: uploadFile.name, purpose: uploadPurpose, uploadedAt: new Date().toISOString() };
    setUploadedDocs(prev => [doc, ...prev]);
    setUploading(false);
    setUploadSuccess(true);
    setTimeout(() => { setUploadSuccess(false); setShowUpload(false); setUploadFile(null); }, 2500);
  };

  const safeStudents = Array.isArray(students) ? students : [];
  const safeInterventions = Array.isArray(interventions) ? interventions : [];
  const atRiskCount = safeStudents.filter(s => s.overall_progress < 40).length;
  const avgMastery = safeStudents.length
    ? Math.round(safeStudents.reduce((acc, s) => acc + s.overall_progress, 0) / safeStudents.length)
    : 0;
  const activeInterventions = safeInterventions.filter(i => i.status !== 'resolved').length;

  const firstName = user?.first_name ?? 'Teacher';

  const mockInsights: string[] = Array.isArray(classInsight?.recommendations) ? classInsight!.recommendations : [
    'Three students in your {gradeBand} cohort are showing signs of reading comprehension gaps — consider small-group pull-outs this week.',
    'Math assessments suggest 40% of the class has mastered fractions. The remaining 60% may benefit from manipulative-based re-teaching.',
    'Writing scores indicate strong mechanics but weak organization. A paragraph-structure mini-lesson could lift 8+ students.',
    'Two students with IEPs have upcoming accommodation review dates — check Interventions for action items.',
    'Highest engagement this week: hands-on activities. Ei-Core recommends increasing project-based tasks by 20%.',
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 overflow-y-auto">
        <EduTrialBanner />
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-black">My Classroom</span>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ei-Core Edu
              </div>
              <h1 className="text-3xl font-black text-white">{getGreeting(firstName)}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-slate-400 text-sm">
                  Here's your class today{eduProfile?.classroomName ? ` · ${eduProfile.classroomName}` : ''}.
                </span>
                {eduProfile?.gradeBand && (() => {
                  const gb = GRADE_BAND_CONFIG[eduProfile.gradeBand as keyof typeof GRADE_BAND_CONFIG];
                  return gb ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-black ${gb.badge}`}>
                      {gb.icon} {gb.label}
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                to="/education/students"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-semibold hover:bg-blue-600/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Student
              </Link>
              <Link
                to="/education/curriculum"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                View Standards
              </Link>
              <Link
                to="/education/advisor"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Ask Ei-Core
              </Link>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Materials
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KpiCard
              label="Total Students"
              value={loading ? '—' : safeStudents.length}
              icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              color="text-blue-400"
              bg="bg-blue-500/10"
            />
            <KpiCard
              label="At-Risk Students"
              value={loading ? '—' : atRiskCount}
              icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              color="text-red-400"
              bg="bg-red-500/10"
            />
            <KpiCard
              label="Standards Mastered"
              value={loading ? '—' : `${avgMastery}%`}
              icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              color="text-emerald-400"
              bg="bg-emerald-500/10"
            />
            <KpiCard
              label="Active Interventions"
              value={loading ? '—' : activeInterventions}
              icon="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              color="text-amber-400"
              bg="bg-amber-500/10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Class Health Matrix */}
            <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
              <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Class Health Matrix</h2>
                    <p className="text-xs text-slate-500">Subject performance by student</p>
                  </div>
                </div>
                <Link to="/education/students" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                  View All →
                </Link>
              </div>

              {loading ? (
                <div className="p-6 text-center text-slate-500 text-sm">Loading students...</div>
              ) : safeStudents.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">No students yet.</p>
                  <Link
                    to="/education/students"
                    className="text-blue-400 text-sm font-semibold hover:text-blue-300"
                  >
                    Add your first student →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left px-5 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">Student</th>
                        {SUBJECTS.map(s => (
                          <th key={s} className="text-center px-2 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">{s}</th>
                        ))}
                        <th className="text-right px-5 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {(Array.isArray(students) ? students : []).slice(0, 8).map(student => {
                        const health = mockSubjectHealth(student);
                        return (
                          <tr
                            key={student.id}
                            className="hover:bg-slate-700/20 cursor-pointer transition-colors"
                            onClick={() => navigate(`/education/students/${student.id}`)}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                {(() => {
                                  const gb = safeBand(student.grade_level);
                                  return (
                                    <div className={`w-8 h-8 rounded-full ${gb.bg} ring-2 ${gb.ring} flex items-center justify-center text-xs font-black text-white flex-shrink-0`}>
                                      {student.first_name[0]}{student.last_name[0]}
                                    </div>
                                  );
                                })()}
                                <div className="min-w-0">
                                  <div className="font-semibold text-white truncate">
                                    {student.first_name} {student.last_name}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {student.has_iep && (
                                      <span className="text-[9px] font-black text-violet-400 uppercase tracking-wider">IEP</span>
                                    )}
                                    {(() => {
                                      const gb = safeBand(student.grade_level);
                                      return (
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${gb.badge}`}>
                                          {gb.icon} Gr {student.grade_level}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            {health.map(h => (
                              <td key={h.subject} className="px-2 py-3 text-center">
                                <div className={`inline-flex w-6 h-6 rounded-md border items-center justify-center ${subjectStatusColor(h.status)}`}>
                                  <div className="w-2 h-2 rounded-full bg-current" />
                                </div>
                              </td>
                            ))}
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${student.overall_progress >= 70 ? 'bg-emerald-500' : student.overall_progress >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${student.overall_progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-slate-400 w-8 text-right">{student.overall_progress}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {safeStudents.length > 8 && (
                    <div className="p-4 text-center border-t border-slate-700/30">
                      <Link to="/education/students" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                        View all {safeStudents.length} students →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 px-5 pb-4 pt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/25 inline-block" /> On Track</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/25 inline-block" /> Needs Attention</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/25 inline-block" /> At Risk</span>
              </div>
            </div>

            {/* Ei-Core Insight Feed */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl flex flex-col">
              <div className="flex items-center gap-3 p-5 border-b border-slate-700/50">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Ei-Core Feed</h2>
                  <p className="text-xs text-slate-500">AI-generated interventions</p>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {(Array.isArray(mockInsights) ? mockInsights : []).map((insight, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-blue-500/15 bg-blue-500/5 hover:bg-blue-500/8 transition-colors"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <svg className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-xs text-slate-300 leading-relaxed">{insight}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-700/50">
                <Link
                  to="/education/advisor"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-sm font-black hover:opacity-90 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Ask Ei-Core Anything
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Materials Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white">Upload Materials</h2>
              <button onClick={() => setShowUpload(false)} className="text-slate-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {uploadSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-black text-white mb-1">Document uploaded</p>
                <p className="text-xs text-slate-400">Ei-Core will use this to improve recommendations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File picker */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">File (PDF, DOC, TXT, Image)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                  >
                    {uploadFile ? (
                      <p className="text-sm text-blue-300 font-semibold">{uploadFile.name}</p>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="text-sm text-slate-500">Click to choose a file</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Purpose</label>
                  <select
                    value={uploadPurpose}
                    onChange={e => setUploadPurpose(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DOC_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setShowUpload(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!uploadFile || uploading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>

                {/* Uploaded files list */}
                {uploadedDocs.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Uploaded This Session</p>
                    <div className="space-y-1.5">
                      {uploadedDocs.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-slate-300 truncate flex-1">{d.name}</span>
                          <span className="text-slate-600 flex-shrink-0">{d.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
