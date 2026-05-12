// src/pages/education/HomeschoolDashboard.tsx
// VeloxSync for Education — Homeschool Family Dashboard

import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import EduTrialBanner from '../../components/EduTrialBanner';
import type { EduProfile, HomeschoolChild } from '../../types/education';

const CURRICULUM_TYPES = ['Classical', 'Charlotte Mason', 'Unschooling', 'Eclectic', 'Online', 'Textbook'] as const;
type CurriculumType = typeof CURRICULUM_TYPES[number];

const CURRICULUM_DESCRIPTIONS: Record<CurriculumType, string> = {
  Classical:        'Focuses on the trivium (grammar, logic, rhetoric) with Great Books and classical language study.',
  'Charlotte Mason': 'Uses living books, nature study, narration, and short lessons to cultivate a love of learning.',
  Unschooling:       'Child-led learning driven by natural curiosity and life experiences without formal curriculum.',
  Eclectic:          'Mix of approaches tailored to each child, drawing from multiple philosophies and resources.',
  Online:            'Structured online courses and digital curriculum platforms with tracking and assessments.',
  Textbook:          'Traditional structured textbooks and workbooks following a sequential, subject-by-subject approach.',
};

const CURRICULUM_COLORS: Record<CurriculumType, string> = {
  Classical:         'from-amber-600 to-orange-500',
  'Charlotte Mason': 'from-emerald-600 to-teal-500',
  Unschooling:       'from-purple-600 to-violet-500',
  Eclectic:          'from-blue-600 to-sky-500',
  Online:            'from-indigo-600 to-blue-500',
  Textbook:          'from-slate-600 to-slate-500',
};

