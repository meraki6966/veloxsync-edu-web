import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EducationSidebar from '../../components/EducationSidebar';
import { dashboard, eduBilling, edu } from '../../api';
import type { EduProfile, HomeschoolChild } from '../../types/education';

const APP_VERSION = 'v3.0';
const SUPPORT_EMAIL = 'support@veloxsync.app';
const ACCENT_SWATCHES = ['#3D6B4F', '#2D5A3F', '#7A5C3E', '#3E5C7A', '#6B4F3D'];

const SETTINGS_CSS = `
.edu-settings { display: flex; min-height: 100vh; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; }
.edu-settings-main { flex: 1; padding: 56px 64px; overflow-y: auto; }
.edu-settings-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #3D6B4F; margin-bottom: 12px; }
.edu-settings-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; font-style: normal; line-height: 1.1; color: #1C1812; margin-bottom: 12px; }
.edu-settings-sub { font-size: 15px; font-weight: 300; color: rgba(28,24,18,0.6); margin-bottom: 36px; max-width: 540px; line-height: 1.65; }
.edu-settings-grid { display: flex; flex-direction: column; gap: 24px; max-width: 720px; }
.edu-card { background: #fff; border: 1px solid rgba(28,24,18,0.08); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); padding: 24px; }
.edu-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.edu-section-label { font-family: 'Open Sans', sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #3D6B4F; letter-spacing: 0.1em; }
.edu-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.edu-field label { font-family: 'Open Sans', sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #3D6B4F; letter-spacing: 0.1em; }
.edu-input { width: 100%; background: #fff; border: 1px solid rgba(28,24,18,0.15); border-radius: 8px; padding: 10px 12px; font-family: 'Open Sans', sans-serif; font-size: 14px; color: #1C1812; outline: none; transition: box-shadow .15s, border-color .15s; }
.edu-input:focus { border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
.edu-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 8px; background: #3D6B4F; padding: 0 24px; color: #fff; transition: background-color .15s; border: none; cursor: pointer; min-height: 44px; font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 600; }
.edu-btn-primary:hover { background: #2D5A3F; }
.edu-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.edu-btn-ghost { display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid rgba(28,24,18,0.15); background: #fff; padding: 0 20px; color: #1C1812; transition: background-color .15s; cursor: pointer; min-height: 44px; font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; }
.edu-btn-ghost:hover { background: rgba(28,24,18,0.03); }
.edu-btn-ghost:disabled { opacity: .5; cursor: not-allowed; }
.edu-msg { font-size: 13px; margin-top: 8px; }
.edu-msg.ok { color: #3D6B4F; }
.edu-msg.err { color: #9B3535; }
.edu-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(28,24,18,0.06); }
.edu-row:last-child { border-bottom: none; }
.edu-row-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #3D6B4F; }
.edu-row-value { font-size: 14px; color: rgba(28,24,18,0.8); }
.edu-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #3D6B4F; }
.edu-seg { display: inline-flex; border: 1px solid rgba(28,24,18,0.15); border-radius: 8px; overflow: hidden; }
.edu-seg button { background: #fff; border: none; padding: 10px 18px; font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 600; color: rgba(28,24,18,0.8); cursor: pointer; border-right: 1px solid rgba(28,24,18,0.15); }
.edu-seg button:last-child { border-right: none; }
.edu-seg button.active { background: #3D6B4F; color: #fff; }
.edu-swatches { display: flex; gap: 10px; }
.edu-swatch { width: 32px; height: 32px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; outline: none; }
.edu-swatch.active { border-color: #1C1812; }
.edu-helper { font-size: 13px; color: rgba(28,24,18,0.8); line-height: 1.6; }
.edu-fam-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid rgba(28,24,18,0.06); }
.edu-fam-row:last-child { border-bottom: none; }
.edu-fam-name { font-size: 14px; font-weight: 600; color: #1C1812; }
.edu-fam-grade { font-size: 13px; color: rgba(28,24,18,0.8); }
.edu-fam-actions { display: flex; gap: 8px; }
@media (max-width: 768px) { .edu-settings-main { padding: 32px 24px; } }
`;

interface StoredProfile extends Partial<EduProfile> {
  firstName?: string;
  curriculumApproach?: string;
}

type ThemeOption = 'Light' | 'Dark' | 'System';

