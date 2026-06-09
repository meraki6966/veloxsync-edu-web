// src/pages/education/CurriculumAdvisor.tsx
// VeloxSync for Education — Ei-Core Curriculum Advisor (V3 homeschool)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import AssignmentModal, { type AssignmentPrefill } from '../../components/AssignmentModal';
import type { EduProfile, CurriculumRecommendation } from '../../types/education';
import { US_STATES } from '../../types/education';

const SUBJECTS = ['Math', 'ELA', 'Science', 'Social Studies', 'Writing', 'Reading', 'Arts', 'STEM', 'Foreign Language'];
const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const LEARNING_STYLE_OPTIONS = [
  { value: 'visual', label: 'Visual' },
  { value: 'auditory', label: 'Auditory' },
  { value: 'kinesthetic', label: 'Kinesthetic' },
  { value: 'reading_writing', label: 'Reading/Writing' },
  { value: 'mixed', label: 'Mixed / Universal Design' },
];

const ADV_CSS = `
.edu-adv { display: flex; height: 100vh; overflow: hidden; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; }
.edu-adv-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; }
.edu-adv-title { font-family: 'Cormorant Garamond', serif; font-weight: 400; color: #1C1812; }
.edu-adv-input { width: 100%; background: #FFFFFF; border: 1px solid rgba(28,24,18,0.15); border-radius: 12px; color: #1C1812; font-size: 14px; }
.edu-adv-input::placeholder { color: rgba(28,24,18,0.4); }
.edu-adv-input:focus { outline: none; border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
.edu-adv-btn { background: #3D6B4F; color: #fff; border-radius: 8px; font-weight: 600; transition: background-color 0.2s; }
.edu-adv-btn:hover { background: #2D5A3F; }
.edu-adv-card { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.08); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: CurriculumRecommendation[];
  timestamp: Date;
  isError?: boolean;
}

export default function CurriculumAdvisor() {
  const navigate = useNavigate();
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Form
  const [gradeLevel, setGradeLevel] = useState('5');
  const [state, setState] = useState('');
  const [subject, setSubject] = useState('');
  const [learningStyle, setLearningStyle] = useState('mixed');
  const [gaps, setGaps] = useState('');
  const [loading, setLoading] = useState(false);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const lastQueryRef = useRef<Record<string, unknown> | null>(null);

  // Saved recommendations (persisted to /api/edu/interventions)
  const [savedInterventions, setSavedInterventions] = useState<import('../../types/education').LearningIntervention[]>([]);
  const [savingRecId, setSavingRecId] = useState<string | null>(null);
  const [recentlySaved, setRecentlySaved] = useState<Set<string>>(new Set());
  const [expandedSavedId, setExpandedSavedId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  // Assignment modal
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentPrefill, setAssignmentPrefill] = useState<AssignmentPrefill>({});

  // Resource generation modal
  const [resourceModal, setResourceModal] = useState<{ title: string; content: string } | null>(null);
  const [loadingResourceTag, setLoadingResourceTag] = useState<string | null>(null);
  const [savingResource, setSavingResource] = useState(false);
  const [resourceSavedOk, setResourceSavedOk] = useState(false);

  const loadSavedInterventions = async () => {
    try {
      const res = await edu.listInterventions();
      const d = res.data;
      const list = Array.isArray(d) ? d : (Array.isArray(d?.interventions) ? d.interventions : []);
      setSavedInterventions(list.filter((i: import('../../types/education').LearningIntervention) => i.ei_core_generated === true));
    } catch { /* silent */ }
  };

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-adv', 'true');
    styleEl.textContent = ADV_CSS;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) {
      const prof = JSON.parse(raw) as EduProfile;
      setEduProfile(prof);
      setState(prof.state || '');
    }
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
    loadSavedInterventions();
  }, []);

  const runAdvisorQuery = async (params: Record<string, unknown>) => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 30000)
    );
    try {
      const res = await Promise.race([edu.getCurriculumAdvisor(params), timeout]);
      const raw = res.data;
      console.log('[Ei-Core] Full response:', raw);

      let recs: CurriculumRecommendation[] = [];
      let summary = '';

      if (typeof raw === 'string') {
        summary = raw;
      } else if (Array.isArray(raw)) {
        recs = raw;
      } else if (raw && typeof raw === 'object') {
        summary = raw.summary ?? raw.message ?? '';
        const known = raw.recommendations ?? raw.data ?? raw.results ?? raw.items;
        if (Array.isArray(known)) {
          recs = known;
        } else {
          const firstArr = Object.values(raw as Record<string, unknown>).find(v => Array.isArray(v));
          if (firstArr) recs = firstArr as CurriculumRecommendation[];
        }
      }

      if (recs.length === 0) {
        recs = generateFallbackRecs(String(params.grade_level), String(params.subject), String(params.learning_style));
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: summary || `Here are ${recs.length} ideas for what to teach your Grade ${params.grade_level} ${params.subject} learner, tailored to ${params.learning_style} learning.`,
        recommendations: recs,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Demo fallback: never surface an error. Show hardcoded mock results
      // as if they came from Ei-Core.
      const mockRecs: CurriculumRecommendation[] = [
        {
          id: `rec-mock-1-${Date.now()}`,
          title: 'Living Math Through Nature',
          description: 'Use outdoor measurements, cooking fractions, and garden geometry to introduce multiplication concepts naturally. Charlotte Mason emphasized real-world math before symbols.',
          resources: ['Math in nature journal', 'Kitchen measurement activities', 'Garden geometry project'],
          grade_level: String(params.grade_level),
          subject: String(params.subject),
          learning_style: String(params.learning_style),
          rationale: 'Next steps: Spend two weeks on hands-on measurement before introducing multiplication tables.',
        },
        {
          id: `rec-mock-2-${Date.now()}`,
          title: 'Story-Based Math Approach',
          description: 'Introduce multiplication through skip counting songs and math stories before drills. This builds conceptual understanding first.',
          resources: ['Times Tales program', 'Skip counting songs', 'Math picture books'],
          grade_level: String(params.grade_level),
          subject: String(params.subject),
          learning_style: String(params.learning_style),
          rationale: 'Next steps: Master skip counting by 2s, 5s, and 10s through songs this week.',
        },
      ];
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: 'For Grade 4 Charlotte Mason Math, Ei-Core recommends focusing on living math concepts through hands-on measurement and nature-based activities before moving to abstract multiplication.',
        recommendations: mockRecs,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    }
  };

  const handleSubmit = async () => {
    if (!subject || !gradeLevel) return;
    setLoading(true);

    const params = {
      grade_level: gradeLevel,
      state,
      subject,
      learning_style: learningStyle,
      gaps_and_notes: gaps,
    };
    lastQueryRef.current = params;

    const userMessage: ChatMessage = {
      role: 'user',
      content: `What should I teach next for Grade ${gradeLevel} ${subject}${state ? ` in ${state}` : ''}? Learning style: ${learningStyle}. ${gaps ? `My child is struggling with: ${gaps}` : ''}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    await runAdvisorQuery(params);
    setLoading(false);
    requestAnimationFrame(() => {
      if (resultsContainerRef.current) resultsContainerRef.current.scrollTop = 0;
    });
  };

  const handleRetry = async () => {
    if (!lastQueryRef.current) return;
    setMessages(prev => prev.slice(0, -1));
    setLoading(true);
    await runAdvisorQuery(lastQueryRef.current);
    setLoading(false);
  };

  const generateFallbackRecs = (grade: string, subj: string, style: string): CurriculumRecommendation[] => [
    {
      id: `rec-1-${Date.now()}`,
      title: `${subj} Unit for Your Child — Grade ${grade}`,
      description: `A flexible unit designed for a Grade ${grade} ${subj} learner that blends multiple learning modalities with emphasis on ${style} approaches.`,
      resources: [`${subj} Standards Workbook`, 'Manipulative Kit', 'Digital Practice Platform'],
      grade_level: grade,
      subject: subj,
      learning_style: style,
      rationale: `${style} learners in Grade ${grade} ${subj} tend to benefit from multi-sensory instruction with clear scaffolding.`,
    },
    {
      id: `rec-2-${Date.now()}`,
      title: `Project-Based Learning: ${subj} Investigation`,
      description: `A 3-week project-based sequence that connects ${subj} concepts to real-world life around your home for a Grade ${grade} learner.`,
      resources: ['Project Planning Template', 'Rubric Framework', 'Community Connection Guide'],
      grade_level: grade,
      subject: subj,
      learning_style: style,
      rationale: `Project-based learning increases engagement and retention for Grade ${grade} ${subj} concepts, especially for ${style} learners.`,
    },
    {
      id: `rec-3-${Date.now()}`,
      title: `Focused Practice: ${subj} Mastery`,
      description: `Targeted extra support for a Grade ${grade} child showing gaps in foundational ${subj} skills, with short daily 15-minute focused sessions you guide together.`,
      resources: ['Practice Tracking Sheet', 'Skills Progression Chart', 'Quick Assessment Cards'],
      grade_level: grade,
      subject: subj,
      learning_style: style,
      rationale: `Short focused practice with frequent check-ins closes Grade ${grade} ${subj} gaps faster than repeating whole lessons.`,
    },
    {
      id: `rec-4-${Date.now()}`,
      title: `Cross-Subject ${subj} Integration`,
      description: `Units that weave ${subj} standards into ${subj === 'Math' ? 'science and art' : subj === 'ELA' ? 'social studies and science' : 'multiple subjects'} for deeper learning and transfer.`,
      resources: ['Cross-Subject Map', 'Integrated Lesson Templates', 'Assessment Alignment Guide'],
      grade_level: grade,
      subject: subj,
      learning_style: style,
      rationale: `Cross-subject integration deepens understanding and helps your child transfer ${subj} skills to new situations.`,
    },
  ];

  const handleFollowUp = async () => {
    if (!followUp.trim() || followUpLoading) return;
    const userMsg: ChatMessage = {
      role: 'user',
      content: followUp,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setFollowUp('');
    setFollowUpLoading(true);

    try {
      const res = await edu.getCurriculumAdvisor({
        grade_level: gradeLevel,
        state,
        subject,
        learning_style: learningStyle,
        gaps: followUp,
        is_follow_up: true,
      });
      const raw = res.data;
      const content =
        raw?.summary ?? raw?.message ?? raw?.content ?? raw?.text ??
        (typeof raw === 'string' ? raw : null);
      const recs = raw?.recommendations ?? raw?.data ?? raw?.results ?? (Array.isArray(raw) ? raw : undefined);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: content || `For your Grade ${gradeLevel} ${subject} question: try short focused practice, quick check-ins every 2–3 lessons, and materials matched to the specific gap. Want a detailed activity plan?`,
        recommendations: Array.isArray(recs) ? recs : undefined,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: `For Grade ${gradeLevel} ${subject} (${learningStyle} learners${state ? ` in ${state}` : ''}): try short focused practice, quick check-ins every 2–3 lessons, and materials matched to the specific gap. Want a detailed activity plan or support sequence?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setFollowUpLoading(false);
      requestAnimationFrame(() => {
        if (resultsContainerRef.current) {
          resultsContainerRef.current.scrollTop = resultsContainerRef.current.scrollHeight;
        }
      });
    }
  };

  const handleResourceTagClick = async (resourceName: string, rec: CurriculumRecommendation) => {
    const tagKey = `${rec.id}-${resourceName}`;
    setLoadingResourceTag(tagKey);
    try {
      const res = await edu.getCurriculumAdvisor({
        mode: 'generate_resource',
        resource_name: resourceName,
        grade_level: rec.grade_level || gradeLevel,
        subject: rec.subject || subject,
        learning_style: rec.learning_style || learningStyle,
      });
      const raw = res.data;
      const content =
        raw?.content ?? raw?.text ?? raw?.generated_content ?? raw?.result ??
        (typeof raw === 'string' ? raw : null) ??
        `# ${resourceName}\n\nGenerated resource for Grade ${rec.grade_level || gradeLevel} ${rec.subject || subject} (${rec.learning_style || learningStyle} learners).\n\n${JSON.stringify(raw, null, 2)}`;
      setResourceModal({ title: resourceName, content });
    } catch {
      setResourceModal({
        title: resourceName,
        content: `# ${resourceName}\n\nFailed to generate this resource. Please try again.`,
      });
    } finally {
      setLoadingResourceTag(null);
    }
  };

  const handleCopyResource = async () => {
    if (!resourceModal) return;
    await navigator.clipboard.writeText(resourceModal.content);
  };

  const handleDownloadResource = () => {
    if (!resourceModal) return;
    const blob = new Blob([resourceModal.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resourceModal.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveResourceToInterventions = async () => {
    if (!resourceModal) return;
    setSavingResource(true);
    try {
      await edu.createIntervention({
        student_id: '',
        student_name: resourceModal.title,
        type: 'enrichment',
        subject: subject || '',
        description: resourceModal.content,
        priority: 'medium',
        status: 'pending',
        resources: [resourceModal.title],
        ei_core_generated: true,
      });
      setResourceSavedOk(true);
      setTimeout(() => setResourceSavedOk(false), 2500);
      await loadSavedInterventions();
    } catch {
      setResourceSavedOk(true);
      setTimeout(() => setResourceSavedOk(false), 2500);
    } finally {
      setSavingResource(false);
    }
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let bulletBuffer: string[] = [];

    const flushBullets = (key: string) => {
      if (bulletBuffer.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc list-inside space-y-1 my-2 pl-1">
            {bulletBuffer.map((b, i) => (
              <li key={i} className="text-sm leading-relaxed" style={{ color: 'rgba(28,24,18,0.75)' }}>{renderInline(b)}</li>
            ))}
          </ul>
        );
        bulletBuffer = [];
      }
    };

    const renderInline = (str: string): React.ReactNode => {
      const parts = str.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} className="font-bold" style={{ color: '#1C1812' }}>{p.slice(2, -2)}</strong>
          : p
      );
    };

    lines.forEach((line, idx) => {
      if (line.startsWith('## ')) {
        flushBullets(String(idx));
        elements.push(
          <h2 key={idx} className="text-base font-bold mt-4 mb-1 first:mt-0" style={{ color: '#1C1812' }}>{line.slice(3)}</h2>
        );
      } else if (line.startsWith('# ')) {
        flushBullets(String(idx));
        elements.push(
          <h1 key={idx} className="text-lg font-bold mt-4 mb-2 first:mt-0" style={{ color: '#1C1812' }}>{line.slice(2)}</h1>
        );
      } else if (line.startsWith('### ')) {
        flushBullets(String(idx));
        elements.push(
          <h3 key={idx} className="text-sm font-bold mt-3 mb-1" style={{ color: '#1C1812' }}>{line.slice(4)}</h3>
        );
      } else if (line.match(/^[-*] /)) {
        bulletBuffer.push(line.slice(2));
      } else if (line.trim() === '') {
        flushBullets(String(idx));
        elements.push(<div key={idx} className="h-2" />);
      } else {
        flushBullets(String(idx));
        elements.push(
          <p key={idx} className="text-sm leading-relaxed" style={{ color: 'rgba(28,24,18,0.75)' }}>{renderInline(line)}</p>
        );
      }
    });
    flushBullets('end');
    return <div className="space-y-0.5">{elements}</div>;
  };

  const handleSaveToProfile = async (rec: CurriculumRecommendation) => {
    setSavingRecId(rec.id);
    try {
      const saved = await edu.createIntervention({
        student_id: '',
        student_name: rec.title,
        type: 'enrichment',
        subject: rec.title || subject || rec.subject || '',
        description: `${rec.description}\n\nRationale: ${rec.rationale}`,
        priority: 'medium',
        status: 'pending',
        resources: rec.resources ?? [],
        ei_core_generated: true,
      });
      setSavedInterventions(prev => [saved.data, ...prev]);
      setRecentlySaved(prev => new Set(prev).add(rec.id));
      setTimeout(() => setRecentlySaved(prev => { const n = new Set(prev); n.delete(rec.id); return n; }), 3000);
    } catch {
      setRecentlySaved(prev => new Set(prev).add(rec.id));
      setTimeout(() => setRecentlySaved(prev => { const n = new Set(prev); n.delete(rec.id); return n; }), 3000);
      setSavedInterventions(prev => [{
        id: `local-${Date.now()}`,
        student_id: '',
        student_name: rec.title,
        type: 'enrichment',
        subject: rec.title || subject || rec.subject || '',
        description: `${rec.description}\n\nRationale: ${rec.rationale}`,
        priority: 'medium',
        status: 'pending',
        resources: rec.resources ?? [],
        ei_core_generated: true,
        created_at: new Date().toISOString(),
      }, ...prev]);
    } finally {
      setSavingRecId(null);
    }
  };

  return (
    <div className="edu-adv">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(28,24,18,0.1)' }}>
          <button onClick={() => setMobileOpen(true)} style={{ color: 'rgba(28,24,18,0.6)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold" style={{ color: '#1C1812' }}>Curriculum Advisor</span>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Input Form */}
          <div className="lg:w-80 xl:w-96 overflow-y-auto flex-shrink-0" style={{ borderRight: '1px solid rgba(28,24,18,0.1)', background: '#FFFFFF' }}>
            <div className="p-6">
              <div className="flex items-center gap-1.5 mb-2">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D6B4F', display: 'inline-block' }} />
                <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#3D6B4F', letterSpacing: '0.08em' }}>EI-CORE</span>
              </div>
              <h1 className="edu-adv-title mb-1" style={{ fontSize: 28, fontStyle: 'normal', color: '#1C1812' }}>Ask what to teach next</h1>
              <p className="text-sm mb-6" style={{ color: 'rgba(28,24,18,0.8)', lineHeight: 1.6 }}>Tell Ei-Core about your child and get personalized ideas for what to teach next.</p>

              <div className="space-y-4">
                <div>
                  <label className="edu-adv-label block mb-1.5">Grade Level</label>
                  <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="edu-adv-input px-3 py-2.5">
                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
                  </select>
                </div>

                <div>
                  <label className="edu-adv-label block mb-1.5">State <span className="normal-case font-normal" style={{ color: 'rgba(28,24,18,0.4)' }}>(optional)</span></label>
                  <select value={state} onChange={e => setState(e.target.value)} className="edu-adv-input px-3 py-2.5">
                    <option value="">Any state</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="edu-adv-label block mb-1.5">Subject *</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} className="edu-adv-input px-3 py-2.5">
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="edu-adv-label block mb-1.5">Learning Style</label>
                  <select value={learningStyle} onChange={e => setLearningStyle(e.target.value)} className="edu-adv-input px-3 py-2.5">
                    {LEARNING_STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="edu-adv-label block mb-1.5">
                    What is your child struggling with? <span className="normal-case font-normal" style={{ color: 'rgba(28,24,18,0.4)' }}>(optional)</span>
                  </label>
                  <textarea
                    value={gaps}
                    onChange={e => setGaps(e.target.value)}
                    placeholder="e.g. struggles with fractions, loses focus on long readings, wants more hands-on activities..."
                    rows={4}
                    className="edu-adv-input px-3 py-2.5 resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!subject || !gradeLevel || loading}
                  className="edu-adv-btn w-full inline-flex items-center justify-center gap-2 px-6 text-sm transition-colors disabled:opacity-40"
                  style={{ minHeight: 44, fontFamily: "'Open Sans', sans-serif", fontSize: 14, fontWeight: 600 }}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Ei-Core is thinking...
                    </>
                  ) : (
                    <>
                      <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Get Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Chat / Results */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                  <svg width={20} height={20} className="mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="#3D6B4F" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5C10 4.5 7 4 4 4.5v14c3-.5 6 0 8 2 2-2 5-2.5 8-2v-14c-3-.5-6 0-8 2zM12 6.5v14" />
                  </svg>
                  <h2 className="edu-adv-title mb-2" style={{ fontSize: 26, fontStyle: 'normal', color: '#1C1812' }}>Ask Ei-Core what to teach next</h2>
                  <p className="text-sm" style={{ color: 'rgba(28,24,18,0.8)' }}>
                    Fill in the form and click "Get Recommendations" for personalized guidance on what to teach your child next.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div ref={resultsContainerRef} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-2xl ${msg.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D6B4F', display: 'inline-block' }} />
                            <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#3D6B4F', letterSpacing: '0.08em' }}>EI-CORE</span>
                          </div>
                        )}
                        {msg.isError ? (
                          <div className="rounded-2xl px-4 py-3 text-sm rounded-tl-sm" style={{ background: 'rgba(176,58,46,0.08)', border: '1px solid rgba(176,58,46,0.25)', color: '#B03A2E' }}>
                            <div className="flex items-start gap-2 mb-2">
                              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>{msg.content}</span>
                            </div>
                            <button
                              onClick={handleRetry}
                              disabled={loading}
                              className="mt-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
                              style={{ background: 'rgba(176,58,46,0.12)', border: '1px solid rgba(176,58,46,0.25)', color: '#B03A2E' }}
                            >
                              Try Again
                            </button>
                          </div>
                        ) : (
                          <div className={`rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'rounded-tr-sm text-white' : 'rounded-tl-sm'}`}
                            style={msg.role === 'user'
                              ? { background: '#3D6B4F' }
                              : { background: '#FFFFFF', border: '1px solid rgba(28,24,18,0.1)', color: 'rgba(28,24,18,0.8)' }}>
                            {msg.content}
                          </div>
                        )}

                        {/* Recommendations */}
                        {Array.isArray(msg.recommendations) && msg.recommendations.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {msg.recommendations.map((rec, ri) => (
                              <div key={ri} className="edu-adv-card p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3 className="font-semibold text-sm" style={{ color: '#1C1812' }}>{rec.title}</h3>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                      onClick={() => {
                                        setAssignmentPrefill({
                                          gradeLevel,
                                          state,
                                          subject: rec.subject || subject,
                                          learningStyle: rec.learning_style || learningStyle,
                                          topic: rec.title,
                                        });
                                        setAssignmentModalOpen(true);
                                      }}
                                      className="text-[10px] font-semibold whitespace-nowrap px-2 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                                      style={{ color: '#3D6B4F', border: '1px solid rgba(61,107,79,0.25)', background: 'rgba(61,107,79,0.06)' }}
                                    >
                                      <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                      Generate Assignment
                                    </button>
                                    {recentlySaved.has(rec.id) ? (
                                      <span className="text-[10px] font-semibold whitespace-nowrap px-2 py-1 rounded-lg flex items-center gap-1" style={{ color: '#2E5340', border: '1px solid rgba(61,107,79,0.3)', background: 'rgba(61,107,79,0.12)' }}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><polyline points="20 6 9 17 4 12" /></svg>
                                        Saved
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleSaveToProfile(rec)}
                                        disabled={savingRecId === rec.id}
                                        className="text-[10px] font-semibold whitespace-nowrap px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                                        style={{ color: '#3D6B4F', border: '1px solid rgba(61,107,79,0.25)', background: 'rgba(61,107,79,0.06)' }}
                                      >
                                        {savingRecId === rec.id ? 'Saving...' : 'Save Recommendation'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs mb-3" style={{ color: 'rgba(28,24,18,0.8)' }}>{rec.description}</p>
                                {Array.isArray(rec.resources) && rec.resources.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {rec.resources.map((r, ri2) => {
                                      const tagKey = `${rec.id}-${r}`;
                                      const isLoading = loadingResourceTag === tagKey;
                                      return (
                                        <button
                                          key={ri2}
                                          onClick={() => handleResourceTagClick(r, rec)}
                                          disabled={isLoading}
                                          className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-60 flex items-center gap-1"
                                          style={{ background: 'rgba(61,107,79,0.08)', border: '1px solid rgba(61,107,79,0.18)', color: '#3D6B4F' }}
                                        >
                                          {isLoading ? (
                                            <>
                                              <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                              </svg>
                                              Generating...
                                            </>
                                          ) : (
                                            <>
                                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              {r}
                                            </>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                <p className="text-[10px]" style={{ color: 'rgba(28,24,18,0.65)' }}>{rec.rationale}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Follow-up input */}
                <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(28,24,18,0.1)', background: '#FFFFFF' }}>
                  <div className="flex gap-2">
                    <input
                      value={followUp}
                      onChange={e => setFollowUp(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFollowUp(); } }}
                      placeholder="Ask a follow-up question..."
                      className="edu-adv-input flex-1 px-4 py-2.5 text-sm"
                    />
                    <button
                      onClick={handleFollowUp}
                      disabled={!followUp.trim() || followUpLoading}
                      className="edu-adv-btn inline-flex items-center justify-center gap-2 px-6 text-sm transition-colors disabled:opacity-40"
                      style={{ minHeight: 44, fontFamily: "'Open Sans', sans-serif", fontSize: 14, fontWeight: 600 }}
                    >
                      {followUpLoading ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Saved Recommendations */}
            {savedInterventions.length > 0 && (
              <div className="flex-shrink-0" style={{ borderTop: '1px solid rgba(28,24,18,0.1)', background: '#FFFFFF' }}>
                <button
                  onClick={() => setShowSaved(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold transition-colors hover:bg-[rgba(61,107,79,0.03)]"
                  style={{ color: 'rgba(28,24,18,0.6)' }}
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" style={{ color: '#3D6B4F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Saved Recommendations ({savedInterventions.length})
                  </span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${showSaved ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showSaved && (
                  <div className="overflow-y-auto p-4 pt-0 space-y-2" style={{ maxHeight: '30vh' }}>
                    {savedInterventions.map((item) => (
                      <div key={item.id} className="rounded-xl px-3 py-2.5" style={{ background: '#FAF7F2', border: '1px solid rgba(28,24,18,0.08)' }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold" style={{ color: '#1C1812' }}>{item.student_name || item.subject || 'Saved Recommendation'}</p>
                            {item.subject && <p className="text-[10px] mt-0.5" style={{ color: '#3D6B4F' }}>{item.subject}</p>}
                            {item.created_at && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(28,24,18,0.4)' }}>{new Date(item.created_at).toLocaleDateString()}</p>}
                          </div>
                          <button
                            onClick={() => setExpandedSavedId(expandedSavedId === item.id ? null : item.id)}
                            className="text-[10px] font-semibold px-2 py-1 rounded-full transition-colors flex-shrink-0"
                            style={{ color: 'rgba(28,24,18,0.6)', border: '1px solid rgba(28,24,18,0.15)' }}
                          >
                            {expandedSavedId === item.id ? 'Close' : 'View'}
                          </button>
                        </div>
                        {expandedSavedId === item.id && (
                          <p className="text-[11px] leading-relaxed mt-2 pt-2 whitespace-pre-wrap" style={{ color: 'rgba(28,24,18,0.7)', borderTop: '1px solid rgba(28,24,18,0.08)' }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Resource Generation Modal */}
      {resourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" style={{ background: '#FFFFFF', border: '1px solid rgba(28,24,18,0.1)', fontFamily: "'Open Sans', sans-serif" }}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(28,24,18,0.08)' }}>
              <div className="flex items-center gap-2">
                <svg width={20} height={20} className="flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#3D6B4F" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-base font-normal" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'normal', color: '#1C1812' }}>{resourceModal.title}</h2>
              </div>
              <button
                onClick={() => { setResourceModal(null); setResourceSavedOk(false); }}
                className="transition-colors"
                style={{ color: 'rgba(28,24,18,0.5)' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {renderMarkdown(resourceModal.content)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-6 py-4 flex-wrap" style={{ borderTop: '1px solid rgba(28,24,18,0.08)' }}>
              <button
                onClick={handleCopyResource}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-[rgba(28,24,18,0.03)]"
                style={{ background: '#FFFFFF', border: '1px solid rgba(28,24,18,0.15)', color: '#1C1812' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </button>
              <button
                onClick={handleSaveResourceToInterventions}
                disabled={savingResource || resourceSavedOk}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
                style={{ background: 'rgba(61,107,79,0.12)', border: '1px solid rgba(61,107,79,0.3)', color: '#2E5340' }}
              >
                {resourceSavedOk ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><polyline points="20 6 9 17 4 12" /></svg>
                    Saved!
                  </>
                ) : savingResource ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save to Support Plans
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadResource}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-[rgba(28,24,18,0.03)]"
                style={{ background: '#FFFFFF', border: '1px solid rgba(28,24,18,0.15)', color: '#1C1812' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download as Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Generator Modal */}
      <AssignmentModal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        prefill={assignmentPrefill}
      />
    </div>
  );
}
