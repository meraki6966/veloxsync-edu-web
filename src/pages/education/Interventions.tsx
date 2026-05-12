// src/pages/education/Interventions.tsx
// VeloxSync for Education — Interventions Tracker

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile, Student, LearningIntervention } from '../../types/education';

const TYPE_OPTIONS = ['enrichment', 'remediation', 'accommodation', 'extension'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved'];

const PRIORITY_BADGE: Record<string, string> = {
  urgent:  'bg-red-500/15 text-red-300 border-red-500/25',
  high:    'bg-orange-500/15 text-orange-300 border-orange-500/25',
  medium:  'bg-amber-500/15 text-amber-300 border-amber-500/25',
  low:     'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

const TYPE_BADGE: Record<string, string> = {
  enrichment:    'bg-violet-500/15 text-violet-300 border-violet-500/25',
  remediation:   'bg-red-500/15 text-red-300 border-red-500/25',
  accommodation: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  extension:     'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
};

const STATUS_BADGE: Record<string, string> = {
  pending:     'bg-amber-500/15 text-amber-300 border-amber-500/25',
  in_progress: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  resolved:    'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
};

function buildMockInterventions(students: Student[]): LearningIntervention[] {
  if (students.length === 0) return [];
  const types = ['remediation', 'accommodation', 'enrichment', 'extension'] as const;
  const priorities = ['high', 'medium', 'low', 'high'] as const;
  const statuses = ['pending', 'in_progress', 'resolved'] as const;
  return students.slice(0, 6).map((s, i) => ({
    id: `mock-${i}`,
    student_id: s.id,
    student_name: `${s.first_name} ${s.last_name}`,
    type: types[i % types.length],
    priority: priorities[i % priorities.length],
    description: `Ei-Core recommendation: Provide targeted support for Grade ${s.grade_level} standards. Focus on foundational gaps and use differentiated materials matched to ${s.learning_style} learning style.`,
    resources: ['Differentiated Worksheet', 'Manipulative Kit', 'Peer Tutoring Guide'],
    status: statuses[i % statuses.length],
    created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  }));
}

export default function Interventions() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [interventions, setInterventions] = useState<LearningIntervention[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Add form
  const [addForm, setAddForm] = useState({ student_id: '', type: 'remediation', subject: '', description: '', priority: 'medium' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/login'));
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [intRes, studRes] = await Promise.allSettled([edu.listInterventions(), edu.listStudents()]);
      if (intRes.status === 'fulfilled') {
        const d = intRes.value.data;
        const list = Array.isArray(d) ? d : (Array.isArray(d?.interventions) ? d.interventions : (Array.isArray(d?.data) ? d.data : []));
        setInterventions(list);
        if (studRes.status === 'fulfilled') {
          const sd = studRes.value.data;
          const sl = Array.isArray(sd) ? sd : (Array.isArray(sd?.students) ? sd.students : []);
          setStudents(sl);
          if (list.length === 0) setInterventions(buildMockInterventions(sl));
        }
      } else {
        const sd = studRes.status === 'fulfilled' ? studRes.value.data : null;
        const sl = Array.isArray(sd) ? sd : (Array.isArray(sd?.students) ? sd.students : []);
        setStudents(sl);
        setInterventions(buildMockInterventions(sl));
      }
    } catch {
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await edu.resolveIntervention(id, { status: 'resolved' });
    } catch { /* silent */ }
    setInterventions(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' as const } : i));
  };

  const handleAdd = async () => {
    if (!addForm.student_id || !addForm.description) return;
    setSaving(true);
    const student = students.find(s => s.id === addForm.student_id);
    const payload = {
      ...addForm,
      student_name: student ? `${student.first_name} ${student.last_name}` : '',
      status: 'pending',
      resources: [],
    };
    try {
      const res = await edu.createIntervention(payload);
      setInterventions(prev => [res.data, ...prev]);
    } catch {
      // Optimistic add
      setInterventions(prev => [{
        id: `local-${Date.now()}`,
        ...payload,
        priority: addForm.priority as LearningIntervention['priority'],
        type: addForm.type as LearningIntervention['type'],
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      }, ...prev]);
    }
    setSaving(false);
    setShowAdd(false);
    setAddForm({ student_id: '', type: 'remediation', subject: '', description: '', priority: 'medium' });
  };

  const safeInterventions = Array.isArray(interventions) ? interventions.filter(Boolean) : [];
  const filtered = safeInterventions.filter(i => {
    if (filterType && i.type !== filterType) return false;
    if (filterPriority && i.priority !== filterPriority) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

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
          <span className="text-white font-black">Interventions</span>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Ei-Core Edu</div>
              <h1 className="text-3xl font-black text-white">Interventions</h1>
              <p className="text-slate-400 text-sm mt-1">Track, manage, and resolve student support interventions.</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Intervention
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { label: 'Type', value: filterType, setter: setFilterType, options: TYPE_OPTIONS },
              { label: 'Priority', value: filterPriority, setter: setFilterPriority, options: PRIORITY_OPTIONS },
              { label: 'Status', value: filterStatus, setter: setFilterStatus, options: STATUS_OPTIONS },
            ].map(f => (
              <select
                key={f.label}
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All {f.label}s</option>
                {f.options.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
              </select>
            ))}
            {(filterType || filterPriority || filterStatus) && (
              <button
                onClick={() => { setFilterType(''); setFilterPriority(''); setFilterStatus(''); }}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white border border-slate-700 transition-colors"
              >
                Clear filters
              </button>
            )}
            <span className="ml-auto text-xs text-slate-500 self-center">{filtered.length} interventions</span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-16 text-slate-500">Loading interventions...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-600">No interventions found.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(item => (
                <div key={item.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                  {/* Row */}
                  <button
                    className="w-full flex flex-wrap items-center gap-3 px-5 py-4 text-left hover:bg-slate-700/30 transition-colors"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{item.student_name || 'General Intervention'}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border capitalize ${TYPE_BADGE[item.type] ?? TYPE_BADGE['remediation']}`}>
                          {item.type}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border capitalize ${PRIORITY_BADGE[item.priority] ?? PRIORITY_BADGE['medium']}`}>
                          {item.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${STATUS_BADGE[item.status ?? ''] ?? STATUS_BADGE['pending']}`}>
                          {(item.status ?? 'pending').replace('_', ' ')}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-wider">Ei-Core</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-slate-600">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                      <svg className={`w-4 h-4 text-slate-500 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expandedId === item.id && (
                    <div className="border-t border-slate-700/50 px-5 py-4 space-y-3">
                      <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                      {Array.isArray(item.resources) && item.resources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.resources.map((r, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-400 text-[10px] font-semibold">{r}</span>
                          ))}
                        </div>
                      )}
                      {(item.status ?? 'pending') !== 'resolved' && (
                        <button
                          onClick={() => handleResolve(item.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-black hover:bg-emerald-500/25 transition-colors"
                        >
                          ✓ Mark Resolved
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Intervention Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white">Add Intervention</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Student *</label>
                <select
                  value={addForm.student_id}
                  onChange={e => setAddForm(p => ({ ...p, student_id: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={addForm.type}
                    onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={addForm.priority}
                    onChange={e => setAddForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  value={addForm.subject}
                  onChange={e => setAddForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Math, ELA, Science"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Recommendation / Description *</label>
                <textarea
                  value={addForm.description}
                  onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the intervention and recommended approach..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAdd(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !addForm.student_id || !addForm.description}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {saving ? 'Saving...' : 'Add Intervention'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
