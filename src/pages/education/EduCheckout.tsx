// src/pages/education/EduCheckout.tsx
// VeloxSync for Education — Plan Selection & Stripe Checkout

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { eduBilling } from '../../api';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  badge: string | null;
  highlight: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'teacher_pro',
    name: 'Teacher Pro',
    price: '$9',
    period: '/month',
    description: 'For individual classroom teachers who want AI-powered insight without the complexity.',
    badge: null,
    highlight: false,
    features: [
      'Up to 35 students',
      'Ei-Core AI curriculum advisor',
      'Standards library (all 50 states)',
      'Intervention tracker',
      'Differentiation groups & pacing guide',
      'CSV progress reports',
      'Email support',
    ],
  },
  {
    id: 'homeschool_family',
    name: 'Homeschool Family',
    price: '$12',
    period: '/month',
    description: 'Built for homeschool parents managing multiple children across different curricula.',
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Up to 8 children',
      'Multi-curriculum support',
      'Per-child pacing & progress tracking',
      'Family Ei-Core insights',
      'IEP & accommodation tracking',
      'Printable lesson plans',
      'Priority email support',
    ],
  },
  {
    id: 'school_license',
    name: 'School License',
    price: '$199',
    period: '/year',
    description: 'District-ready licensing with centralized management and admin reporting.',
    badge: null,
    highlight: false,
    features: [
      'Unlimited teachers & students',
      'Admin dashboard & reporting',
      'SIS / LMS integrations',
      'FERPA-compliant data handling',
      'Custom onboarding & training',
      'Dedicated account manager',
      'SLA-backed support',
    ],
  },
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function EduCheckout() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';
  const preselect = searchParams.get('plan') ?? '';

  const [selectedPlan, setSelectedPlan] = useState<string>(preselect || 'homeschool_family');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselect) setSelectedPlan(preselect);
  }, [preselect]);

  const handleStartTrial = async () => {
    if (selectedPlan === 'school_license') {
      window.location.href = 'mailto:education@veloxsync.com?subject=School License Inquiry';
      return;
    }
    setLoading(true);
    setError('');
    try {
      const origin = window.location.origin;
      const res = await eduBilling.checkout(selectedPlan, {
        success_url: `${origin}/education?checkout=success`,
        cancel_url: `${origin}/education-home#pricing`,
      });
      const url = res.data?.url ?? res.data?.checkout_url;
      if (url) {
        window.location.href = url;
      } else {
        // Dev fallback — no Stripe configured yet
        window.location.href = `/education?checkout=success`;
      }
    } catch {
      setError('Something went wrong. Please try again or contact support.');
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#060F1E] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">You're all set!</h1>
          <p className="text-slate-400 text-base mb-2">Your 14-day trial has started.</p>
          <p className="text-slate-500 text-sm mb-8">
            No payment is due today. We'll remind you before your trial ends — cancel anytime.
          </p>
          <Link
            to="/education"
            className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-base hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
          >
            Go to My Dashboard →
          </Link>
          <div className="mt-6">
            <Link to="/education-home" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              Back to pricing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Cancelled screen ────────────────────────────────────────────────────────
  if (cancelled) {
    return (
      <div className="min-h-screen bg-[#060F1E] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Checkout cancelled</h1>
          <p className="text-slate-400 text-sm mb-8">
            No worries — your trial hasn't started yet. Head back to pricing whenever you're ready.
          </p>
          <Link
            to="/education-home#pricing"
            className="inline-block px-8 py-4 rounded-2xl bg-blue-600/15 border border-blue-500/25 text-blue-300 font-black text-base hover:bg-blue-600/25 transition-colors"
          >
            ← Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  // ── Plan selection ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060F1E] px-4 py-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <Link to="/education-home" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-400 transition-colors mb-6">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to overview
        </Link>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-black text-white text-xl">VeloxSync Education</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Start your free trial</h1>
        <p className="text-slate-400 text-sm">14 days free. No credit card required. Cancel anytime.</p>
      </div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative text-left rounded-2xl p-5 border transition-all focus:outline-none ${
              selectedPlan === plan.id
                ? 'bg-blue-600/10 border-blue-500/50 ring-2 ring-blue-500/30'
                : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[10px] font-black uppercase tracking-wider">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Selected indicator */}
            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedPlan === plan.id ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
            }`}>
              {selectedPlan === plan.id && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <h3 className="font-black text-white text-base mb-1 pr-8">{plan.name}</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">{plan.description}</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-black text-white">{plan.price}</span>
              <span className="text-slate-400 text-sm mb-0.5">{plan.period}</span>
            </div>
            <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-4">14-day free trial</p>

            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-sm mx-auto text-center">
        {error && (
          <p className="text-sm text-red-400 mb-3">{error}</p>
        )}
        <button
          onClick={handleStartTrial}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-base hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-blue-500/25"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Redirecting to Stripe…
            </span>
          ) : selectedPlan === 'school_license' ? 'Contact Us' : 'Start Free Trial →'}
        </button>
        <p className="text-xs text-slate-500 mt-3">
          No credit card required · Cancel anytime
        </p>
      </div>
    </div>
  );
}
