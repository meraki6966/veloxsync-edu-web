// src/pages/education/StudentRoster.tsx
// VeloxSync for Education — Student Roster

import { useState, useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile, Student } from '../../types/education';
import { LEARNING_STYLES, GRADE_BAND_CONFIG, getGradeBand } from '../../types/education';

// ── Error Boundary ──────────────────────────────────────────────────────────
class StudentRosterErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen bg-slate-950 items-center justify-center">
          <div className="text-center px-6">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-white font-black text-lg mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-4">Unable to load student roster.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const safeBand = (grade: string) => GRADE_BAND_CONFIG[getGradeBand(grade)] ?? GRADE_BAND_CONFIG['3-5'];

const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function AddStudentModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (s: Omit<Student, 'id' | 'created_at' | 'overall_progress'>) => void;
}) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    grade_level: '5',
    age: '',
    learning_style: 'visual' as Student['learning_style'],
    has_iep: false,
    iep_notes: '',
    strengths: '',
    challenge_areas: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name) return;
    setSaving(true);
    onSave({
      first_name: form.first_name,
      last_name: form.last_name,
      grade_level: form.grade_level,
      age: form.age ? parseInt(form.age) : undefined,
      learning_style: form.learning_style,
      has_iep: form.has_iep,
      iep_notes: form.iep_notes || undefined,
      strengths: form.strengths.split(',').map(s => s.trim()).filter(Boolean),
      challenge_areas: form.challenge_areas.split(',').map(s => s.trim()).filter(Boolean),
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-white">Add Student</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">First Name *</label>
              <input
                value={form.first_name}
                onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                placeholder="Emma"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Last Name *</label>
              <input
                value={form.last_name}
                onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                placeholder="Johnson"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Grade Level</label>
              <select
                value={form.grade_level}
                onChange={e => setForm(p => ({ ...p, grade_level: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                placeholder="10"
                min={4}
                max={20}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Learning Style</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(Object.keys(LEARNING_STYLES) as Student['learning_style'][]).map(ls => (
                <button
                  key={ls}
                  onClick={() => setForm(p => ({ ...p, learning_style: ls }))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.learning_style === ls
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {LEARNING_STYLES[ls].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(p => ({ ...p, has_iep: !p.has_iep }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.has_iep ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.has_iep ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
            </button>
            <label className="text-sm font-semibold text-slate-300">Has Active IEP</label>
          </div>

          {form.has_iep && (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">IEP Notes</label>
              <textarea
                value={form.iep_notes}
                onChange={e => setForm(p => ({ ...p, iep_notes: e.target.value }))}
                placeholder="Describe accommodations and key considerations..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Strengths <span className="text-slate-600 normal-case font-normal">(comma-separated)</span></label>
            <input
              value={form.strengths}
              onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))}
              placeholder="Reading, Problem solving, Creativity"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Challenge Areas <span className="text-slate-600 normal-case font-normal">(comma-separated)</span></label>
            <input
              value={form.challenge_areas}
              onChange={e => setForm(p => ({ ...p, challenge_areas: e.target.value }))}
              placeholder="Math fluency, Written expression"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.first_name || !form.last_name || saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {saving ? 'Adding...' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentRosterInner() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [filterIep, setFilterIep] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/login'));
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await edu.listStudents();
      const d = res?.data ?? res;
      let arr: Student[] = [];
      if (Array.isArray(d)) arr = d;
      else if (Array.isArray(d?.students)) arr = d.students;
      else if (Array.isArray(d?.data)) arr = d.data;
      setStudents(arr.filter(Boolean));
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (data: Omit<Student, 'id' | 'created_at' | 'overall_progress'>) => {
    try {
      await edu.createStudent({ ...data, overall_progress: 0 });
      setShowAdd(false);
      loadStudents();
    } catch {
      // handle error silently, keep modal open
      setShowAdd(false);
    }
  };

  const safeStudents = Array.isArray(students) ? students : [];
  const filtered = safeStudents.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    if (search && !fullName.includes(search.toLowerCase())) return false;
    if (filterGrade && s.grade_level !== filterGrade) return false;
    if (filterStyle && s.learning_style !== filterStyle) return false;
    if (filterIep === 'iep' && !s.has_iep) return false;
    if (filterIep === 'no_iep' && s.has_iep) return false;
    return true;
  });

  const uniqueGrades = [...new Set(safeStudents.map(s => s.grade_level))].sort();

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
          <span className="text-white font-black">Students</span>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white">Student Roster</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {safeStudents.length} student{safeStudents.length !== 1 ? 's' : ''} enrolled
              </p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Student
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative">
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search students..."
                className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
              />
            </div>
            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              {uniqueGrades.map(g => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
            </select>
            <select
              value={filterStyle}
              onChange={e => setFilterStyle(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Learning Styles</option>
              {(Object.keys(LEARNING_STYLES) as Student['learning_style'][]).map(ls => (
                <option key={ls} value={ls}>{LEARNING_STYLES[ls].label}</option>
              ))}
            </select>
            <select
              value={filterIep}
              onChange={e => setFilterIep(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Students</option>
              <option value="iep">IEP Only</option>
              <option value="no_iep">No IEP</option>
            </select>
          </div>

          {/* Student list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-slate-500 text-sm">Loading students...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-500 text-sm mb-3">
                {safeStudents.length === 0
                  ? 'No students yet — add your first student'
                  : 'No students match your filters.'}
              </p>
              {safeStudents.length === 0 && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="text-blue-400 text-sm font-semibold hover:text-blue-300"
                >
                  Add your first student →
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-700/30">
                {filtered.map(student => {
                  const style = LEARNING_STYLES[student.learning_style] ?? LEARNING_STYLES['visual'];
                  const initials = `${student.first_name?.[0] ?? '?'}${student.last_name?.[0] ?? '?'}`;
                  const strengths = Array.isArray(student.strengths) ? student.strengths : [];
                  return (
                    <div
                      key={student.id}
                      onClick={() => navigate(`/education/students/${student.id}`)}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-700/30 cursor-pointer transition-colors"
                    >
                      {(() => {
                        const gb = safeBand(student.grade_level ?? '5');
                        return (
                          <div className={`w-10 h-10 rounded-full ${gb.bg} ring-2 ${gb.ring} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}>
                            {initials}
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">
                            {student.first_name ?? ''} {student.last_name ?? ''}
                          </span>
                          {student.has_iep && (
                            <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 uppercase tracking-wider">
                              IEP
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${style.color}`}>
                            {style.label}
                          </span>
                          {(() => {
                            const gb = safeBand(student.grade_level ?? '5');
                            return (
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${gb.badge}`}>
                                {gb.icon} {gb.label}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Grade {student.grade_level ?? '?'}
                          {student.age ? ` · Age ${student.age}` : ''}
                          {strengths.length > 0 ? ` · Strengths: ${strengths.slice(0, 2).join(', ')}` : ''}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-black text-white">{student.overall_progress}%</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Progress</div>
                        </div>
                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              student.overall_progress >= 70 ? 'bg-emerald-500' :
                              student.overall_progress >= 40 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.overall_progress}%` }}
                          />
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {showAdd && (
        <AddStudentModal
          onClose={() => setShowAdd(false)}
          onSave={handleAddStudent}
        />
      )}
    </div>
  );
}

export default function StudentRoster() {
  return (
    <StudentRosterErrorBoundary>
      <StudentRosterInner />
    </StudentRosterErrorBoundary>
  );
}