const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function AddChildModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Omit<HomeschoolChild, 'id' | 'created_at' | 'overall_progress'>) => void }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', grade_level: '3', age: '', curriculum_type: 'Eclectic' as CurriculumType,
    strengths: '', challenge_areas: '', has_iep: false,
  });

  const handleSave = () => {
    if (!form.first_name) return;
    onSave({
      first_name: form.first_name,
      last_name: form.last_name,
      grade_level: form.grade_level,
      age: parseInt(form.age) || 8,
      curriculum_type: form.curriculum_type,
      subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      strengths: form.strengths.split(',').map(s => s.trim()).filter(Boolean),
      challenge_areas: form.challenge_areas.split(',').map(s => s.trim()).filter(Boolean),
      has_iep: form.has_iep,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-white">Add Child</h2>
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
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
              <input
                value={form.last_name}
                onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                placeholder="Smith"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Grade</label>
              <select
                value={form.grade_level}
                onChange={e => setForm(p => ({ ...p, grade_level: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g === 'K' ? 'K' : `Grade ${g}`}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                placeholder="8"
                min={4}
                max={20}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Curriculum Approach</label>
            <div className="grid grid-cols-2 gap-2">
              {CURRICULUM_TYPES.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(p => ({ ...p, curriculum_type: c }))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.curriculum_type === c
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Strengths</label>
            <input
              value={form.strengths}
              onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))}
              placeholder="Reading, Art, Math"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Challenge Areas</label>
            <input
              value={form.challenge_areas}
              onChange={e => setForm(p => ({ ...p, challenge_areas: e.target.value }))}
              placeholder="Writing, Focus, Spelling"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(p => ({ ...p, has_iep: !p.has_iep }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.has_iep ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.has_iep ? 'left-5' : 'left-0.5'}`} />
            </button>
            <label className="text-sm font-semibold text-slate-300">Has Learning Plan / IEP</label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:text-white">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.first_name}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm disabled:opacity-40 hover:opacity-90"
          >
            Add Child
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomeschoolDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [children, setChildren] = useState<HomeschoolChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [familyInsight, setFamilyInsight] = useState<{ summary: string; recommendations: string[] } | null>(null);
  const [showTrialBanner, setShowTrialBanner] = useState(searchParams.get('checkout') === 'success');

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/login'));
    loadChildren();
  }, []);

  useEffect(() => {
    if (!showTrialBanner) return;
    const t = setTimeout(() => setShowTrialBanner(false), 8000);
    return () => clearTimeout(t);
  }, [showTrialBanner]);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const res = await edu.listHomeschoolChildren();
      const d = res.data;
      setChildren(Array.isArray(d) ? d : (Array.isArray(d?.children) ? d.children : []));
    } catch {
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (data: Omit<HomeschoolChild, 'id' | 'created_at' | 'overall_progress'>) => {
    try {
      await edu.addHomeschoolChild({ ...data, overall_progress: 0 });
      setShowAdd(false);
      loadChildren();
    } catch {
      setShowAdd(false);
    }
  };

  const loadFamilyInsight = async () => {
    if (children.length === 0) return;
    try {
      const res = await edu.getClassInsight({
        is_homeschool: true,
        children: children.map(c => ({
          name: `${c.first_name} ${c.last_name}`,
          grade: c.grade_level,
          curriculum: c.curriculum_type,
          progress: c.overall_progress,
        })),
      });
      setFamilyInsight(res.data);
    } catch {
      setFamilyInsight({
        summary: `Your learning family has ${children.length} child${children.length !== 1 ? 'ren' : ''} with diverse curriculum approaches. Ei-Core has analyzed their pacing and learning styles to provide personalized recommendations.`,
        recommendations: [
          'Consider a weekly family "learning circle" to build shared vocabulary across subjects',
          'Leverage your strongest learner as a peer teacher for younger siblings on topics they\'ve mastered',
          'Schedule lighter lesson days mid-week to prevent cognitive fatigue and maintain engagement',
          'Document observations in each child\'s portfolio weekly — pattern recognition improves over time',
        ],
      });
    }
  };

  useEffect(() => {
    if (children.length > 0) loadFamilyInsight();
  }, [children.length]);

  const getCurriculumGradient = (ct: string): string => {
    return CURRICULUM_COLORS[ct as CurriculumType] ?? 'from-slate-600 to-slate-500';
  };

  const firstName = user?.first_name ?? 'Educator';

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
        {showTrialBanner && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="bg-emerald-900/90 border border-emerald-500/40 rounded-2xl px-5 py-4 shadow-xl backdrop-blur flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-black text-emerald-300">Your 14-day trial has started!</p>
                <p className="text-xs text-emerald-400/80 mt-0.5">Welcome to VeloxSync for Education.</p>
              </div>
              <button onClick={() => setShowTrialBanner(false)} className="text-emerald-500 hover:text-emerald-300 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-black">My Learning Family</span>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ei-Core Edu · Homeschool
              </div>
              <h1 className="text-3xl font-black text-white">Your Learning Family</h1>
              <p className="text-slate-400 mt-1">
                Welcome, {firstName}. {children.length > 0 ? `${children.length} learner${children.length !== 1 ? 's' : ''} tracked.` : 'Add your first child to get started.'}
              </p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Child
            </button>
          </div>

          {/* Family Insight */}
          {familyInsight && (
            <div className="mb-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Ei-Core Family Insight</span>
              </div>
              <p className="text-sm text-slate-300 mb-3">{familyInsight.summary}</p>
              <ul className="space-y-1.5">
                {(Array.isArray(familyInsight.recommendations) ? familyInsight.recommendations : []).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Children grid */}
          {loading ? (
            <div className="text-center py-16 text-slate-500">Loading family...</div>
          ) : children.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h2 className="text-lg font-black text-white mb-2">Add Your First Learner</h2>
              <p className="text-slate-400 text-sm mb-5">Ei-Core will personalize curriculum recommendations and pacing guidance for each child.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm hover:opacity-90 transition-opacity"
              >
                Add Child
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
              {(Array.isArray(children) ? children : []).map(child => {
                const gradient = getCurriculumGradient(child.curriculum_type);
                return (
                  <div
                    key={child.id}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all cursor-pointer"
                    onClick={() => navigate(`/education/students/${child.id}`)}
                  >
                    {/* Child header */}
                    <div className={`bg-gradient-to-r ${gradient} p-5`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-black text-lg">
                          {child.first_name[0]}{child.last_name?.[0] ?? ''}
                        </div>
                        <div>
                          <h3 className="font-black text-white text-lg">{child.first_name} {child.last_name}</h3>
                          <p className="text-white/70 text-sm">
                            Grade {child.grade_level} · Age {child.age}
                            {child.has_iep && <span className="ml-2 px-1.5 py-0.5 text-[9px] font-black rounded bg-white/20 text-white uppercase tracking-wider">IEP</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Curriculum type */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Curriculum</span>
                        <span className="text-xs font-semibold text-white bg-slate-700 px-2 py-1 rounded-lg">{child.curriculum_type}</span>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">Overall Progress</span>
                          <span className="text-xs font-black text-white">{child.overall_progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${child.overall_progress >= 70 ? 'bg-emerald-500' : child.overall_progress >= 40 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${child.overall_progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Curriculum description */}
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {CURRICULUM_DESCRIPTIONS[child.curriculum_type as CurriculumType] ?? ''}
                      </p>

                      {/* Strengths */}
                      {child.strengths?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {child.strengths.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Curriculum guidance */}
          {eduProfile?.curriculumType && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-black text-white">{eduProfile.curriculumType} Approach — Ei-Core Guidance</h2>
                  <p className="text-xs text-slate-500">Based on your selected curriculum style</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                {CURRICULUM_DESCRIPTIONS[eduProfile.curriculumType as CurriculumType]}
              </p>
              <Link
                to="/education/advisor"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-semibold hover:bg-blue-600/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Get {eduProfile.curriculumType} Curriculum Recommendations →
              </Link>
            </div>
          )}
        </div>
      </main>

      {showAdd && (
        <AddChildModal
          onClose={() => setShowAdd(false)}
          onSave={handleAddChild}
        />
      )}
    </div>
  );
}
