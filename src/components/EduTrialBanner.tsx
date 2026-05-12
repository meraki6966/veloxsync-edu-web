// src/components/EduTrialBanner.tsx
// Shows trial status: amber warning banner (active) or red blocking overlay (expired)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eduBilling } from '../api';

interface TrialStatus {
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'none';
  trial_end?: string;    // ISO date string
  days_remaining?: number;
}

export default function EduTrialBanner() {
  const [trial, setTrial] = useState<TrialStatus | null>(null);

  useEffect(() => {
    eduBilling.status()
      .then(r => setTrial(r.data))
      .catch(() => {
        // API not wired yet — banner stays hidden
      });
  }, []);

  if (!trial) return null;

  // Compute days remaining from trial_end if days_remaining not provided
  const daysLeft = trial.days_remaining ?? (() => {
    if (!trial.trial_end) return null;
    const diff = new Date(trial.trial_end).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  })();

  // ── Expired / cancelled: blocking overlay ────────────────────────────────
  if (trial.status === 'expired' || trial.status === 'canceled' || trial.status === 'past_due') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-white mb-2">Your trial has ended</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Choose a plan to continue teaching with VeloxSync. Your data is safe and waiting.
          </p>
          <Link
            to="/education/checkout"
            className="inline-block w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm hover:opacity-90 transition-opacity"
          >
            Choose a Plan →
          </Link>
          <p className="text-xs text-slate-600 mt-3">14-day free trial · No credit card required</p>
        </div>
      </div>
    );
  }

  // ── Active trial: amber top banner ───────────────────────────────────────
  if (trial.status === 'trialing' && daysLeft !== null) {
    const urgent = daysLeft <= 3;
    return (
      <div className={`w-full px-4 py-2.5 flex items-center justify-between gap-4 text-sm ${
        urgent
          ? 'bg-red-500/10 border-b border-red-500/25'
          : 'bg-amber-500/10 border-b border-amber-500/20'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <svg className={`w-4 h-4 flex-shrink-0 ${urgent ? 'text-red-400' : 'text-amber-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`font-semibold truncate ${urgent ? 'text-red-300' : 'text-amber-300'}`}>
            {daysLeft === 0
              ? 'Your free trial ends today'
              : `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
            {' '}— add a payment method to continue.
          </span>
        </div>
        <Link
          to="/education/checkout"
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-black text-xs whitespace-nowrap transition-colors ${
            urgent
              ? 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30'
              : 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
          }`}
        >
          Upgrade Now
        </Link>
      </div>
    );
  }

  return null;
}
