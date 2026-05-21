// src/pages/education/HomeschoolDashboard.tsx
// VeloxSync for Education — Homeschool Family Dashboard (V3 cream/green design)

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const DASHBOARD_CSS = `
.edu-dash { display: flex; min-height: 100vh; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; }
.edu-dash-main { flex: 1; overflow-y: auto; min-width: 0; }

.edu-dash-mobile-bar { display: none; }
@media (max-width: 767px) {
  .edu-dash-mobile-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; border-bottom: 1px solid rgba(28,24,18,0.08);
    background: #FAF7F2;
  }
  .edu-dash-mobile-bar button { background: none; border: none; color: #1C1812; padding: 0; cursor: pointer; }
  .edu-dash-mobile-bar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; font-weight: 500; color: #1C1812;
  }
}

.edu-dash-content {
  padding: 48px 56px;
  max-width: 1080px; margin: 0 auto;
}
@media (max-width: 767px) { .edu-dash-content { padding: 24px 18px; } }

.edu-dash-toast {
  position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
  z-index: 50; width: calc(100% - 32px); max-width: 420px;
  background: #FFFFFF; border: 1px solid rgba(61,107,79,0.3);
  border-left: 4px solid #3D6B4F;
  border-radius: 12px; padding: 14px 16px;
  box-shadow: 0 12px 32px rgba(28,24,18,0.12);
  display: flex; align-items: flex-start; gap: 12px;
}
.edu-dash-toast-icon { color: #3D6B4F; flex-shrink: 0; margin-top: 2px; }
.edu-dash-toast-text { flex: 1; min-width: 0; }
.edu-dash-toast-title { font-size: 13px; font-weight: 700; color: #3D6B4F; }
.edu-dash-toast-sub { font-size: 12px; color: rgba(28,24,18,0.6); margin-top: 2px; }
.edu-dash-toast-close { background: none; border: none; cursor: pointer; color: rgba(28,24,18,0.4); padding: 0; flex-shrink: 0; }
.edu-dash-toast-close:hover { color: #1C1812; }

.edu-dash-header {
  display: flex; flex-direction: column;
  gap: 16px; margin-bottom: 36px;
}
@media (min-width: 768px) {
  .edu-dash-header { flex-direction: row; align-items: center; justify-content: space-between; }
}
.edu-dash-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: #3D6B4F; margin-bottom: 8px;
}
.edu-dash-eyebrow svg { width: 12px; height: 12px; }
.edu-dash-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(36px, 4vw, 48px); font-weight: 400;
  line-height: 1.1; color: #1C1812;
}
.edu-dash-title em { font-style: italic; color: #3D6B4F; }
.edu-dash-welcome {
  font-size: 14px; color: rgba(28,24,18,0.6);
  margin-top: 8px; line-height: 1.6;
}
.edu-dash-add-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px; font-weight: 600; color: #FFFFFF;
  background: #3D6B4F; border: none; cursor: pointer;
  padding: 12px 22px; border-radius: 100px;
  transition: background 0.2s;
  align-self: flex-start;
}
.edu-dash-add-btn:hover { background: #5A8F6A; }
.edu-dash-add-btn svg { width: 14px; height: 14px; }

.edu-dash-insight {
  background: #FFFFFF;
  border: 1px solid rgba(28,24,18,0.1);
  border-left: 3px solid #3D6B4F;
  border-radius: 12px;
  padding: 22px 26px;
  margin-bottom: 36px;
  box-shadow: 0 2px 16px rgba(28,24,18,0.05);
}
.edu-dash-insight-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: #3D6B4F; margin-bottom: 10px;
}
.edu-dash-insight-label svg { width: 12px; height: 12px; }
.edu-dash-insight-summary {
  font-size: 14px; color: rgba(28,24,18,0.75);
  line-height: 1.65; margin-bottom: 12px;
}
.edu-dash-insight-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.edu-dash-insight-list li {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 12.5px; color: rgba(28,24,18,0.65); line-height: 1.55;
}
.edu-dash-insight-list li::before {
  content: '→'; color: #3D6B4F; font-weight: 700; flex-shrink: 0;
}

.edu-dash-empty {
  text-align: center; padding: 72px 24px;
  background: #FFFFFF; border: 1px dashed rgba(28,24,18,0.15);
  border-radius: 16px;
}
.edu-dash-empty-icon { color: rgba(61,107,79,0.5); margin-bottom: 16px; }
.edu-dash-empty-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px; font-weight: 500; color: #1C1812; margin-bottom: 8px;
}
.edu-dash-empty-sub { font-size: 13px; color: rgba(28,24,18,0.55); margin-bottom: 20px; }

.edu-dash-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin-bottom: 36px;
}
@media (min-width: 720px) { .edu-dash-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1100px) { .edu-dash-grid { grid-template-columns: repeat(3, 1fr); } }

.edu-dash-child {
  background: #FFFFFF;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 16px rgba(28,24,18,0.04);
  display: flex; flex-direction: column;
}
.edu-dash-child:hover {
  border-color: rgba(61,107,79,0.45);
  box-shadow: 0 8px 28px rgba(28,24,18,0.08);
  transform: translateY(-2px);
}
.edu-dash-child-header {
  padding: 20px 22px;
  background: #EBF2EC;
  border-bottom: 1px solid rgba(61,107,79,0.18);
  display: flex; align-items: center; gap: 12px;
}
.edu-dash-child-avatar {
  width: 44px; height: 44px; border-radius: 10px;
  background: #3D6B4F; color: #FFFFFF;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px;
  flex-shrink: 0;
}
.edu-dash-child-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px; font-weight: 500; color: #1C1812; line-height: 1.15;
}
.edu-dash-child-meta {
  font-size: 12px; color: rgba(28,24,18,0.55); margin-top: 2px;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.edu-dash-iep-pill {
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #FFFFFF;
  background: #3D6B4F; padding: 2px 7px; border-radius: 100px;
}
.edu-dash-child-body { padding: 18px 22px 20px; display: flex; flex-direction: column; gap: 14px; }
.edu-dash-child-row { display: flex; align-items: center; justify-content: space-between; }
.edu-dash-child-row-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(28,24,18,0.5);
}
.edu-dash-child-curriculum {
  font-size: 12px; font-weight: 600; color: #1C1812;
  background: #F3EDE3; padding: 4px 10px; border-radius: 100px;
}
.edu-dash-progress-track {
  width: 100%; height: 6px;
  background: rgba(28,24,18,0.06);
  border-radius: 100px; overflow: hidden;
}
.edu-dash-progress-fill {
  height: 100%; border-radius: 100px;
  transition: width 0.4s ease;
}
.edu-dash-progress-fill.high { background: #3D6B4F; }
.edu-dash-progress-fill.mid { background: #C4831A; }
.edu-dash-progress-fill.low { background: rgba(28,24,18,0.3); }
.edu-dash-child-progress-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 11px; color: rgba(28,24,18,0.5); margin-bottom: 4px;
  font-weight: 500;
}
.edu-dash-child-progress-val { color: #1C1812; font-weight: 700; }
.edu-dash-child-desc { font-size: 12px; color: rgba(28,24,18,0.55); line-height: 1.55; }
.edu-dash-strengths { display: flex; flex-wrap: wrap; gap: 6px; }
.edu-dash-strength-pill {
  font-size: 10px; font-weight: 600;
  background: #EBF2EC; color: #3D6B4F;
  border: 1px solid rgba(61,107,79,0.2);
  padding: 3px 9px; border-radius: 100px;
}

.edu-dash-guidance {
  background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1);
  border-radius: 16px; padding: 28px 32px;
  box-shadow: 0 2px 16px rgba(28,24,18,0.04);
}
.edu-dash-guidance-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.edu-dash-guidance-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: #EBF2EC; color: #3D6B4F;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.edu-dash-guidance-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px; font-weight: 500; color: #1C1812; line-height: 1.2;
}
.edu-dash-guidance-sub { font-size: 12px; color: rgba(28,24,18,0.5); margin-top: 2px; }
.edu-dash-guidance-text {
  font-size: 13px; color: rgba(28,24,18,0.7);
  line-height: 1.65; margin-bottom: 18px;
}
.edu-dash-guidance-link {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: #FFFFFF;
  background: #3D6B4F; padding: 10px 22px; border-radius: 100px;
  text-decoration: none; transition: background 0.2s;
}
.edu-dash-guidance-link:hover { background: #5A8F6A; }
.edu-dash-guidance-link svg { width: 14px; height: 14px; }

.edu-dash-modal-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(28,24,18,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 18px;
  font-family: 'Open Sans', sans-serif;
}
.edu-dash-modal {
  background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1);
  border-radius: 16px; padding: 28px;
  width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 60px rgba(28,24,18,0.2);
}
.edu-dash-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.edu-dash-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 500; color: #1C1812; }
.edu-dash-modal-close { background: none; border: none; color: rgba(28,24,18,0.5); cursor: pointer; padding: 0; }
.edu-dash-modal-close:hover { color: #1C1812; }
.edu-dash-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.edu-dash-modal-field { margin-bottom: 14px; }
.edu-dash-modal-label {
  display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(28,24,18,0.55); margin-bottom: 6px;
}
.edu-dash-modal-input,
.edu-dash-modal-select {
  width: 100%; background: #FAF7F2;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 8px; padding: 11px 14px;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px; color: #1C1812;
  transition: border-color 0.2s;
}
.edu-dash-modal-input:focus,
.edu-dash-modal-select:focus {
  outline: none; border-color: #3D6B4F;
}
.edu-dash-modal-curr {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.edu-dash-modal-curr button {
  font-family: 'Open Sans', sans-serif;
  font-size: 12.5px; font-weight: 500;
  color: rgba(28,24,18,0.7);
  background: #FAF7F2; border: 1px solid rgba(28,24,18,0.1);
  border-radius: 8px; padding: 9px 12px;
  cursor: pointer; transition: all 0.2s;
}
.edu-dash-modal-curr button.on {
  background: #EBF2EC; border-color: #3D6B4F; color: #3D6B4F; font-weight: 600;
}
.edu-dash-modal-toggle-row {
  display: flex; align-items: center; gap: 12px; margin: 8px 0 4px;
}
.edu-dash-modal-toggle {
  position: relative; width: 38px; height: 22px; border-radius: 100px;
  background: rgba(28,24,18,0.15); border: none; cursor: pointer;
  transition: background 0.2s; flex-shrink: 0;
}
.edu-dash-modal-toggle.on { background: #3D6B4F; }
.edu-dash-modal-toggle-dot {
  position: absolute; top: 3px; left: 3px; width: 16px; height: 16px;
  border-radius: 50%; background: #FFFFFF; transition: left 0.2s;
}
.edu-dash-modal-toggle.on .edu-dash-modal-toggle-dot { left: 19px; }
.edu-dash-modal-toggle-label { font-size: 13px; color: rgba(28,24,18,0.7); font-weight: 500; }
.edu-dash-modal-actions { display: flex; gap: 10px; margin-top: 22px; }
.edu-dash-modal-btn {
  font-family: 'Open Sans', sans-serif;
  font-size: 13px; font-weight: 600; border-radius: 100px;
  padding: 11px 20px; cursor: pointer; transition: all 0.2s; border: none;
}
.edu-dash-modal-btn-ghost {
  background: transparent; border: 1.5px solid rgba(28,24,18,0.15);
  color: rgba(28,24,18,0.65);
}
.edu-dash-modal-btn-ghost:hover { border-color: #3D6B4F; color: #3D6B4F; }
.edu-dash-modal-btn-primary {
  flex: 1; background: #3D6B4F; color: #FFFFFF;
}
.edu-dash-modal-btn-primary:hover { background: #5A8F6A; }
.edu-dash-modal-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
`;

