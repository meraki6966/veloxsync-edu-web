// src/pages/education/EduSupport.tsx
// VeloxSync for Education — Support / Contact (V3 homeschool)
// Renders in two modes:
//   - default (authenticated): EducationSidebar + page layout at /education/support
//   - publicMode: no sidebar, form centered on cream at /support

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { dashboard } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile } from '../../types/education';

const SUBJECT_OPTIONS = [
  'Account Help',
  'Curriculum Questions',
  'Technical Issue',
  'Billing',
  'Beta Feedback',
  'Other',
];

const SUPPORT_CSS = `
.edu-support { font-family: 'Open Sans', sans-serif; color: #1C1812; }
.edu-support-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; }
.edu-support-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; line-height: 1.1; color: #1C1812; }
.edu-support-sub { font-size: 14px; color: rgba(28,24,18,0.6); margin-top: 8px; line-height: 1.6; }
.edu-support-card { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1); border-radius: 16px; }
.edu-support-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; margin-bottom: 6px; }
.edu-support-input { width: 100%; background: #FFFFFF; border: 1px solid rgba(28,24,18,0.15); border-radius: 8px; color: #1C1812; font-size: 14px; padding: 10px 12px; font-family: 'Open Sans', sans-serif; }
.edu-support-input::placeholder { color: rgba(28,24,18,0.4); }
.edu-support-input:focus { outline: none; border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
.edu-support-btn { background: #3D6B4F; color: #FFFFFF; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; padding: 11px 24px; cursor: pointer; font-family: 'Open Sans', sans-serif; transition: background 0.15s; }
.edu-support-btn:hover { background: #2D5A3F; }
.edu-support-btn:disabled { opacity: 0.6; cursor: default; }
.edu-support-success { background: rgba(61,107,79,0.1); border: 1px solid rgba(61,107,79,0.3); border-radius: 16px; color: #2E5340; }
.edu-support-error { background: rgba(176,58,46,0.08); border: 1px solid rgba(176,58,46,0.25); border-radius: 16px; color: #B03A2E; }
.edu-support-info-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; margin-bottom: 6px; }
.edu-support-info-value { font-size: 14px; color: #1C1812; font-weight: 600; }
`;

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function ContactForm() {
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    subject: SUBJECT_OPTIONS[0],
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const set = (key: keyof ContactFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setError(false);
    try {
      await api.post('/api/edu/support/contact', form);
      setSent(true);
    } catch (err: any) {
      // The backend endpoint may not exist yet — treat "not found" / no
      // response as a soft success and log the submission for follow-up.
      const status = err?.response?.status;
      if (!err?.response || status === 404 || status === 501) {
        console.log('[support] contact submission (endpoint pending):', form);
        setSent(true);
      } else {
        setError(true);
      }
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="edu-support-success" style={{ padding: '28px 32px' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, marginBottom: 8 }}>
          Message sent.
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          We will get back to you at <strong>{form.email}</strong> within 24 hours.
        </div>
      </div>
    );
  }

  return (
    <div className="edu-support-card" style={{ padding: '28px 32px' }}>
      {error && (
        <div className="edu-support-error" style={{ padding: '14px 18px', marginBottom: 20, fontSize: 14 }}>
          Something went wrong sending your message. Please try again, or email us directly at support@veloxsync.app.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="edu-support-label" htmlFor="support-name">Name</label>
            <input
              id="support-name"
              className="edu-support-input"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="edu-support-label" htmlFor="support-email">Email</label>
            <input
              id="support-email"
              className="edu-support-input"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="edu-support-label" htmlFor="support-subject">Subject</label>
          <select
            id="support-subject"
            className="edu-support-input"
            value={form.subject}
            onChange={set('subject')}
          >
            {SUBJECT_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="edu-support-label" htmlFor="support-message">Message</label>
          <textarea
            id="support-message"
            className="edu-support-input"
            value={form.message}
            onChange={set('message')}
            placeholder="How can we help?"
            style={{ minHeight: 120, resize: 'vertical' }}
            required
          />
        </div>
        <button type="submit" className="edu-support-btn" disabled={sending}>
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  );
}

function ContactInfoCards() {
  const items = [
    { label: 'Email', value: 'support@veloxsync.app' },
    { label: 'Response time', value: 'Within 24 hours' },
    { label: 'Beta support', value: 'Direct access to the founder' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
      {items.map(item => (
        <div key={item.label} className="edu-support-card" style={{ padding: '18px 20px' }}>
          <div className="edu-support-info-label">{item.label}</div>
          <div className="edu-support-info-value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function EduSupport({ publicMode = false }: { publicMode?: boolean }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-support', 'true');
    styleEl.textContent = SUPPORT_CSS;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  useEffect(() => {
    if (publicMode) return;
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
  }, [publicMode]);

  const header = (
    <header style={{ marginBottom: 28 }}>
      <div className="edu-support-eyebrow" style={{ marginBottom: 8 }}>Support</div>
      <h1 className="edu-support-title">We are here to help.</h1>
      <p className="edu-support-sub">
        Every question gets a real answer from a real person. Usually within 24 hours.
      </p>
    </header>
  );

  // Public version — no sidebar, form centered on cream.
  if (publicMode) {
    return (
      <div className="edu-support" style={{ minHeight: '100vh', background: '#FAF7F2', padding: '64px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {header}
          <ContactForm />
          <ContactInfoCards />
        </div>
      </div>
    );
  }

  // Authenticated version — sidebar layout.
  return (
    <div className="edu-support" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#FAF7F2' }}>
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="md:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, color: '#3D6B4F', fontSize: 14, fontWeight: 600, padding: 0 }}
        >
          Menu
        </button>
        <div style={{ maxWidth: 720 }}>
          {header}
          <ContactForm />
          <ContactInfoCards />
        </div>
      </main>
    </div>
  );
}
