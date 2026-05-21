import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { edu } from '../../api';
import { US_STATES } from '../../types/education';

const CURRICULUM_TYPES = [
  'Classical',
  'Charlotte Mason',
  'Unschooling',
  'Eclectic',
  'Online',
  'Textbook',
] as const;
type CurriculumApproach = typeof CURRICULUM_TYPES[number];

const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const ONBOARDING_CSS = `
.edu-onboarding {
  min-height: 100vh;
  background: #FAF7F2;
  font-family: 'Open Sans', sans-serif;
  color: #1C1812;
  padding: 64px 24px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.edu-onboarding-shell {
  width: 100%;
  max-width: 560px;
}
.edu-onboarding-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #3D6B4F;
  margin-bottom: 14px;
  text-align: center;
}
.edu-onboarding-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 36px;
}
.edu-onboarding-stepper-dot {
  width: 26px;
  height: 4px;
  border-radius: 100px;
  background: rgba(28,24,18,0.1);
  transition: background 0.3s;
}
.edu-onboarding-stepper-dot.active { background: #3D6B4F; }
.edu-onboarding-card {
  background: #FFFFFF;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 16px;
  padding: 48px 44px;
  box-shadow: 0 4px 32px rgba(28,24,18,0.06);
}
.edu-onboarding-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 1.15;
  color: #1C1812;
  margin-bottom: 8px;
  text-align: center;
}
.edu-onboarding-title em { font-style: italic; color: #3D6B4F; }
.edu-onboarding-sub {
  font-size: 14px;
  font-weight: 300;
  color: rgba(28,24,18,0.6);
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.65;
}
.edu-onboarding-field { margin-bottom: 18px; }
.edu-onboarding-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(28,24,18,0.6);
  margin-bottom: 8px;
}
.edu-onboarding-input,
.edu-onboarding-select {
  width: 100%;
  background: #FAF7F2;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 8px;
  padding: 13px 16px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #1C1812;
  transition: border-color 0.2s;
}
.edu-onboarding-input:focus,
.edu-onboarding-select:focus {
  outline: none;
  border-color: #3D6B4F;
}
.edu-onboarding-input::placeholder { color: rgba(28,24,18,0.35); }
.edu-onboarding-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.edu-onboarding-approach {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.edu-onboarding-approach button {
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(28,24,18,0.7);
  background: #FAF7F2;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 8px;
  padding: 11px 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}
.edu-onboarding-approach button:hover {
  border-color: rgba(61,107,79,0.3);
  color: #3D6B4F;
}
.edu-onboarding-approach button.selected {
  background: #EBF2EC;
  border-color: #3D6B4F;
  color: #3D6B4F;
  font-weight: 600;
}
.edu-onboarding-toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.edu-onboarding-toggle {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 100px;
  background: rgba(28,24,18,0.15);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.edu-onboarding-toggle.on { background: #3D6B4F; }
.edu-onboarding-toggle-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #FFFFFF;
  transition: left 0.2s;
}
.edu-onboarding-toggle.on .edu-onboarding-toggle-dot { left: 19px; }
.edu-onboarding-toggle-label {
  font-size: 13px;
  color: rgba(28,24,18,0.75);
  font-weight: 500;
}
.edu-onboarding-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.edu-onboarding-btn {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  border-radius: 100px;
  padding: 13px 28px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}
.edu-onboarding-btn-primary {
  flex: 1;
  background: #3D6B4F;
  color: #FFFFFF;
}
.edu-onboarding-btn-primary:hover { background: #5A8F6A; }
.edu-onboarding-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.edu-onboarding-btn-ghost {
  background: transparent;
  border: 1.5px solid rgba(28,24,18,0.15);
  color: rgba(28,24,18,0.65);
}
.edu-onboarding-btn-ghost:hover { border-color: #3D6B4F; color: #3D6B4F; }
.edu-onboarding-summary {
  background: #EBF2EC;
  border: 1px solid rgba(61,107,79,0.25);
  border-radius: 12px;
  padding: 22px 24px;
  margin: 4px 0 32px;
  text-align: left;
}
.edu-onboarding-summary-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3D6B4F;
  margin-bottom: 6px;
}
.edu-onboarding-summary-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px;
  font-weight: 500;
  color: #1C1812;
  line-height: 1.15;
}
.edu-onboarding-summary-meta {
  font-size: 13px;
  color: rgba(28,24,18,0.6);
  margin-top: 4px;
}
.edu-onboarding-footer-note {
  text-align: center;
  font-size: 11px;
  color: rgba(28,24,18,0.35);
  margin-top: 24px;
}
.edu-onboarding-error {
  background: rgba(229,62,62,0.08);
  border: 1px solid rgba(229,62,62,0.25);
  color: #B23A3A;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
}
`;