let dashStylesInjected = false;
function ensureDashStyles() {
  if (dashStylesInjected) return;
  if (typeof document === 'undefined') return;
  if (document.head.querySelector('style[data-edu-dash]')) {
    dashStylesInjected = true;
    return;
  }
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-edu-dash', 'true');
  styleEl.textContent = DASHBOARD_CSS;
  document.head.appendChild(styleEl);
  dashStylesInjected = true;
}

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
    <div className="edu-dash-modal-overlay">
      <div className="edu-dash-modal">
        <div className="edu-dash-modal-head">
          <h2 className="edu-dash-modal-title">Add Child</h2>
          <button onClick={onClose} className="edu-dash-modal-close" aria-label="Close">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="edu-dash-modal-grid">
          <div>
            <label className="edu-dash-modal-label">First Name *</label>
            <input
              className="edu-dash-modal-input"
              value={form.first_name}
              onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
              placeholder="Emma"
            />
          </div>
          <div>
            <label className="edu-dash-modal-label">Last Name</label>
            <input
              className="edu-dash-modal-input"
              value={form.last_name}
              onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
              placeholder="Smith"
            />
          </div>
        </div>

        <div className="edu-dash-modal-grid">
          <div>
            <label className="edu-dash-modal-label">Grade</label>
            <select
              className="edu-dash-modal-select"
              value={form.grade_level}
              onChange={e => setForm(p => ({ ...p, grade_level: e.target.value }))}
            >
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g === 'K' ? 'K' : `Grade ${g}`}</option>)}
            </select>
          </div>
          <div>
            <label className="edu-dash-modal-label">Age</label>
            <input
              className="edu-dash-modal-input"
              type="number"
              value={form.age}
              onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
              placeholder="8"
              min={4}
              max={20}
            />
          </div>
        </div>

        <div className="edu-dash-modal-field">
          <label className="edu-dash-modal-label">Curriculum Approach</label>
          <div className="edu-dash-modal-curr">
            {CURRICULUM_TYPES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setForm(p => ({ ...p, curriculum_type: c }))}
                className={form.curriculum_type === c ? 'on' : ''}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="edu-dash-modal-field">
          <label className="edu-dash-modal-label">Strengths</label>
          <input
            className="edu-dash-modal-input"
            value={form.strengths}
            onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))}
            placeholder="Reading, Art, Math"
          />
        </div>

        <div className="edu-dash-modal-field">
          <label className="edu-dash-modal-label">Challenge Areas</label>
          <input
            className="edu-dash-modal-input"
            value={form.challenge_areas}
            onChange={e => setForm(p => ({ ...p, challenge_areas: e.target.value }))}
            placeholder="Writing, Focus, Spelling"
          />
        </div>

        <div className="edu-dash-modal-toggle-row">
          <button
            type="button"
            aria-pressed={form.has_iep}
            className={`edu-dash-modal-toggle${form.has_iep ? ' on' : ''}`}
            onClick={() => setForm(p => ({ ...p, has_iep: !p.has_iep }))}
          >
            <span className="edu-dash-modal-toggle-dot" />
          </button>
          <span className="edu-dash-modal-toggle-label">Has Learning Plan / IEP</span>
        </div>

        <div className="edu-dash-modal-actions">
          <button onClick={onClose} className="edu-dash-modal-btn edu-dash-modal-btn-ghost">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.first_name}
            className="edu-dash-modal-btn edu-dash-modal-btn-primary"
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

  useEffect(() => { ensureDashStyles(); }, []);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
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

  const firstName =
    user?.first_name ??
    (eduProfile as unknown as { firstName?: string } | null)?.firstName ??
    'friend';

  const progressClass = (p: number) => p >= 70 ? 'high' : p >= 40 ? 'mid' : 'low';

  return (
    <div className="edu-dash">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="edu-dash-main">
        <EduTrialBanner />

        {showTrialBanner && (
          <div className="edu-dash-toast">
            <svg className="edu-dash-toast-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div className="edu-dash-toast-text">
              <div className="edu-dash-toast-title">Your 14-day trial has started.</div>
              <div className="edu-dash-toast-sub">Welcome to VeloxSync for Education.</div>
            </div>
            <button className="edu-dash-toast-close" onClick={() => setShowTrialBanner(false)} aria-label="Dismiss">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="edu-dash-mobile-bar">
          <button onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="edu-dash-mobile-bar-title">My Learning Family</span>
        </div>

        <div className="edu-dash-content">
          <div className="edu-dash-header">
            <div>
              <div className="edu-dash-eyebrow">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ei-Core Edu · Homeschool
              </div>
              <h1 className="edu-dash-title">Your <em>learning family.</em></h1>
              <p className="edu-dash-welcome">
                Welcome, {firstName}.{' '}
                {children.length > 0
                  ? `${children.length} learner${children.length !== 1 ? 's' : ''} tracked.`
                  : 'Add your first child to get started.'}
              </p>
            </div>
            <button className="edu-dash-add-btn" onClick={() => setShowAdd(true)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Child
            </button>
          </div>

          {familyInsight && (
            <div className="edu-dash-insight" id="children">
              <div className="edu-dash-insight-label">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ei-Core Family Insight
              </div>
              <p className="edu-dash-insight-summary">{familyInsight.summary}</p>
              <ul className="edu-dash-insight-list">
                {(Array.isArray(familyInsight.recommendations) ? familyInsight.recommendations : []).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {loading ? (
            <div className="edu-dash-empty">
              <div className="edu-dash-empty-title" style={{ marginBottom: 0 }}>Loading family…</div>
            </div>
          ) : children.length === 0 ? (
            <div className="edu-dash-empty">
              <div className="edu-dash-empty-icon">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="edu-dash-empty-title">Add your first learner.</div>
              <p className="edu-dash-empty-sub">
                Ei-Core will personalize curriculum recommendations and pacing for each child.
              </p>
              <button className="edu-dash-add-btn" onClick={() => setShowAdd(true)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Child
              </button>
            </div>
          ) : (
            <div className="edu-dash-grid">
              {(Array.isArray(children) ? children : []).map(child => (
                <div
                  key={child.id}
                  className="edu-dash-child"
                  onClick={() => navigate(`/education/students/${child.id}`)}
                >
                  <div className="edu-dash-child-header">
                    <div className="edu-dash-child-avatar">
                      {child.first_name[0]}{child.last_name?.[0] ?? ''}
                    </div>
                    <div>
                      <div className="edu-dash-child-name">{child.first_name} {child.last_name}</div>
                      <div className="edu-dash-child-meta">
                        <span>Grade {child.grade_level} · Age {child.age}</span>
                        {child.has_iep && <span className="edu-dash-iep-pill">IEP</span>}
                      </div>
                    </div>
                  </div>

                  <div className="edu-dash-child-body">
                    <div className="edu-dash-child-row">
                      <span className="edu-dash-child-row-label">Curriculum</span>
                      <span className="edu-dash-child-curriculum">{child.curriculum_type}</span>
                    </div>

                    <div>
                      <div className="edu-dash-child-progress-row">
                        <span>Overall Progress</span>
                        <span className="edu-dash-child-progress-val">{child.overall_progress}%</span>
                      </div>
                      <div className="edu-dash-progress-track">
                        <div
                          className={`edu-dash-progress-fill ${progressClass(child.overall_progress)}`}
                          style={{ width: `${child.overall_progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="edu-dash-child-desc">
                      {CURRICULUM_DESCRIPTIONS[child.curriculum_type as CurriculumType] ?? ''}
                    </p>

                    {child.strengths?.length > 0 && (
                      <div className="edu-dash-strengths">
                        {child.strengths.slice(0, 3).map((s, i) => (
                          <span key={i} className="edu-dash-strength-pill">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {eduProfile?.curriculumType && (
            <div className="edu-dash-guidance">
              <div className="edu-dash-guidance-head">
                <div className="edu-dash-guidance-icon">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="edu-dash-guidance-title">{eduProfile.curriculumType} approach — Ei-Core guidance</div>
                  <div className="edu-dash-guidance-sub">Based on your selected curriculum style</div>
                </div>
              </div>
              <p className="edu-dash-guidance-text">
                {CURRICULUM_DESCRIPTIONS[eduProfile.curriculumType as CurriculumType]}
              </p>
              <Link to="/education/advisor" className="edu-dash-guidance-link">
                Get {eduProfile.curriculumType} recommendations
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
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
