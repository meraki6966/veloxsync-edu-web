// src/pages/education/CommonCore.tsx
// Public SEO page: Common Core State Standards Alignment

import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'CCSS Cluster & Domain Mapping',
    desc: 'Ei-Core maps student progress against CCSS clusters and domains in ELA and Math — not just broad grade-level expectations, but the specific standard strands that matter most.',
  },
  {
    title: 'Mastery Gap Detection Before They Compound',
    desc: 'When a student misses a foundational CCSS anchor standard, Ei-Core traces the downstream impact on upcoming standards — surfacing the gap before it cascades into deeper remediation needs.',
  },
  {
    title: '40+ State Automatic Alignment',
    desc: 'For states that adopted CCSS or aligned state standards, Ei-Core automatically routes student data through the appropriate framework — no manual state-switching required.',
  },
  {
    title: 'ELA Reading Foundational Skills Tracking',
    desc: 'Granular tracking across phonics, phonological awareness, fluency, and comprehension strands — aligned to CCSS progression from K through 5 and into the upper grades.',
  },
  {
    title: 'Mathematical Practice Standards Integration',
    desc: 'Beyond content standards, Ei-Core tracks the eight Mathematical Practice Standards — ensuring students are developing mathematical reasoning, not just procedural fluency.',
  },
  {
    title: 'Cross-Grade Vertical Alignment',
    desc: 'See exactly how today\'s skill gap will affect next year\'s CCSS expectations. Ei-Core\'s vertical alignment engine gives you the long view, not just the snapshot.',
  },
];

const STATES = [
  'California', 'New York', 'Illinois', 'New Jersey', 'Washington',
  'Oregon', 'Connecticut', 'Maryland', 'Massachusetts', 'Colorado',
  'Michigan', 'Minnesota', 'Nevada', 'Delaware', 'Hawaii',
  'Kentucky', 'Maine', 'New Hampshire', 'Rhode Island', 'Vermont',
];

export default function CommonCore() {
  useEffect(() => {
    document.title = 'Common Core State Standards Alignment — VeloxSync for Education';

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "VeloxSync Common Core Standards Engine",
      "alternateName": "Common Core Alignment AI for Teachers",
      "operatingSystem": "Web",
      "applicationCategory": "EducationalApplication",
      "description": "Ei-Core reads student progress against CCSS clusters and domains across 40+ states, surfacing mastery gaps before they compound. Automatic standard mapping for ELA and Math.",
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
      "keywords": "Common Core alignment AI, CCSS teacher tool, ELA math standards tracking, Common Core mastery gap detection, 40 state standards alignment, CCSS anchor standards, mathematical practice standards AI, Ei-Core CCSS, VeloxSync Common Core, FERPA compliant CCSS tool"
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
          <span className="text-slate-700 font-semibold">Common Core Standards Alignment</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-700 px-6 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-800/60 border border-blue-500/40 text-blue-200 text-xs font-black uppercase tracking-wider mb-6">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Common Core · Ei-Core Powered
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Common Core Standards Alignment
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed mb-4 max-w-2xl mx-auto">
            40+ states require CCSS alignment across ELA and Math. Tracking it manually is unsustainable.
          </p>
          <p className="text-base text-blue-200 leading-relaxed max-w-2xl mx-auto mb-10">
            Ei-Core reads student progress against CCSS clusters and domains, surfacing mastery gaps before they compound — automatically, across every state that requires it.
          </p>
          <Link
            to="/education/checkout"
            className="inline-block bg-white text-blue-800 font-black text-lg px-10 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Start Free Trial
          </Link>
          <p className="text-xs text-blue-300 mt-3 flex items-center justify-center gap-1">
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
                <span className="text-xl">📊</span>
                <h2 className="font-black text-rose-800 text-base">The Scale Problem</h2>
              </div>
              <p className="text-sm text-rose-700 leading-relaxed mb-3">
                Common Core spans over 500 individual standards across K-12 ELA and Math. Tracking every student's progress against every applicable standard — manually — is not a workflow. It's a full-time job.
              </p>
              <p className="text-sm text-rose-700 leading-relaxed">
                When teachers can't track CCSS alignment in real time, they're always teaching in the past — responding to gaps that already compounded.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-7">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚡</span>
                <h2 className="font-black text-blue-800 text-base">The Ei-Core Solution</h2>
              </div>
              <p className="text-sm text-blue-700 leading-relaxed mb-3">
                Ei-Core is trained on the full CCSS framework — every domain, cluster, and anchor standard in both ELA and Math. As students progress, it maps their learning signals to the appropriate CCSS nodes automatically.
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                You see the current mastery picture and the downstream impact — so you can intervene before a gap compounds into a larger remediation need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Common Core Alignment Features</h2>
            <p className="text-slate-500 text-sm">Automatic standard mapping across 40+ states.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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

      {/* ── States Grid ── */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-3">Supported Across 40+ States</h2>
          <p className="text-slate-500 text-sm mb-8">Ei-Core automatically routes to the right framework based on your state.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {STATES.map((state) => (
              <span key={state} className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
                {state}
              </span>
            ))}
            <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500">
              + 20 more states
            </span>
          </div>
        </div>
      </section>

      {/* ── Result Badge ── */}
      <section className="bg-blue-700 px-6 py-14 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-3">The Result</p>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
            Automatic standard mapping across 40+ states
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xl mx-auto">
            One platform. Every state. Every student. Real-time CCSS alignment without the manual overhead.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-3">Stop teaching to the standard list. Start teaching to your students.</h2>
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
