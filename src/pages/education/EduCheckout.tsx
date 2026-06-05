import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, eduBilling } from '../../api';

const CHECKOUT_CSS = `
.edu-checkout {
  min-height: 100vh;
  background: #FAF7F2;
  font-family: 'Open Sans', sans-serif;
  color: #1C1812;
  padding: 80px 24px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.edu-checkout-shell {
  width: 100%;
  max-width: 560px;
  text-align: center;
}
.edu-checkout-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #3D6B4F;
  margin-bottom: 14px;
}
.edu-checkout-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(36px, 4vw, 52px);
  font-weight: 400;
  line-height: 1.1;
  color: #1C1812;
  margin-bottom: 12px;
}
.edu-checkout-title em { font-style: italic; color: #3D6B4F; }
.edu-checkout-sub {
  font-size: 15px;
  font-weight: 300;
  color: rgba(28,24,18,0.6);
  margin-bottom: 32px;
  line-height: 1.65;
}
.edu-checkout-toggle {
  display: inline-flex;
  align-items: center;
  background: #F3EDE3;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 100px;
  padding: 4px;
  margin-bottom: 28px;
}
.edu-checkout-toggle button {
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(28,24,18,0.65);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 9px 22px;
  border-radius: 100px;
  transition: all 0.2s;
}
.edu-checkout-toggle button.active {
  background: #FFFFFF;
  color: #3D6B4F;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(28,24,18,0.08);
}
.edu-checkout-save {
  font-size: 10px;
  font-weight: 600;
  color: #FFFFFF;
  background: #C4831A;
  padding: 2px 8px;
  border-radius: 100px;
  margin-left: 6px;
}
.edu-checkout-card {
  background: #FFFFFF;
  border: 1.5px solid rgba(61,107,79,0.25);
  border-radius: 24px;
  padding: 48px 40px;
  position: relative;
  box-shadow: 0 4px 32px rgba(28,24,18,0.06);
  text-align: left;
}
.edu-checkout-card::before {
  content: 'Most loved by families';
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: #3D6B4F;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 16px;
  border-radius: 100px;
  white-space: nowrap;
  letter-spacing: 0.04em;
}
.edu-checkout-plan-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  font-weight: 400;
  color: #1C1812;
  margin-bottom: 8px;
  text-align: center;
}
.edu-checkout-price {
  font-family: 'Cormorant Garamond', serif;
  font-size: 72px;
  font-weight: 300;
  color: #1C1812;
  line-height: 1;
  margin-bottom: 8px;
  text-align: center;
}
.edu-checkout-price sup {
  font-size: 30px;
  vertical-align: super;
  color: #3D6B4F;
  font-weight: 400;
}
.edu-checkout-price sub {
  font-size: 18px;
  color: rgba(28,24,18,0.5);
  font-family: 'Open Sans', sans-serif;
  font-weight: 300;
}
.edu-checkout-desc {
  font-size: 14px;
  font-weight: 300;
  color: rgba(28,24,18,0.6);
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.65;
}
.edu-checkout-divider {
  height: 1px;
  background: rgba(28,24,18,0.1);
  margin-bottom: 28px;
}
.edu-checkout-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin: 0 0 32px;
  padding: 0;
}
.edu-checkout-features li {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  font-size: 14px;
  font-weight: 300;
  color: rgba(28,24,18,0.7);
  line-height: 1.55;
}
.edu-checkout-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #EBF2EC;
  border: 1px solid rgba(61,107,79,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.edu-checkout-check svg { width: 9px; height: 9px; }
.edu-checkout-form-divider {
  margin: 8px 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(28,24,18,0.45);
}
.edu-checkout-form-divider::before,
.edu-checkout-form-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(28,24,18,0.1);
}
.edu-checkout-field { margin-bottom: 16px; text-align: left; }
.edu-checkout-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(28,24,18,0.6);
  margin-bottom: 8px;
}
.edu-checkout-input {
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
.edu-checkout-input:focus {
  outline: none;
  border-color: #3D6B4F;
}
.edu-checkout-input::placeholder { color: rgba(28,24,18,0.35); }
.edu-checkout-hint {
  font-size: 11px;
  color: rgba(28,24,18,0.45);
  margin-top: 6px;
}
.edu-checkout-error {
  background: rgba(229,62,62,0.08);
  border: 1px solid rgba(229,62,62,0.25);
  color: #B23A3A;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: left;
}
.edu-checkout-btn {
  display: block;
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  background: #3D6B4F;
  border: none;
  cursor: pointer;
  padding: 15px;
  border-radius: 100px;
  transition: background 0.2s, opacity 0.2s;
  margin-bottom: 12px;
}
.edu-checkout-btn:hover { background: #5A8F6A; }
.edu-checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.edu-checkout-note {
  font-size: 12px;
  color: rgba(28,24,18,0.5);
  text-align: center;
}
.edu-checkout-signin {
  font-size: 13px;
  color: rgba(28,24,18,0.55);
  text-align: center;
  margin-top: 18px;
}
.edu-checkout-signin a {
  color: #3D6B4F;
  text-decoration: none;
  font-weight: 600;
}
.edu-checkout-signin a:hover { text-decoration: underline; }
.edu-checkout-back {
  margin-top: 28px;
  text-align: center;
}
.edu-checkout-back a {
  font-size: 12px;
  color: rgba(28,24,18,0.5);
  text-decoration: none;
}
.edu-checkout-back a:hover { color: #3D6B4F; }
`;

