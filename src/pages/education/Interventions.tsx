// src/pages/education/Interventions.tsx
// VeloxSync for Education — Support Plans (V3 homeschool)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile, HomeschoolChild, LearningIntervention } from '../../types/education';

const TYPE_OPTIONS = ['enrichment', 'remediation', 'accommodation', 'extension'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved'];

const INT_CSS = `
.edu-int { display: flex; height: 100vh; overflow: hidden; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; }
.edu-int-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; }
.edu-int-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; line-height: 1.1; color: #1C1812; }
.edu-int-card { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1); border-radius: 16px; box-shadow: 0 2px 12px rgba(28,24,18,0.04); }
.edu-int-input { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.15); border-radius: 12px; color: #1C1812; font-size: 14px; }
.edu-int-input::placeholder { color: rgba(28,24,18,0.4); }
.edu-int-input:focus { outline: none; border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
.edu-int-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; }
.edu-int-btn { background: #3D6B4F; color: #fff; border-radius: 9999px; font-weight: 600; }
.edu-int-btn:hover { opacity: 0.92; }
`;

// soft pill badges — green positive, amber warning, red risk, neutral
const PRIORITY_BADGE: Record<string, string> = {
  urgent:  'bg-[rgba(176,58,46,0.1)] text-[#B03A2E] border-[rgba(176,58,46,0.25)]',
  high:    'bg-[rgba(176,58,46,0.1)] text-[#B03A2E] border-[rgba(176,58,46,0.25)]',
  medium:  'bg-[rgba(180,120,20,0.12)] text-[#9A6A12] border-[rgba(180,120,20,0.25)]',
  low:     'bg-[rgba(28,24,18,0.06)] text-[rgba(28,24,18,0.6)] border-[rgba(28,24,18,0.15)]',
};

const TYPE_BADGE: Record<string, string> = {
  enrichment:    'bg-[rgba(61,107,79,0.1)] text-[#3D6B4F] border-[rgba(61,107,79,0.25)]',
  remediation:   'bg-[rgba(176,58,46,0.1)] text-[#B03A2E] border-[rgba(176,58,46,0.25)]',
  accommodation: 'bg-[rgba(61,107,79,0.1)] text-[#3D6B4F] border-[rgba(61,107,79,0.25)]',
  extension:     'bg-[rgba(61,107,79,0.1)] text-[#3D6B4F] border-[rgba(61,107,79,0.25)]',
};

const STATUS_BADGE: Record<string, string> = {
  pending:     'bg-[rgba(180,120,20,0.12)] text-[#9A6A12] border-[rgba(180,120,20,0.25)]',
  in_progress: 'bg-[rgba(61,107,79,0.1)] text-[#3D6B4F] border-[rgba(61,107,79,0.25)]',
  resolved:    'bg-[rgba(61,107,79,0.14)] text-[#2E5340] border-[rgba(61,107,79,0.3)]',
};

function buildMockInterventions(children: HomeschoolChild[]): LearningIntervention[] {
  if (children.length === 0) return [];
  const types = ['remediation', 'accommodation', 'enrichment', 'extension'] as const;
  const priorities = ['high', 'medium', 'low', 'high'] as const;
  const statuses = ['pending', 'in_progress', 'resolved'] as const;
  return children.slice(0, 6).map((s, i) => ({
    id: `mock-${i}`,
    student_id: s.id,
    student_name: `${s.first_name} ${s.last_name}`,
    type: types[i % types.length],
    priority: priorities[i % priorities.length],
    description: `Ei-Core recommendation: Provide focused practice for Grade ${s.grade_level} standards. Build on foundational skills with materials matched to how your child learns best.`,
    resources: ['Differentiated Worksheet', 'Manipulative Kit', 'Guided Practice with You'],
    status: statuses[i % statuses.length],
    created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  }));
}

export default function Interventions() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [interventions, setInterventions] = useState<LearningIntervention[]>([]);
  const [children, setChildren] = useState<HomeschoolChild[]>([]);
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
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-int', 'true');
    styleEl.textContent = INT_CSS;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [intRes, childRes] = await Promise.allSettled([edu.listInterventions(), edu.listHomeschoolChildren()]);
      if (intRes.status === 'fulfilled') {
        const d = intRes.value.data;
        const list = Array.isArray(d) ? d : (Array.isArray(d?.interventions) ? d.interventions : (Array.isArray(d?.data) ? d.data : []));
        setInterventions(list);
        if (childRes.status === 'fulfilled') {
          const sd = childRes.value.data;
          const sl: HomeschoolChild[] = Array.isArray(sd) ? sd : (Array.isArray(sd?.children) ? sd.children : []);
          setChildren(sl);
          if (list.length === 0) setInterventions(buildMockInterventions(sl));
        }
      } else {
        const sd = childRes.status === 'fulfilled' ? childRes.value.data : null;
        const sl: HomeschoolChild[] = Array.isArray(sd) ? sd : (Array.isArray(sd?.children) ? sd.children : []);
        setChildren(sl);
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
    const child = children.find(s => s.id === addForm.student_id);
    const payload = {
      ...addForm,
      student_name: child ? `${child.first_name} ${child.last_name}` : '',
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
    <div className="edu-int">
      <EducationSidebar user={user} eduProfile={eduProfile} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(28,24,18,0.1)' }}>
          <button onClick={() => setMobileOpen(true)} style={{ color: 'rgba(28,24,18,0.6)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold" style={{ color: '#1C1812' }}>Support Plans</span>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
            <div>
              <div className="edu-int-eyebrow mb-2">EI-CORE</div>
              <h1 className="edu-int-title">Support Plans</h1>
              <p className="text-sm mt-2" style={{ color: 'rgba(28,24,18,0.6)' }}>Track, manage, and resolve focused support plans for your children.</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="edu-int-btn flex items-center gap-2 px-5 py-2.5 text-sm transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Support Plan
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            {[
              { label: 'Type', value: filterType, setter: setFilterType, options: TYPE_OPTIONS },
              { label: 'Priority', value: filterPriority, setter: setFilterPriority, options: PRIORITY_OPTIONS },
              { label: 'Status', value: filterStatus, setter: setFilterStatus, options: STATUS_OPTIONS },
            ].map(f => (
              <select
                key={f.label}
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                className="edu-int-input px-3 py-2 text-sm"
              >
                <option value="">All {f.label}s</option>
                {f.options.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
              </select>
            ))}
            {(filterType || filterPriority || filterStatus) && (
              <button
                onClick={() => { setFilterType(''); setFilterPriority(''); setFilterStatus(''); }}
                className="px-3 py-2 rounded-full text-xs transition-colors"
                style={{ color: 'rgba(28,24,18,0.6)', border: '1px solid rgba(28,24,18,0.15)' }}
              >
                Clear filters
              </button>
            )}
            <span className="ml-auto text-xs self-center" style={{ color: 'rgba(28,24,18,0.45)' }}>{filtered.length} plans</span>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-16" style={{ color: 'rgba(28,24,18,0.45)' }}>Loading support plans...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'rgba(28,24,18,0.4)' }}>No support plans found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(item => (
                <div key={item.id} className="edu-int-card overflow-hidden">
                  {/* Row */}
                  <button
                    className="w-full flex flex-wrap items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[rgba(61,107,79,0.03)]"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm" style={{ color: '#1C1812' }}>{item.student_name || 'Family Support Plan'}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${TYPE_BADGE[item.type] ?? TYPE_BADGE['remediation']}`}>
                          {item.type}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${PRIORITY_BADGE[item.priority] ?? PRIORITY_BADGE['medium']}`}>
                          {item.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${STATUS_BADGE[item.status ?? ''] ?? STATUS_BADGE['pending']}`}>
                          {(item.status ?? 'pending').replace('_', ' ')}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded uppercase tracking-wider" style={{ background: 'rgba(61,107,79,0.1)', color: '#3D6B4F', border: '1px solid rgba(61,107,79,0.2)' }}>Ei-Core</span>
                      </div>
                      <p className="text-xs mt-1 truncate" style={{ color: 'rgba(28,24,18,0.5)' }}>{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs" style={{ color: 'rgba(28,24,18,0.4)' }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                      <svg className={`w-4 h-4 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} style={{ color: 'rgba(28,24,18,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expandedId === item.id && (
                    <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid rgba(28,24,18,0.08)' }}>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(28,24,18,0.75)' }}>{item.description}</p>
                      {Array.isArray(item.resources) && item.resources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.resources.map((r, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-[10px] font-semibold" style={{ background: 'rgba(61,107,79,0.08)', color: '#3D6B4F', border: '1px solid rgba(61,107,79,0.18)' }}>{r}</span>
                          ))}
                        </div>
                      )}
                      {(item.status ?? 'pending') !== 'resolved' && (
                        <button
                          onClick={() => handleResolve(item.id)}
                          className="px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                          style={{ background: 'rgba(61,107,79,0.12)', color: '#2E5340', border: '1px solid rgba(61,107,79,0.3)' }}
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

      {/* Add Support Plan Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="rounded-2xl w-full max-w-lg p-6" style={{ background: '#FFFFFF', border: '1px solid rgba(28,24,18,0.1)', fontFamily: "'Open Sans', sans-serif" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-normal" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1C1812' }}>Add Support Plan</h2>
              <button onClick={() => setShowAdd(false)} style={{ color: 'rgba(28,24,18,0.5)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="edu-int-label block mb-1.5">Child *</label>
                <select
                  value={addForm.student_id}
                  onChange={e => setAddForm(p => ({ ...p, student_id: e.target.value }))}
                  className="edu-int-input w-full px-4 py-2.5"
                >
                  <option value="">Select child...</option>
                  {children.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="edu-int-label block mb-1.5">Type</label>
                  <select
                    value={addForm.type}
                    onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))}
                    className="edu-int-input w-full px-3 py-2.5"
                  >
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="edu-int-label block mb-1.5">Priority</label>
                  <select
                    value={addForm.priority}
                    onChange={e => setAddForm(p => ({ ...p, priority: e.target.value }))}
                    className="edu-int-input w-full px-3 py-2.5"
                  >
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="edu-int-label block mb-1.5">Subject</label>
                <input
                  value={addForm.subject}
                  onChange={e => setAddForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Math, ELA, Science"
                  className="edu-int-input w-full px-4 py-2.5"
                />
              </div>

              <div>
                <label className="edu-int-label block mb-1.5">Recommendation / Description *</label>
                <textarea
                  value={addForm.description}
                  onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the support plan and recommended approach..."
                  className="edu-int-input w-full px-4 py-2.5 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAdd(false)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                style={{ border: '1px solid rgba(28,24,18,0.15)', color: 'rgba(28,24,18,0.6)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !addForm.student_id || !addForm.description}
                className="edu-int-btn flex-1 py-2.5 text-sm disabled:opacity-40 transition-opacity"
              >
                {saving ? 'Saving...' : 'Add Support Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
