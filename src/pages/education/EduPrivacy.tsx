// src/pages/education/EduPrivacy.tsx
// VeloxSync for Education — Children's data privacy policy (COPPA / FERPA / AI)
// Public route, no sidebar. Plain English, no legal jargon.

import { useEffect } from 'react';

const PRIVACY_CSS = `
.edu-privacy { min-height: 100vh; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; padding: 64px 24px; }
.edu-privacy-wrap { max-width: 760px; margin: 0 auto; }
.edu-privacy-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; margin-bottom: 8px; }
.edu-privacy-title { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 400; line-height: 1.1; color: #1C1812; }
.edu-privacy-sub { font-size: 15px; color: rgba(28,24,18,0.6); margin-top: 10px; }
.edu-privacy-card { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1); border-radius: 16px; padding: 26px 30px; margin-bottom: 16px; }
.edu-privacy-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; margin-bottom: 10px; }
.edu-privacy-body { font-size: 14px; line-height: 1.75; color: rgba(28,24,18,0.78); }
.edu-privacy-body a { color: #3D6B4F; font-weight: 600; text-decoration: none; }
.edu-privacy-body a:hover { text-decoration: underline; }
.edu-privacy-updated { font-size: 12px; color: rgba(28,24,18,0.45); margin-top: 24px; text-align: center; }
`;

const SECTIONS: { label: string; body: React.ReactNode }[] = [
  {
    label: 'What we collect',
    body: (
      <>
        We collect the parent or guardian's name, email address, and password to create your account.
        For each child you add, we collect their first name, grade level, age, curriculum approach, and
        any learning accommodations you choose to share. We do not collect Social Security numbers,
        addresses, phone numbers, or any government identifiers.
      </>
    ),
  },
  {
    label: "How we use your children's data",
    body: (
      <>
        Your children's information is used for one purpose: to generate personalized lesson plans and
        curriculum recommendations through Ei-Core, our AI engine. We do not use your children's data to
        train AI models. We do not sell it, share it with advertisers, or provide it to third parties.
        Your family's data belongs to your family.
      </>
    ),
  },
  {
    label: 'The AI component (Ei-Core)',
    body: (
      <>
        Ei-Core is the AI engine that powers VeloxSync for Education. When you ask Ei-Core to generate a
        daily plan or curriculum recommendation, it receives your child's grade level, curriculum approach,
        learning style, and any notes you have added. It does not receive your child's full name or any
        identifying information. Ei-Core is powered by Claude, Anthropic's AI model. Anthropic's privacy
        policy governs how that data is processed. We never store the full content of AI conversations on
        our servers.
      </>
    ),
  },
  {
    label: 'COPPA compliance',
    body: (
      <>
        VeloxSync for Education is designed for use by parents and guardians, not directly by children
        under 13. We do not knowingly collect personal information directly from children. All account
        creation and data entry is performed by the parent or guardian. If you believe a child under 13
        has provided us information directly, contact us at{' '}
        <a href="mailto:privacy@veloxsync.app">privacy@veloxsync.app</a> and we will delete it immediately.
      </>
    ),
  },
  {
    label: 'State by state curriculum standards',
    body: (
      <>
        VeloxSync for Education includes standards from all 50 states. When you select your state during
        onboarding, Ei-Core uses your state's published curriculum standards to align lesson
        recommendations. We access these standards from publicly available state education department
        publications. We do not share your state selection with any state education agency or government
        body.
      </>
    ),
  },
  {
    label: 'Data retention',
    body: (
      <>
        Your account data is retained for as long as your account is active. If you delete your account,
        all family data including children's records, lesson history, and curriculum notes is permanently
        deleted within 30 days. You can request deletion at any time by emailing{' '}
        <a href="mailto:privacy@veloxsync.app">privacy@veloxsync.app</a>.
      </>
    ),
  },
  {
    label: 'Security',
    body: (
      <>
        VeloxSync is built by a CISSP certified security professional. All data is encrypted in transit
        using TLS. Passwords are hashed using bcrypt and never stored in plain text. We conduct regular
        security reviews and do not store payment information (all payments are processed by Stripe).
      </>
    ),
  },
  {
    label: 'Contact',
    body: (
      <>
        For privacy questions: <a href="mailto:privacy@veloxsync.app">privacy@veloxsync.app</a>
        <br />
        For account deletion: <a href="mailto:privacy@veloxsync.app">privacy@veloxsync.app</a>
        <br />
        For general support: <a href="mailto:support@veloxsync.app">support@veloxsync.app</a>
        <br />
        Meraki is Love LLC
      </>
    ),
  },
];

export default function EduPrivacy() {
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-privacy', 'true');
    styleEl.textContent = PRIVACY_CSS;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  return (
    <div className="edu-privacy">
      <div className="edu-privacy-wrap">
        <header style={{ marginBottom: 36 }}>
          <div className="edu-privacy-eyebrow">Privacy Policy</div>
          <h1 className="edu-privacy-title">Your family's privacy.</h1>
          <p className="edu-privacy-sub">Plain English. No surprises.</p>
        </header>

        {SECTIONS.map(section => (
          <section key={section.label} className="edu-privacy-card">
            <div className="edu-privacy-label">{section.label}</div>
            <p className="edu-privacy-body">{section.body}</p>
          </section>
        ))}

        <p className="edu-privacy-updated">Last updated: June 2026</p>
      </div>
    </div>
  );
}