interface ParentProfile {
  firstName: string;
  state: string;
  curriculumApproach: CurriculumApproach;
  role: 'homeschool';
  completedAt?: string;
}

export default function EduOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [state, setState] = useState('');
  const [curriculumApproach, setCurriculumApproach] = useState<CurriculumApproach>('Eclectic');

  // Step 2
  const [childName, setChildName] = useState('');
  const [childGrade, setChildGrade] = useState('3');
  const [childAge, setChildAge] = useState('');
  const [hasIep, setHasIep] = useState(false);
  const [iepNotes, setIepNotes] = useState('');

  // Step 3
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [childSaved, setChildSaved] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-onboarding', 'true');
    styleEl.textContent = ONBOARDING_CSS;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const persistProfile = () => {
    const profile: ParentProfile = {
      firstName: firstName.trim(),
      state,
      curriculumApproach,
      role: 'homeschool',
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem('eduProfile', JSON.stringify(profile));
  };

  const handleStep1Continue = () => {
    if (!firstName.trim() || !state) return;
    persistProfile();
    setStep(2);
  };

  const saveChildAndFinish = async (skip: boolean) => {
    setSubmitting(true);
    setError('');
    persistProfile();

    if (!skip && childName.trim()) {
      try {
        await edu.addHomeschoolChild({
          first_name: childName.trim(),
          last_name: '',
          grade_level: childGrade,
          age: parseInt(childAge, 10) || undefined,
          curriculum_type: curriculumApproach,
          subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
          strengths: [],
          challenge_areas: [],
          has_iep: hasIep,
          iep_notes: hasIep ? iepNotes.trim() : undefined,
          overall_progress: 0,
        });
        setChildSaved(true);
      } catch {
        // Silently degrade — the parent profile is saved locally and we
        // can still advance to the dashboard. They can add the child later.
        setChildSaved(false);
      }
    }
    setSubmitting(false);
    setStep(3);
  };

  const goToDashboard = () => navigate('/education/dashboard');

  return (
    <div className="edu-onboarding">
      <div className="edu-onboarding-shell">
        <div className="edu-onboarding-eyebrow">VeloxSync for Education</div>

        <div className="edu-onboarding-stepper">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`edu-onboarding-stepper-dot${s <= step ? ' active' : ''}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="edu-onboarding-card">
            <h1 className="edu-onboarding-title">Let's set up your <em>learning family.</em></h1>
            <p className="edu-onboarding-sub">Tell us a little about how you homeschool.</p>

            <div className="edu-onboarding-field">
              <label className="edu-onboarding-label" htmlFor="edu-fn">Your first name</label>
              <input
                id="edu-fn"
                className="edu-onboarding-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Sarah"
              />
            </div>

            <div className="edu-onboarding-field">
              <label className="edu-onboarding-label" htmlFor="edu-state">Your state</label>
              <select
                id="edu-state"
                className="edu-onboarding-select"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">Select your state…</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="edu-onboarding-field">
              <span className="edu-onboarding-label">Curriculum approach</span>
              <div className="edu-onboarding-approach">
                {CURRICULUM_TYPES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={curriculumApproach === c ? 'selected' : ''}
                    onClick={() => setCurriculumApproach(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="edu-onboarding-actions">
              <button
                type="button"
                className="edu-onboarding-btn edu-onboarding-btn-primary"
                onClick={handleStep1Continue}
                disabled={!firstName.trim() || !state}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="edu-onboarding-card">
            <h1 className="edu-onboarding-title">Tell us about your <em>first learner.</em></h1>
            <p className="edu-onboarding-sub">You can add more children later.</p>

            {error && <div className="edu-onboarding-error">{error}</div>}

            <div className="edu-onboarding-field">
              <label className="edu-onboarding-label" htmlFor="child-name">Child's first name</label>
              <input
                id="child-name"
                className="edu-onboarding-input"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Elijah"
              />
            </div>

            <div className="edu-onboarding-row">
              <div className="edu-onboarding-field">
                <label className="edu-onboarding-label" htmlFor="child-grade">Grade level</label>
                <select
                  id="child-grade"
                  className="edu-onboarding-select"
                  value={childGrade}
                  onChange={(e) => setChildGrade(e.target.value)}
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g === 'K' ? 'K' : `Grade ${g}`}</option>
                  ))}
                </select>
              </div>
              <div className="edu-onboarding-field">
                <label className="edu-onboarding-label" htmlFor="child-age">Age</label>
                <input
                  id="child-age"
                  className="edu-onboarding-input"
                  type="number"
                  min={4}
                  max={20}
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  placeholder="e.g. 8"
                />
              </div>
            </div>

            <div className="edu-onboarding-toggle-row">
              <button
                type="button"
                aria-pressed={hasIep}
                className={`edu-onboarding-toggle${hasIep ? ' on' : ''}`}
                onClick={() => setHasIep((v) => !v)}
              >
                <span className="edu-onboarding-toggle-dot" />
              </button>
              <span className="edu-onboarding-toggle-label">
                This child has an IEP or learning accommodation
              </span>
            </div>

            {hasIep && (
              <div className="edu-onboarding-field">
                <label className="edu-onboarding-label" htmlFor="iep-notes">Accommodation notes</label>
                <input
                  id="iep-notes"
                  className="edu-onboarding-input"
                  value={iepNotes}
                  onChange={(e) => setIepNotes(e.target.value)}
                  placeholder="e.g. Extended time, ADHD focus support"
                />
              </div>
            )}

            <div className="edu-onboarding-actions">
              <button
                type="button"
                className="edu-onboarding-btn edu-onboarding-btn-ghost"
                onClick={() => saveChildAndFinish(true)}
                disabled={submitting}
              >
                Skip for now
              </button>
              <button
                type="button"
                className="edu-onboarding-btn edu-onboarding-btn-primary"
                onClick={() => saveChildAndFinish(false)}
                disabled={submitting || !childName.trim()}
              >
                {submitting ? 'Saving…' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="edu-onboarding-card">
            <h1 className="edu-onboarding-title">Your family is <em>set up.</em></h1>
            <p className="edu-onboarding-sub">
              Ei-Core will generate your first daily plan in the next 24 hours.
            </p>

            {childSaved && childName.trim() && (
              <div className="edu-onboarding-summary">
                <div className="edu-onboarding-summary-label">First learner added</div>
                <div className="edu-onboarding-summary-name">{childName.trim()}</div>
                <div className="edu-onboarding-summary-meta">
                  {childGrade === 'K' ? 'Kindergarten' : `Grade ${childGrade}`}
                  {childAge ? ` · Age ${childAge}` : ''}
                  {hasIep ? ' · Accommodation on file' : ''}
                </div>
              </div>
            )}

            <div className="edu-onboarding-actions">
              <button
                type="button"
                className="edu-onboarding-btn edu-onboarding-btn-primary"
                onClick={goToDashboard}
              >
                Go to your dashboard
              </button>
            </div>
          </div>
        )}

        <p className="edu-onboarding-footer-note">VeloxSync for Education · Powered by Ei-Core</p>
      </div>
    </div>
  );
}