function Icon({ d }: { d: string }) {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#3D6B4F" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function deviceLabel(): string {
  if (typeof navigator === 'undefined' || !navigator.userAgent) return 'This device';
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  let os = '';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  return os ? `${browser} on ${os}` : browser;
}

// Applies the chosen theme's CSS variables to the document root.
// Full page-by-page dark styling is a later global CSS pass — this just sets
// the root tokens + a data attribute so the preference is live immediately.
function applyTheme(t: ThemeOption) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const prefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = t === 'Dark' || (t === 'System' && prefersDark);

  if (isDark) {
    root.style.setProperty('--edu-bg', '#1C1812');
    root.style.setProperty('--edu-text', '#FAF7F2');
    root.style.setProperty('--edu-card-bg', '#2A2520');
    root.style.setProperty('--edu-card-border', 'rgba(250,247,242,0.1)');
    root.setAttribute('data-edu-theme', 'dark');
  } else {
    root.style.removeProperty('--edu-bg');
    root.style.removeProperty('--edu-text');
    root.style.removeProperty('--edu-card-bg');
    root.style.removeProperty('--edu-card-border');
    root.setAttribute('data-edu-theme', 'light');
  }
}

function childDisplayName(c: HomeschoolChild): string {
  const full = `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim();
  return full || c.first_name || 'Child';
}

export default function EduSettings() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stored, setStored] = useState<StoredProfile | null>(null);

  // ACCOUNT
  const [email, setEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  // SECURITY
  const [lastLogin, setLastLogin] = useState<string>('This session');

  // APPEARANCE
  const [theme, setTheme] = useState<ThemeOption>('Light');
  const [accent, setAccent] = useState<string>('#3D6B4F');
  const [appearanceMsg, setAppearanceMsg] = useState<string | null>(null);

  // SUBSCRIPTION
  const [planName, setPlanName] = useState('Homeschool');
  const [renewalDate, setRenewalDate] = useState('—');
  const [portalLoading, setPortalLoading] = useState(false);

  // FAMILY
  const [children, setChildren] = useState<HomeschoolChild[]>([]);
  const [familyMsg, setFamilyMsg] = useState<string | null>(null);

  // Inject CSS
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-settings', 'true');
    styleEl.textContent = SETTINGS_CSS;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Stored onboarding profile (sidebar context)
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

  // Appearance: read persisted prefs on mount and apply theme immediately
  useEffect(() => {
    const t = localStorage.getItem('edu_theme');
    const resolved: ThemeOption =
      t === 'Light' || t === 'Dark' || t === 'System' ? t : 'Light';
    setTheme(resolved);
    applyTheme(resolved);
    const a = localStorage.getItem('edu_accent');
    if (a) setAccent(a);
  }, []);

  // Account: prefill email + last login from dashboard.me()
  useEffect(() => {
    dashboard
      .me()
      .then((r) => {
        const me = r.data as any;
        if (me?.email) setEmail(me.email);
        const ll = me?.last_login ?? me?.last_sign_in ?? me?.last_login_at;
        if (ll) {
          const dt = new Date(ll);
          setLastLogin(isNaN(dt.getTime()) ? String(ll) : dt.toLocaleString());
        }
      })
      .catch(() => {
        /* leave defaults */
      });
  }, []);

  // Subscription: fetch billing status
  useEffect(() => {
    eduBilling
      .status()
      .then((r) => {
        const s = r.data as any;
        const name = s?.plan ?? s?.plan_name ?? s?.subscription?.plan ?? 'Homeschool';
        setPlanName(typeof name === 'string' && name ? name : 'Homeschool');
        const date =
          s?.renewal_date ??
          s?.renews_at ??
          s?.current_period_end ??
          s?.next_billing_date ??
          s?.trial_end;
        if (date) {
          const dt = new Date(date);
          setRenewalDate(isNaN(dt.getTime()) ? String(date) : dt.toLocaleDateString());
        }
      })
      .catch(() => {
        /* fallbacks already set */
      });
  }, []);

  // Family: load children
  useEffect(() => {
    edu
      .listHomeschoolChildren()
      .then((r) => {
        const d = r.data as any;
        const list: HomeschoolChild[] = Array.isArray(d)
          ? d
          : Array.isArray(d?.children)
            ? d.children
            : [];
        setChildren(list);
      })
      .catch(() => setChildren([]));
  }, []);

  // --- Handlers ---
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailMsg({ kind: 'err', text: 'Email cannot be empty.' });
      return;
    }
    setEmailSaving(true);
    setEmailMsg(null);
    try {
      await dashboard.updateProfile({ email: email.trim() });
      setEmailMsg({ kind: 'ok', text: 'Email updated.' });
    } catch {
      setEmailMsg({ kind: 'err', text: 'Could not update email. Please try again.' });
    } finally {
      setEmailSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!currentPassword || !newPassword) {
      setPwMsg({ kind: 'err', text: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ kind: 'err', text: 'New passwords do not match.' });
      return;
    }
    setPwSaving(true);
    try {
      await dashboard.updateProfile({ currentPassword, newPassword });
      setPwMsg({ kind: 'ok', text: 'Password updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPwMsg({ kind: 'err', text: 'Could not update password. Please try again.' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleThemeChange = (t: ThemeOption) => {
    setTheme(t);
    localStorage.setItem('edu_theme', t);
    applyTheme(t);
    setAppearanceMsg('Theme saved. Dark mode coming soon.');
  };

  const handleAccentChange = (a: string) => {
    setAccent(a);
    localStorage.setItem('edu_accent', a);
    setAppearanceMsg('Accent color saved.');
  };

  const handleSaveAppearance = () => {
    localStorage.setItem('edu_theme', theme);
    localStorage.setItem('edu_accent', accent);
    applyTheme(theme);
    setAppearanceMsg('Preferences saved. Dark mode coming soon.');
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await eduBilling.portal();
      const url = (res?.data as any)?.url;
      if (url && typeof url === 'string') {
        window.location.href = url;
      }
    } catch {
      /* swallow — button re-enables */
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRemoveChild = (c: HomeschoolChild) => {
    const ok = window.confirm(`Remove ${childDisplayName(c)} from your homeschool?`);
    if (!ok) return;
    // No delete-homeschool-child endpoint exists — degrade gracefully.
    setFamilyMsg("Removing children isn't available yet — contact support.");
  };

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
        <h1 className="edu-settings-title">Your family.</h1>
        <p className="edu-settings-sub">
          Manage your account, security, subscription, and learning family — all in one place.
        </p>

        <div className="edu-settings-grid">
          {/* ACCOUNT */}
          <section className="edu-card">
            <div className="edu-card-head">
              <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              <span className="edu-section-label">Account</span>
            </div>

            <form onSubmit={handleUpdateEmail}>
              <div className="edu-field">
                <label htmlFor="acct-email">Email address</label>
                <input
                  id="acct-email"
                  type="email"
                  className="edu-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" className="edu-btn-primary" disabled={emailSaving}>
                {emailSaving ? 'Saving…' : 'Update email'}
              </button>
              {emailMsg && <div className={`edu-msg ${emailMsg.kind}`}>{emailMsg.text}</div>}
            </form>

            <div style={{ height: 1, background: 'rgba(28,24,18,0.06)', margin: '24px 0' }} />

            <form onSubmit={handleChangePassword}>
              <div className="edu-field">
                <label htmlFor="cur-pw">Current password</label>
                <input
                  id="cur-pw"
                  type="password"
                  className="edu-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="edu-field">
                <label htmlFor="new-pw">New password</label>
                <input
                  id="new-pw"
                  type="password"
                  className="edu-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="edu-field">
                <label htmlFor="conf-pw">Confirm new password</label>
                <input
                  id="conf-pw"
                  type="password"
                  className="edu-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="edu-btn-primary" disabled={pwSaving}>
                {pwSaving ? 'Saving…' : 'Change password'}
              </button>
              {pwMsg && <div className={`edu-msg ${pwMsg.kind}`}>{pwMsg.text}</div>}
            </form>
          </section>

          {/* SECURITY */}
          <section className="edu-card">
            <div className="edu-card-head">
              <Icon d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" />
              <span className="edu-section-label">Security</span>
            </div>

            <div className="edu-row">
              <span className="edu-row-label">Active session</span>
              <span className="edu-row-value" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="edu-dot" />
                {deviceLabel()} · This device · Current
              </span>
            </div>
            <div className="edu-row">
              <span className="edu-row-label">Last login</span>
              <span className="edu-row-value">{lastLogin}</span>
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                className="edu-btn-ghost"
                disabled
                title="No other active sessions"
              >
                Sign out all other sessions
              </button>
            </div>
          </section>

          {/* APPEARANCE */}
          <section className="edu-card">
            <div className="edu-card-head">
              <Icon d="M12 3a9 9 0 100 18 3 3 0 003-3 2 2 0 012-2h1a3 3 0 003-3 9 9 0 00-12-7zM7.5 12a1 1 0 110-2 1 1 0 010 2zm3-4a1 1 0 110-2 1 1 0 010 2zm5 0a1 1 0 110-2 1 1 0 010 2z" />
              <span className="edu-section-label">Appearance</span>
            </div>

            <div className="edu-field">
              <label>Theme</label>
              <div className="edu-seg">
                {(['Light', 'Dark', 'System'] as ThemeOption[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={theme === t ? 'active' : ''}
                    onClick={() => handleThemeChange(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="edu-field">
              <label>Accent color</label>
              <div className="edu-swatches">
                {ACCENT_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Accent ${c}`}
                    className={`edu-swatch ${accent === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => handleAccentChange(c)}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: 4 }}>
              <button type="button" className="edu-btn-primary" onClick={handleSaveAppearance}>
                Save preferences
              </button>
              {appearanceMsg && <div className="edu-msg ok">{appearanceMsg}</div>}
            </div>
          </section>

          {/* SUBSCRIPTION */}
          <section className="edu-card">
            <div className="edu-card-head">
              <Icon d="M3 7h18v10H3V7zm0 4h18M7 15h4" />
              <span className="edu-section-label">Subscription</span>
            </div>

            <div className="edu-row">
              <span className="edu-row-label">Plan</span>
              <span className="edu-row-value">{planName}</span>
            </div>
            <div className="edu-row">
              <span className="edu-row-label">Renews</span>
              <span className="edu-row-value">{renewalDate}</span>
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                className="edu-btn-primary"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? 'Opening…' : 'Manage subscription'}
              </button>
            </div>
          </section>

          {/* FAMILY */}
          <section className="edu-card">
            <div className="edu-card-head">
              <Icon d="M17 20h5v-1a4 4 0 00-4-4h-1m-7 5H2v-1a4 4 0 014-4h4a4 4 0 014 4v1zm-2-9a3 3 0 11-6 0 3 3 0 016 0zm9-1a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              <span className="edu-section-label">Family</span>
            </div>

            {children.length === 0 ? (
              <p className="edu-helper" style={{ marginBottom: 18 }}>
                No children added yet.
              </p>
            ) : (
              <div style={{ marginBottom: 18 }}>
                {children.map((c) => (
                  <div key={c.id} className="edu-fam-row">
                    <div>
                      <div className="edu-fam-name">{childDisplayName(c)}</div>
                      <div className="edu-fam-grade">
                        {c.grade_level === 'K' ? 'Grade K' : `Grade ${c.grade_level ?? '—'}`}
                      </div>
                    </div>
                    <div className="edu-fam-actions">
                      <Link className="edu-btn-ghost" to={`/education/students/${c.id}`}>
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="edu-btn-ghost"
                        onClick={() => handleRemoveChild(c)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {familyMsg && (
              <div className="edu-msg err" style={{ marginBottom: 14 }}>
                {familyMsg}
              </div>
            )}

            <Link className="edu-btn-primary" to="/education/dashboard">
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
              Add a child
            </Link>
          </section>

          {/* ABOUT */}
          <section className="edu-card">
            <div className="edu-card-head">
              <Icon d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
              <span className="edu-section-label">About</span>
            </div>

            <div className="edu-row">
              <span className="edu-row-label">App version</span>
              <span className="edu-row-value">{APP_VERSION}</span>
            </div>
            <div className="edu-row">
              <span className="edu-row-label">Ei-Core status</span>
              <span className="edu-row-value" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="edu-dot" />
                Operational
              </span>
            </div>
            <div className="edu-row">
              <span className="edu-row-label">Support</span>
              <span className="edu-row-value">
                <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: '#3D6B4F', textDecoration: 'none' }}>
                  {SUPPORT_EMAIL}
                </a>
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
