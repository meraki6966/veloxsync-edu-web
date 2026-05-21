// src/components/EduTrialBanner.tsx
// Shows trial status: cream/amber warning banner (active) or cream/red blocking overlay (expired)

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eduBilling } from '../api';

interface TrialStatus {
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'none';
  trial_end?: string;
  days_remaining?: number;
}

const BANNER_CSS = `
.edu-trial-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(28,24,18,0.78);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  font-family: 'Open Sans', sans-serif;
}
.edu-trial-overlay-card {
  max-width: 440px; width: 100%; background: #FFFFFF;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 16px; padding: 36px 32px; text-align: center;
  box-shadow: 0 12px 48px rgba(28,24,18,0.2);
}
.edu-trial-overlay-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: rgba(229,62,62,0.08); border: 1px solid rgba(229,62,62,0.25);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px; color: #B23A3A;
}
.edu-trial-overlay-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 30px; font-weight: 500; color: #1C1812; margin-bottom: 8px;
}
.edu-trial-overlay-sub {
  font-size: 14px; color: rgba(28,24,18,0.6);
  line-height: 1.65; margin-bottom: 24px;
}
.edu-trial-overlay-btn {
  display: inline-block; width: 100%; padding: 13px;
  border-radius: 100px; background: #3D6B4F; color: #FFFFFF;
  text-decoration: none; font-size: 14px; font-weight: 600;
  transition: background 0.2s;
}
.edu-trial-overlay-btn:hover { background: #5A8F6A; }
.edu-trial-overlay-note { font-size: 11px; color: rgba(28,24,18,0.4); margin-top: 12px; }

.edu-trial-banner {
  width: 100%; padding: 10px 24px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; font-family: 'Open Sans', sans-serif;
  font-size: 13px;
}
.edu-trial-banner.amber {
  background: #FDF4E7;
  border-bottom: 1px solid rgba(196,131,26,0.2);
  color: #8a5d12;
}
.edu-trial-banner.urgent {
  background: rgba(229,62,62,0.08);
  border-bottom: 1px solid rgba(229,62,62,0.25);
  color: #B23A3A;
}
.edu-trial-banner-text {
  display: flex; align-items: center; gap: 8px;
  min-width: 0; flex: 1; font-weight: 500;
}
.edu-trial-banner-text svg { width: 16px; height: 16px; flex-shrink: 0; }
.edu-trial-banner-link {
  flex-shrink: 0;
  padding: 7px 14px; border-radius: 100px;
  font-size: 12px; font-weight: 600;
  text-decoration: none; white-space: nowrap;
  transition: opacity 0.2s;
}
.edu-trial-banner.amber .edu-trial-banner-link {
  background: #C4831A; color: #FFFFFF;
}
.edu-trial-banner.urgent .edu-trial-banner-link {
  background: #B23A3A; color: #FFFFFF;
}
.edu-trial-banner-link:hover { opacity: 0.88; }
`;

let bannerStylesInjected = false;
function ensureBannerStyles() {
  if (bannerStylesInjected) return;
  if (typeof document === 'undefined') return;
  if (document.head.querySelector('style[data-edu-trial-banner]')) {
    bannerStylesInjected = true;
    return;
  }
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-edu-trial-banner', 'true');
  styleEl.textContent = BANNER_CSS;
  document.head.appendChild(styleEl);
  bannerStylesInjected = true;
}

export default function EduTrialBanner() {
  const [trial, setTrial] = useState<TrialStatus | null>(null);

  useEffect(() => {
    ensureBannerStyles();
    eduBilling.status()
      .then(r => setTrial(r.data))
      .catch(() => {
        // API not wired yet — banner stays hidden
      });
  }, []);

  if (!trial) return null;

  const daysLeft = trial.days_remaining ?? (() => {
    if (!trial.trial_end) return null;
    const diff = new Date(trial.trial_end).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  })();

  if (trial.status === 'expired' || trial.status === 'canceled' || trial.status === 'past_due') {
    return (
      <div className="edu-trial-overlay">
        <div className="edu-trial-overlay-card">
          <div className="edu-trial-overlay-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="edu-trial-overlay-title">Your trial has ended</div>
          <p className="edu-trial-overlay-sub">
            Choose a plan to continue with VeloxSync. Your data is safe and waiting.
          </p>
          <Link to="/education/checkout" className="edu-trial-overlay-btn">Choose a plan →</Link>
          <p className="edu-trial-overlay-note">14-day free trial · No credit card required</p>
        </div>
      </div>
    );
  }

  if (trial.status === 'trialing' && daysLeft !== null) {
    const urgent = daysLeft <= 3;
    return (
      <div className={`edu-trial-banner ${urgent ? 'urgent' : 'amber'}`}>
        <div className="edu-trial-banner-text">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {daysLeft === 0
              ? 'Your free trial ends today'
              : `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
            {' '}— add a payment method to continue.
          </span>
        </div>
        <Link to="/education/checkout" className="edu-trial-banner-link">Upgrade now</Link>
      </div>
    );
  }

  return null;
}
