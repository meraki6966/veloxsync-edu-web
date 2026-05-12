// src/pages/education/EduOnboarding.tsx
// VeloxSync for Education — onboarding wizard

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EduProfile } from '../../types/education';
import { US_STATES } from '../../types/education';

const CURRICULUM_TYPES = [
  'Classical', 'Charlotte Mason', 'Unschooling', 'Eclectic', 'Online', 'Textbook',
] as const;

const GRADE_BANDS = ['K-2', '3-5', '6-8', '9-12'] as const;

type Role = 'teacher' | 'homeschool' | 'admin';

// EduOnboarding uses the same auth as the main app — all /education/* routes are wrapped
// in PrivateRoute (token check). No separate edu login exists; founder@adammcclarin.com
// and any logged-in VeloxSync user can access the education module directly.
export default function EduOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Safety belt: redirect to login if no token (handles direct URL access outside PrivateRoute)
  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login', { replace: true });
  }, []);
  const [role, setRole] = useState<Role | null>(null);
  const [state, setState] = useState('');
  const [schoolType, setSchoolType] = useState<'public' | 'private' | 'charter'>('public');
  const [gradeBand, setGradeBand] = useState<typeof GRADE_BANDS[number]>('K-2');
  const [curriculumType, setCurriculumType] = useState<typeof CURRICULUM_TYPES[number]>('Classical');
  const [classroomName, setClassroomName] = useState('');
  const [firstChildName, setFirstChildName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!state) return;
    setStep(3);
  };

  const handleComplete = () => {
    setSaving(true);
    const profile: EduProfile = {
      role: role!,
      state,
      schoolType: role === 'teacher' || role === 'admin' ? schoolType : undefined,
      gradeBand: role === 'teacher' || role === 'admin' ? gradeBand : undefined,
      curriculumType: role === 'homeschool' ? curriculumType : undefined,
      classroomName: role !== 'homeschool' ? classroomName || 'My Classroom' : undefined,
      firstChildName: role === 'homeschool' ? firstChildName || 'Child 1' : undefined,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem('eduProfile', JSON.stringify(profile));
    setTimeout(() => {
      if (role === 'homeschool') {
        navigate('/education/homeschool');
      } else {
        navigate('/education');
      }
    }, 400);
  };

  const roleCards: Array<{ role: Role; title: string; desc: string; icon: string; gradient: string }> = [
    {
      role: 'teacher',
      title: 'Classroom Teacher',
      desc: 'K-12 teacher managing a classroom of students with state curriculum standards.',
      icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
      gradient: 'from-blue-600 to-sky-500',
    },
    {
      role: 'homeschool',
      title: 'Homeschool Parent',
      desc: 'Homeschooling one or more children with your chosen curriculum approach.',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      gradient: 'from-purple-600 to-violet-500',
    },
    {
      role: 'admin',
      title: 'School Administrator',
      desc: 'Administrator overseeing multiple classrooms, teachers, and school-wide standards.',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      gradient: 'from-emerald-600 to-teal-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            VeloxSync for Education
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Welcome to Ei-Core Edu</h1>
          <p className="text-slate-400">Let's set up your education intelligence module.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                s < step ? 'bg-blue-600 border-blue-600 text-white' :
                s === step ? 'border-blue-500 text-blue-400 bg-blue-500/10' :
                'border-slate-700 text-slate-600'
              }`}>
                {s < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && <div className={`w-16 h-0.5 ${s < step ? 'bg-blue-600' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Role selection */}
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-center text-lg font-black text-white mb-6">I am a...</h2>
            {roleCards.map(card => (
              <button
                key={card.role}
                onClick={() => handleRoleSelect(card.role)}
                className="w-full flex items-center gap-5 p-5 rounded-2xl border border-slate-700/50 bg-slate-800/40 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-white font-black text-base">{card.title}</div>
                  <div className="text-slate-400 text-sm mt-0.5">{card.desc}</div>
                </div>
                <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-black text-white mb-6">
              {role === 'homeschool' ? 'Your Homeschool Setup' : 'Your School Setup'}
            </h2>
            <div className="space-y-4">
              {/* State */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">State</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your state...</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {(role === 'teacher' || role === 'admin') && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">School Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['public', 'private', 'charter'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setSchoolType(t)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${
                            schoolType === t
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Grade Band</label>
                    <div className="grid grid-cols-4 gap-2">
                      {GRADE_BANDS.map(g => (
                        <button
                          key={g}
                          onClick={() => setGradeBand(g)}
                          className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                            gradeBand === g
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {role === 'homeschool' && (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Curriculum Approach</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CURRICULUM_TYPES.map(c => (
                      <button
                        key={c}
                        onClick={() => setCurriculumType(c)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          curriculumType === c
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStep2Next}
                disabled={!state}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Create classroom / Add first child */}
        {step === 3 && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-black text-white mb-2">
              {role === 'homeschool' ? 'Add Your First Child' : 'Create Your First Classroom'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {role === 'homeschool'
                ? "You can add more children later. Ei-Core will personalize recommendations for each learner."
                : "Give your classroom a name. You can add students and set up standards after setup."}
            </p>

            <div className="space-y-4">
              {role === 'homeschool' ? (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Child's First Name</label>
                  <input
                    type="text"
                    value={firstChildName}
                    onChange={e => setFirstChildName(e.target.value)}
                    placeholder="e.g. Emma"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Classroom Name</label>
                  <input
                    type="text"
                    value={classroomName}
                    onChange={e => setClassroomName(e.target.value)}
                    placeholder={`e.g. ${gradeBand} ${role === 'admin' ? 'Overview' : 'Math'}`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">You can rename this anytime in settings.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm disabled:opacity-60 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Setting up...
                  </>
                ) : (
                  <>
                    Launch Ei-Core Edu
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 mt-6">
          VeloxSync for Education · Powered by Ei-Core
        </p>
      </div>
    </div>
  );
}