const FEATURES = [
  'Up to 6 children, all grade levels K-12',
  'Unlimited Ei-Core AI lesson and curriculum generation',
  'Full ADHD support — focus mode, cognitive load, differentiated pacing',
  'Complete K-12 STEM and coding platform',
  '112 state standards pre-loaded, all subjects',
  'Daily personalized plans for every child every morning',
  'Portfolio-ready progress reports, FERPA compliant',
  'IEP accommodation tracking and support',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckSvg = () => (
  <svg viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4L3.5 6L6.5 2" stroke="#3D6B4F" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export default function EduCheckout() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-checkout', 'true');
    styleEl.textContent = CHECKOUT_CSS;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await auth.registerHomeschool({ email: email.trim(), password });
      const data = res.data ?? {};
      const token = data.token ?? data.accessToken;
      if (!token) {
        setError('Account created but no session token was returned. Please sign in.');
        setSubmitting(false);
        return;
      }
      localStorage.setItem('edu_token', token);
      if (data.user) {
        localStorage.setItem('edu_user', JSON.stringify(data.user));
      }

      // Account created — open Stripe Checkout for the selected billing cadence.
      // success_url lands the family on the dashboard; on any failure we fall back
      // to onboarding so the user is never stuck.
      try {
        const checkoutRes = await eduBilling.checkout(billing, {
          success_url: `${window.location.origin}/education/dashboard?checkout=success`,
          cancel_url: `${window.location.origin}/education/checkout?canceled=true`,
        });
        const url = checkoutRes.data?.url;
        if (url) {
          window.location.href = url;
          return;
        }
        // No URL returned — continue to onboarding rather than blocking the user.
        navigate('/education/onboarding');
      } catch {
        setError('Your account is ready, but we couldn’t open checkout. Taking you to setup…');
        setSubmitting(false);
        setTimeout(() => navigate('/education/onboarding'), 1500);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        'Could not create your account. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="edu-checkout">
      <div className="edu-checkout-shell">
        <div className="edu-checkout-eyebrow">VeloxSync for Education</div>
        <h1 className="edu-checkout-title">Start your <em>free trial.</em></h1>
        <p className="edu-checkout-sub">
          Everything Ei-Core can do for your family — one plan, no upgrades to chase.
        </p>

        <div className="edu-checkout-toggle">
          <button
            type="button"
            className={billing === 'monthly' ? 'active' : ''}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={billing === 'annual' ? 'active' : ''}
            onClick={() => setBilling('annual')}
          >
            Annual <span className="edu-checkout-save">Save 34%</span>
          </button>
        </div>

        <div className="edu-checkout-card">
          <div className="edu-checkout-plan-name">Family Plan</div>
          <div className="edu-checkout-price">
            <sup>$</sup>{billing === 'monthly' ? '19' : '149'}
            <sub>{billing === 'monthly' ? '/month' : '/year'}</sub>
          </div>
          <div className="edu-checkout-desc">
            For homeschool families. AI curriculum, ADHD support, K-12 STEM and coding — included from day one.
          </div>
          <div className="edu-checkout-divider"></div>
          <ul className="edu-checkout-features">
            {FEATURES.map((f) => (
              <li key={f}>
                <span className="edu-checkout-check"><CheckSvg /></span>
                {f}
              </li>
            ))}
          </ul>

          <div className="edu-checkout-form-divider">Create your account</div>

          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="edu-checkout-error">{error}</div>}

            <div className="edu-checkout-field">
              <label className="edu-checkout-label" htmlFor="edu-checkout-email">Email address</label>
              <input
                id="edu-checkout-email"
                className="edu-checkout-input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="edu-checkout-field">
              <label className="edu-checkout-label" htmlFor="edu-checkout-password">Password</label>
              <input
                id="edu-checkout-password"
                className="edu-checkout-input"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
              <div className="edu-checkout-hint">Use at least 8 characters.</div>
            </div>

            <div className="edu-checkout-field">
              <label className="edu-checkout-label" htmlFor="edu-checkout-confirm">Confirm password</label>
              <input
                id="edu-checkout-confirm"
                className="edu-checkout-input"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-type your password"
              />
            </div>

            <button
              type="submit"
              className="edu-checkout-btn"
              disabled={submitting || !email || !password || !confirm}
            >
              {submitting ? 'Creating account…' : 'Create account and start free trial'}
            </button>
            <div className="edu-checkout-note">No credit card required. Cancel any time.</div>
          </form>

          <div className="edu-checkout-signin">
            Already have an account? <a href="/education/login">Sign in</a>
          </div>
        </div>

        <div className="edu-checkout-back">
          <a href="/">← Back to home</a>
        </div>
      </div>
    </div>
  );
}
