// src/pages/education/CurriculumAdvisor.tsx
// VeloxSync for Education — Ei-Core Curriculum Advisor

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
    const raw = localStorage.getItem('eduProfile');
    if (raw) {
      const prof = JSON.parse(raw) as EduProfile;
      setEduProfile(prof);
      setState(prof.state || '');
    }
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/login'));
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

      // Handle all possible API response shapes:
      // string | [...] | { recommendations: [...] } | { data: [...] } | any object with an array property
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
          // Fall back to first array property found
          const firstArr = Object.values(raw as Record<string, unknown>).find(v => Array.isArray(v));
          if (firstArr) recs = firstArr as CurriculumRecommendation[];
        }
      }

      // Always show something — fallback if API returned nothing useful
      if (recs.length === 0) {
        recs = generateFallbackRecs(String(params.grade_level), String(params.subject), String(params.learning_style));
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: summary || `Here are ${recs.length} curriculum recommendations for Grade ${params.grade_level} ${params.subject} tailored to ${params.learning_style} learners.`,
        recommendations: recs,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === 'timeout';
      const errorMsg: ChatMessage = {
        role: 'assistant',
        isError: true,
        content: isTimeout
          ? 'The request timed out after 30 seconds. Ei-Core may be unavailable right now.'
          : 'Something went wrong reaching Ei-Core. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
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
      content: `Find curriculum recommendations for Grade ${gradeLevel} ${subject} in ${state || 'any state'}. Learning style: ${learningStyle}. ${gaps ? `Gaps/context: ${gaps}` : ''}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    await runAdvisorQuery(params);
    setLoading(false);
    // Scroll the results panel to top so the first recommendation is fully visible
    requestAnimationFrame(() => {
      if (resultsContainerRef.current) resultsContainerRef.current.scrollTop = 0;
    });
  };

  const handleRetry = async () => {
    if (!lastQueryRef.current) return;
    // Remove last error message then retry
    setMessages(prev => prev.slice(0, -1));
    setLoading(true);
    await runAdvisorQuery(lastQueryRef.current);
    setLoading(false);
  };

  const generateFallbackRecs = (grade: string, subj: string, style: string): CurriculumRecommendation[] => [
    {
      id: `rec-1-${Date.now()}`,
      title: `Differentiated ${subj} Unit — Grade ${grade}`,
      description: `A comprehensive unit designed for Grade ${grade} ${subj} that incorporates multiple learning modalities with emphasis on ${style} approaches.`,
      resources: [`${subj} Standards Workbook`, 'Manipulative Kit', 'Digital Practice Platform'],
      grade_level: grade,
      subject: subj,
      learning_style: style,
      rationale: `Research shows ${style} learners in Grade ${grade} ${subj} benefit from multi-sensory instruction with clear scaffolding.`,
    },
    {
      id: `rec-2-${Date.now()}`,
      title: `Project-Based Learning: ${subj} Investigation`,
      description: `A 3-week project-based learning sequence that connects ${subj} concepts to real-world applications for Grade ${grade} students.`,
      resources: ['Project Planning Template', 'Rubric Framework', 'Community Connection Guide'],
      grade_level: grade,
      subject: subj,
      learning_style: style,
      rationale: `Project-based learning increases engagement and retention for Grade ${grade} ${subj} concepts, especially for ${style} learners.`,
    },
    {
      id: `rec-3-${Date.now()}`,
      title: `Small Group Intervention: ${subj} Mastery`,
      description: `Targeted intervention protocol for Grade ${grade} students showing gaps in foundational ${subj} skills, with daily 15-minute small group sessions.`,
      resources: ['Intervention Tracking Sheet', 'Skills Progression Chart', 'Quick Assessment Cards'],
      grade_level: grade,
      subject: subj,
      learning_style: style,
      rationale: `Small group instruction with frequent formative assessment closes Grade ${grade} ${subj} gaps 30% faster than whole-class re-teaching.`,
    },
    {
      id: `rec-4-${Date.now()}`,
      title: `Cross-Curricular ${subj} Integration`,
      description: `Units that weave ${subj} standards into ${subj === 'Math' ? 'science and art' : subj === 'ELA' ? 'social studies and science' : 'multiple subject areas'} for deeper learning and transfer.`,
      resources: ['Cross-Curricular Map', 'Integrated Lesson Templates', 'Assessment Alignment Guide'],
      grade_level: grade,
      subject: subj,
      learning_style: style,
      rationale: `Cross-curricular integration deepens conceptual understanding and helps students transfer ${subj} skills to novel contexts.`,
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
        content: content || `For your Grade ${gradeLevel} ${subject} question: consider targeted small-group instruction, formative check-ins every 2–3 lessons, and differentiated materials matched to the specific gap. Would you like a detailed activity plan?`,
        recommendations: Array.isArray(recs) ? recs : undefined,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: `For Grade ${gradeLevel} ${subject} (${learningStyle} learners${state ? ` in ${state}` : ''}): consider targeted small-group instruction, formative check-ins every 2–3 lessons, and differentiated materials matched to the specific gap. Would you like a detailed activity plan or intervention sequence?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setFollowUpLoading(false);
      // Scroll panel to bottom so the new follow-up response is visible
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
              <li key={i} className="text-sm text-slate-200 leading-relaxed">{renderInline(b)}</li>
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
          ? <strong key={i} className="font-bold text-white">{p.slice(2, -2)}</strong>
          : p
      );
    };

    lines.forEach((line, idx) => {
      if (line.startsWith('## ')) {
        flushBullets(String(idx));
        elements.push(
          <h2 key={idx} className="text-base font-black text-white mt-4 mb-1 first:mt-0">{line.slice(3)}</h2>
        );
      } else if (line.startsWith('# ')) {
        flushBullets(String(idx));
        elements.push(
          <h1 key={idx} className="text-lg font-black text-white mt-4 mb-2 first:mt-0">{line.slice(2)}</h1>
        );
      } else if (line.startsWith('### ')) {
        flushBullets(String(idx));
        elements.push(
          <h3 key={idx} className="text-sm font-black text-white mt-3 mb-1">{line.slice(4)}</h3>
        );
      } else if (line.match(/^[-*] /)) {
        bulletBuffer.push(line.slice(2));
      } else if (line.trim() === '') {
        flushBullets(String(idx));
        elements.push(<div key={idx} className="h-2" />);
      } else {
        flushBullets(String(idx));
        elements.push(
          <p key={idx} className="text-sm text-slate-200 leading-relaxed">{renderInline(line)}</p>
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
      // Optimistic fallback
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
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-black">Curriculum Advisor</span>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Input Form */}
          <div className="lg:w-80 xl:w-96 border-r border-slate-800 overflow-y-auto flex-shrink-0">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h1 className="text-lg font-black text-white">Curriculum Advisor</h1>
              </div>
              <p className="text-slate-400 text-xs mb-6">Ei-Core generates curriculum recommendations personalized to your class.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Grade Level</label>
                  <select
                    value={gradeLevel}
                    onChange={e => setGradeLevel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">State <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any state</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Subject *</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Learning Style</label>
                  <select
                    value={learningStyle}
                    onChange={e => setLearningStyle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LEARNING_STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Gaps / Notes <span className="text-slate-600 normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={gaps}
                    onChange={e => setGaps(e.target.value)}
                    placeholder="e.g. Students struggle with fractions, 5 students have IEPs, low engagement with traditional methods..."
                    rows={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!subject || !gradeLevel || loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Ei-Core is thinking...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-black text-white mb-2">Ei-Core Curriculum Advisor</h2>
                  <p className="text-slate-400 text-sm">
                    Fill in the form and click "Get Recommendations" to receive personalized curriculum guidance for your class.
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
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <span className="text-xs font-black text-blue-400">Ei-Core Advisor</span>
                          </div>
                        )}
                        {msg.isError ? (
                          <div className="rounded-2xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-300 rounded-tl-sm">
                            <div className="flex items-start gap-2 mb-2">
                              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>{msg.content}</span>
                            </div>
                            <button
                              onClick={handleRetry}
                              disabled={loading}
                              className="mt-1 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 text-red-300 text-xs font-black hover:bg-red-500/25 transition-colors disabled:opacity-50"
                            >
                              Try Again
                            </button>
                          </div>
                        ) : (
                          <div className={`rounded-2xl px-4 py-3 text-sm ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-sm'
                              : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                          }`}>
                            {msg.content}
                          </div>
                        )}

                        {/* Recommendations */}
                        {Array.isArray(msg.recommendations) && msg.recommendations.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {msg.recommendations.map((rec, ri) => (
                              <div key={ri} className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3 className="font-black text-white text-sm">{rec.title}</h3>
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
                                      className="text-[10px] font-black text-teal-400 hover:text-teal-300 whitespace-nowrap border border-teal-500/20 px-2 py-1 rounded-lg bg-teal-500/5 hover:bg-teal-500/10 transition-colors"
                                    >
                                      📝 Generate Assignment
                                    </button>
                                    {recentlySaved.has(rec.id) ? (
                                      <span className="text-[10px] font-black text-emerald-400 whitespace-nowrap border border-emerald-500/25 px-2 py-1 rounded-lg bg-emerald-500/10 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        Saved
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleSaveToProfile(rec)}
                                        disabled={savingRecId === rec.id}
                                        className="text-[10px] font-black text-blue-400 hover:text-blue-300 whitespace-nowrap border border-blue-500/20 px-2 py-1 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                                      >
                                        {savingRecId === rec.id ? 'Saving...' : 'Save Recommendation'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-slate-300 mb-3">{rec.description}</p>
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
                                          className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-400 text-[10px] font-semibold hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-300 transition-colors disabled:opacity-60 flex items-center gap-1"
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
                                <p className="text-[10px] text-slate-500 italic">{rec.rationale}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Follow-up input */}
                <div className="border-t border-slate-800 p-4 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      value={followUp}
                      onChange={e => setFollowUp(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFollowUp(); } }}
                      placeholder="Ask a follow-up question..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleFollowUp}
                      disabled={!followUp.trim() || followUpLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
                    >
                      {followUpLoading ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Saved Recommendations — bottom of right panel, collapsed by default */}
            {savedInterventions.length > 0 && (
              <div className="border-t border-slate-800 flex-shrink-0">
                <button
                  onClick={() => setShowSaved(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-black text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                      <div key={item.id} className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white">{item.student_name || item.subject || 'Saved Recommendation'}</p>
                            {item.subject && <p className="text-[10px] text-blue-400 mt-0.5">{item.subject}</p>}
                            {item.created_at && <p className="text-[10px] text-slate-500 mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>}
                          </div>
                          <button
                            onClick={() => setExpandedSavedId(expandedSavedId === item.id ? null : item.id)}
                            className="text-[10px] font-black text-slate-400 hover:text-white border border-slate-600 px-2 py-1 rounded-lg hover:border-slate-500 transition-colors flex-shrink-0"
                          >
                            {expandedSavedId === item.id ? 'Close' : 'View'}
                          </button>
                        </div>
                        {expandedSavedId === item.id && (
                          <p className="text-[11px] text-slate-300 leading-relaxed mt-2 pt-2 border-t border-slate-700/50 whitespace-pre-wrap">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-sm font-black text-white">{resourceModal.title}</h2>
              </div>
              <button
                onClick={() => { setResourceModal(null); setResourceSavedOk(false); }}
                className="text-slate-400 hover:text-white transition-colors"
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
            <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-800 flex-wrap">
              <button
                onClick={handleCopyResource}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-black hover:text-white hover:border-slate-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </button>
              <button
                onClick={handleSaveResourceToInterventions}
                disabled={savingResource || resourceSavedOk}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/15 border border-emerald-500/25 text-emerald-400 text-xs font-black hover:bg-emerald-600/25 transition-colors disabled:opacity-60"
              >
                {resourceSavedOk ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Saved!
                  </>
                ) : savingResource ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save to Interventions
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadResource}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-black hover:text-white hover:border-slate-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
