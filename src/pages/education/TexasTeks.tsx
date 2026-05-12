// src/pages/education/TexasTeks.tsx
// Public SEO page: Texas TEKS Intelligence Layer

import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'Native BKS & SE Hierarchy Mapping',
    desc: 'Ei-Core is trained on the full Texas Essential Knowledge and Skills breakdown — including the breadth/knowledge/skills (BKS) and student expectations (SE) levels — so alignment is automatic, not approximate.',
  },
  {
    title: 'Real-Time Small Group Generation',
    desc: 'As students demonstrate mastery or show gaps, Ei-Core immediately re-sorts small group recommendations to match current TEKS milestones — no manual regrouping required.',
  },
  {
    title: 'Grade-Band Progression Awareness',
    desc: 'Ei-Core understands vertical alignment across grade bands. It flags when a student\'s gap will compound into next year\'s TEKS prerequisites, giving you time to intervene now.',
  },
  {
    title: 'STAAR Readiness Signaling',
    desc: 'Automatic readiness scoring against STAAR-reporting categories. Know which students are on track for proficiency weeks before the test window.',
  },
  {
    title: 'District & Campus Reporting',
    desc: 'Export TEKS-aligned progress reports formatted for district data submission, ARD meetings, and instructional coaching conversations.',
  },
  {
    title: 'Cross-Subject TEKS Coverage',
    desc: 'Full coverage across ELA/Reading, Math, Science, Social Studies, and electives — not just tested subjects.',
  },
];

export default function TexasTeks() {
  useEffect(() => {
    document.title = 'Texas TEKS Intelligence Layer — VeloxSync for Education';

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "VeloxSync Texas TEKS Intelligence Layer",
      "alternateName": "TEKS Alignment AI for Texas Teachers",
      "operatingSystem": "Web",
      "applicationCategory": "EducationalApplication",
      "description": "Ei-Core is natively trained on Texas BKS and SE hierarchies. Automatically maps student classroom signals to required TEKS standards, generates real-time small groups, and signals STAAR readiness.",
      "author": {
        "@type": "Person",
        "name": "Adam McClarin",
        "url": "https://adammcclarin.com"
      },
      "offers": {
        "@type": "Offer",
        "price": "9.00",
        "priceCurrency": "USD",
        "description": "Teacher Pro Tier"
      },
      "keywords": "Texas TEKS alignment AI, TEKS automation teacher, STAAR readiness AI, Texas classroom data tool, BKS SE mapping, Texas small group instruction, IEP TEKS compliance, FERPA compliant Texas teacher tool, Ei-Core TEKS, VeloxSync Texas"
    });
    document.head.appendChild(schema);

    return () => {
      document.head.removeChild(schema);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Nav ── */}
      <nav className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-black text-slate-900 text-base">VeloxSync</span>
              <span className="ml-2 text-[10px] font-black text-teal-700 uppercase tracking-widest border border-teal-300 px-1.5 py-0.5 rounded-md bg-teal-50">Education</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-teal-700 transition-colors border border-slate-300 px-3 py-1.5 rounded-lg hover:border-teal-400">Sign In</Link>
            <Link to="/education/checkout" className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-black hover:bg-teal-700 transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <Link to="/education-home" className="hover:text-teal-700 transition-colors font-semibold">Education Home</Link>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-700 font-semibold">Texas TEKS Intelligence Layer</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-teal-900 to-teal-700 px-6 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-800/60 border border-teal-500/40 text-teal-200 text-xs font-black uppercase tracking-wider mb-6">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Texas TEKS · Ei-Core Powered
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Texas TEKS Intelligence Layer
          </h1>
          <p className="text-lg text-teal-100 leading-relaxed mb-4 max-w-2xl mx-auto">
            Texas educators spend 10+ hours per week manually mapping student performance to TEKS frameworks. Ei-Core eliminates that entirely.
          </p>
          <p className="text-base text-teal-200 leading-relaxed max-w-2xl mx-auto mb-10">
            Natively trained on Texas BKS and SE hierarchies — automatically mapping every classroom signal to required TEKS standards, in real time.
          </p>
          <Link
            to="/education/checkout"
            className="inline-block bg-white text-teal-800 font-black text-lg px-10 py-4 rounded-xl hover:bg-teal-50 transition-colors shadow-lg"
          >
            Start Free Trial
          </Link>
          <p className="text-xs text-teal-300 mt-3 flex items-center justify-center gap-1">
            🔒 Sovereign Security Enabled — Your data is encrypted and never used for AI training.
          </p>
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-7">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">😓</span>
                <h2 className="font-black text-rose-800 text-base">The Problem</h2>
              </div>
              <p className="text-sm text-rose-700 leading-relaxed mb-3">
                Texas educators face one of the most rigorous standards frameworks in the country. The Texas Essential Knowledge and Skills system requires explicit, documented alignment across every lesson, unit, and assessment.
              </p>
              <p className="text-sm text-rose-700 leading-relaxed">
                Most teachers spend 10+ hours per week manually cross-referencing student work against BKS and SE requirements — time that should be spent teaching.
              </p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-7">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚡</span>
                <h2 className="font-black text-teal-800 text-base">The Ei-Core Solution</h2>
              </div>
              <p className="text-sm text-teal-700 leading-relaxed mb-3">
                Ei-Core is trained on the complete Texas TEKS framework — every BKS category, every SE expectation, across every grade band and subject area.
              </p>
              <p className="text-sm text-teal-700 leading-relaxed">
                When you enter student data, Ei-Core automatically maps it to the relevant TEKS standards, generates small groups aligned to state milestones, and surfaces STAAR readiness signals — without you lifting a finger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-3">What the TEKS Intelligence Layer Does</h2>
            <p className="text-slate-500 text-sm">Built specifically for Texas classroom realities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-300 hover:shadow-sm transition-all">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-black text-slate-800 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Result Badge ── */}
      <section className="bg-teal-700 px-6 py-14 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-black text-teal-300 uppercase tracking-widest mb-3">The Result</p>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
            Real-time small group grouping aligned to state-mandated milestones
          </h2>
          <p className="text-teal-200 text-sm leading-relaxed max-w-xl mx-auto">
            Stop spending weekends with a TEKS binder. Spend them with your family. Ei-Core has it covered.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-3">Ready to reclaim your planning time?</h2>
          <p className="text-slate-500 text-sm mb-8">Start your free 14-day trial. No credit card required.</p>
          <Link
            to="/education/checkout"
            className="inline-block bg-teal-600 text-white font-black text-lg px-10 py-4 rounded-xl hover:bg-teal-700 transition-colors shadow-lg"
          >
            Start Free Trial
          </Link>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-1">
            🔒 Sovereign Security Enabled — Your data is encrypted and never used for AI training.
          </p>
          <div className="mt-6">
            <Link to="/education-home" className="text-sm text-teal-600 hover:text-teal-800 transition-colors font-semibold">
              ← Back to Education Home
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-black text-slate-900">VeloxSync Education</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-700 transition-colors">Terms of Service</Link>
            <a href="mailto:education@veloxsync.com" className="hover:text-slate-700 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} VeloxSync. All rights reserved.</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-200">
          <span>🛡️</span>
          <span>SOVEREIGN SECURE</span>
          <span>·</span>
          <span>FERPA Compliant</span>
          <span>·</span>
          <span>COPPA+ Certified</span>
          <span>·</span>
          <span>CISSP Oversight</span>
          <span>·</span>
          <span>Zero Student Data Retention</span>
        </div>
      </footer>
    </div>
  );
}
