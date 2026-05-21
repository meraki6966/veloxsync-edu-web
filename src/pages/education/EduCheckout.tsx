import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  transition: background 0.2s;
  margin-bottom: 12px;
}
.edu-checkout-btn:hover { background: #5A8F6A; }
.edu-checkout-note {
  font-size: 12px;
  color: rgba(28,24,18,0.5);
  text-align: center;
}
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

const CheckSvg = () => (
  <svg viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4L3.5 6L6.5 2" stroke="#3D6B4F" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export default function EduCheckout() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-checkout', 'true');
    styleEl.textContent = CHECKOUT_CSS;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const handleStart = () => {
    // Stripe integration arrives in a later session — for now, route into
    // onboarding so the family can be set up.
    navigate('/education/onboarding');
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
          <button type="button" className="edu-checkout-btn" onClick={handleStart}>
            Start 14-day free trial
          </button>
          <div className="edu-checkout-note">No credit card required. Cancel any time.</div>
        </div>

        <div className="edu-checkout-back">
          <a href="/">← Back to home</a>
        </div>
      </div>
    </div>
  );
}
