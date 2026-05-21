import { useEffect, useState } from 'react';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile } from '../../types/education';

const SETTINGS_CSS = `
.edu-settings { display: flex; min-height: 100vh; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; }
.edu-settings-main { flex: 1; padding: 56px 64px; overflow-y: auto; }
.edu-settings-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #3D6B4F; margin-bottom: 12px; }
.edu-settings-title { font-family: 'Cormorant Garamond', serif; font-size: 44px; font-weight: 400; line-height: 1.1; color: #1C1812; margin-bottom: 12px; }
.edu-settings-title em { font-style: italic; color: #3D6B4F; }
.edu-settings-sub { font-size: 15px; font-weight: 300; color: rgba(28,24,18,0.6); margin-bottom: 36px; max-width: 540px; line-height: 1.65; }
.edu-settings-card { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1); border-radius: 16px; padding: 32px 36px; max-width: 640px; box-shadow: 0 2px 16px rgba(28,24,18,0.05); }
.edu-settings-card h2 { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: #1C1812; margin-bottom: 6px; }
.edu-settings-card p { font-size: 13px; color: rgba(28,24,18,0.55); line-height: 1.6; }
.edu-settings-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(28,24,18,0.06); font-size: 14px; }
.edu-settings-row:last-child { border-bottom: none; }
.edu-settings-row-label { color: rgba(28,24,18,0.55); font-weight: 500; }
.edu-settings-row-value { color: #1C1812; font-weight: 500; }
@media (max-width: 768px) { .edu-settings-main { padding: 32px 24px; } }
`;

interface StoredProfile extends Partial<EduProfile> {
  firstName?: string;
  curriculumApproach?: string;
}

export default function EduSettings() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stored, setStored] = useState<StoredProfile | null>(null);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-settings', 'true');
    styleEl.textContent = SETTINGS_CSS;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) {
      try {
        setStored(JSON.parse(raw) as StoredProfile);
      } catch {
        setStored(null);
      }
    }
  }, []);

  return (
    <div className="edu-settings">
      <EducationSidebar
        user={null}
        eduProfile={(stored as EduProfile | null) ?? null}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className="edu-settings-main">
        <div className="edu-settings-eyebrow">Settings</div>
        <h1 className="edu-settings-title">Your <em>family.</em></h1>
        <p className="edu-settings-sub">
          More settings are on the way. For now, here is what we have on file for your homeschool.
        </p>

        <div className="edu-settings-card">
          <h2>Profile</h2>
          <p style={{ marginBottom: 14 }}>Saved during onboarding.</p>
          <div className="edu-settings-row">
            <span className="edu-settings-row-label">Parent first name</span>
            <span className="edu-settings-row-value">{stored?.firstName ?? '—'}</span>
          </div>
          <div className="edu-settings-row">
            <span className="edu-settings-row-label">State</span>
            <span className="edu-settings-row-value">{stored?.state ?? '—'}</span>
          </div>
          <div className="edu-settings-row">
            <span className="edu-settings-row-label">Curriculum approach</span>
            <span className="edu-settings-row-value">{stored?.curriculumApproach ?? stored?.curriculumType ?? '—'}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
