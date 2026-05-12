// src/pages/education/K12Landing.tsx
// VeloxSync for K-12 — High-fidelity instruction, zero-friction compliance

import { Link } from 'react-router-dom';

const COMPARISON_ROWS = [
  {
    old: 'Manual TEKS tagging 2–3 hrs/week',
    new: 'Ei-Core auto-maps every lesson in real time',
  },
  {
    old: 'IEP tracked in spreadsheets — missed deadlines = legal exposure',
    new: 'Automated IEP/504 Shield flags every missed accommodation',
  },
  {
    old: "Small groups built from last month's test scores",
    new: "Groups generated from today's signal data",
  },
  {
    old: 'Burnout spotted after a crisis',
    new: 'Cognitive overload flagged before student shuts down',
  },
  {
    old: 'Security reviewed by IT once a year',
    new: 'CISSP-certified continuous sovereign protection',
  },
  {
    old: 'District approval takes weeks',
    new: 'One-page security briefing + DPA pre-built for admin sign-off',
  },
];

export default function K12Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Nav ── */}
      <nav className="border-b border-slate-100 bg-white px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/education-home" className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <div>
              <span className="font-black text-slate-900 text-base">VeloxSync</span>
              <span className="ml-2 text-[10px] font-black text-teal-700 uppercase tracking-widest border border-teal-300 px-1.5 py-0.5 rounded-full bg-teal-50">
                K-12
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 hover:text-teal-700 transition-colors border-2 border-slate-200 px-4 py-2 rounded-full hover:border-teal-300"
            >
              Sign In
            </Link>
            <Link
              to="/education/checkout?plan=teacher_pro"
              className="px-5 py-2 rounded-full bg-teal-600 text-white text-sm font-black hover:bg-teal-700 transition-colors shadow-sm"
            >
              Launch 14-Day Pilot
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden px-6 py-28 text-center"
        style={{ background: 'linear-gradient(135deg, #0F766E 0%, #0891B2 55%, #38BDF8 100%)' }}
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F59E0B, transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #F87171, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black uppercase tracking-wider mb-8 backdrop-blur-sm">
            <span>🏫</span> For K-12 Teachers & Administrators
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6 drop-shadow-sm">
            High-Fidelity Instruction.<br />
            <span className="text-yellow-300">Zero-Friction Compliance.</span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
            VeloxSync shifts K-12 teachers from data entry to instructional leadership — automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/education/checkout?plan=teacher_pro"
              className="inline-block bg-teal-500 hover:bg-teal-400 text-white font-black text-lg px-10 py-4 rounded-full transition-colors shadow-xl hover:-translate-y-0.5 transform border-2 border-white/20"
            >
              Launch 14-Day Pilot
            </Link>
            <a
              href="/VeloxSync_Principal_OneSheet.pdf"
              download
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white/50 text-white font-bold text-base hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Security Briefing
            </a>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['TEKS Aligned', 'IEP/504 Shield', 'FERPA/COPPA+', 'CISSP Oversight'].map((badge) => (
              <span
                key={badge}
                className="text-xs font-black text-white/90 uppercase tracking-wider bg-white/10 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance & Rigor ── */}
      <section className="px-6 py-20" style={{ background: '#F0FDFA' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-black uppercase tracking-wider mb-4">
              🛡️ Compliance & Rigor
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Built on the frameworks that matter</h2>
            <p className="text-slate-500 text-lg">Real-time protection, so teachers stay in front of students — not behind paperwork.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left: TEKS Alignment */}
            <div className="bg-white rounded-3xl border-2 border-teal-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="text-4xl mb-5">⭐</div>
              <h3 className="font-black text-slate-900 text-2xl mb-3">Automated TEKS Alignment</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Real-time mapping to Texas TEKS and Common Core. Teachers never manually tag a lesson again.
              </p>

              {/* Mock standards mapping card */}
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex-1">
                <p className="text-xs font-black text-teal-700 uppercase tracking-wider mb-3">
                  Standards Mapping — Live Preview
                </p>
                <div className="space-y-2">
                  {[
                    { code: 'TEKS 4.3A', label: 'Number & Operations · Fractions', match: 98 },
                    { code: 'CCSS.MATH.4.NF.A.1', label: 'Equivalence · Fractions', match: 94 },
                    { code: 'TEKS 4.3B', label: 'Decomposing Fractions', match: 87 },
                  ].map((std) => (
                    <div key={std.code} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-teal-100">
                      <div>
                        <span className="text-xs font-black text-teal-700">{std.code}</span>
                        <p className="text-xs text-slate-500 mt-0.5">{std.label}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-teal-100 overflow-hidden">
                          <div className="h-full rounded-full bg-teal-500" style={{ width: `${std.match}%` }} />
                        </div>
                        <span className="text-xs font-black text-teal-600">{std.match}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-teal-600 font-bold mt-3 text-center uppercase tracking-wider">
                  ✅ Auto-mapped · No manual tagging
                </p>
              </div>
            </div>

            {/* Right: IEP/504 Shield */}
            <div className="bg-white rounded-3xl border-2 border-amber-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="text-4xl mb-5">🛡️</div>
              <h3 className="font-black text-slate-900 text-2xl mb-3">IEP/504 Shield</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Automated tracking layer that flags missed accommodations before they become legal gaps.
              </p>

              {/* Mock alert card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex-1">
                <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-3">
                  Accommodation Status — Today
                </p>
                <div className="space-y-2.5">
                  {[
                    { student: 'Jordan M.', accommodation: 'Extended time · ELA', status: 'met', label: 'Met' },
                    { student: 'Riley T.', accommodation: 'Preferential seating · Math', status: 'met', label: 'Met' },
                    { student: 'Avery S.', accommodation: 'Read-aloud support · Science', status: 'alert', label: 'Flagged' },
                    { student: 'Casey R.', accommodation: 'Reduced distraction · All', status: 'met', label: 'Met' },
                  ].map((item) => (
                    <div
                      key={item.student}
                      className={`flex items-center justify-between rounded-xl px-4 py-2.5 border ${
                        item.status === 'alert'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-green-100'
                      }`}
                    >
                      <div>
                        <span className={`text-xs font-black ${item.status === 'alert' ? 'text-red-700' : 'text-slate-700'}`}>
                          {item.student}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">{item.accommodation}</p>
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full ${
                          item.status === 'alert'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.status === 'alert' ? '⚠️ ' : '✓ '}{item.label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-amber-600 font-bold mt-3 text-center uppercase tracking-wider">
                  Real-time monitoring · Pre-legal gap detection
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3">Old Way vs. The VeloxSync Way</h2>
            <p className="text-slate-500 text-lg">Six real shifts in how your classroom operates.</p>
          </div>

          <div className="rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md">
            {/* Header row */}
            <div className="grid grid-cols-2">
              <div className="bg-slate-100 px-8 py-5 border-r border-slate-200">
                <p className="font-black text-slate-400 text-base uppercase tracking-wider line-through decoration-slate-400">
                  The Old Way
                </p>
              </div>
              <div className="bg-teal-600 px-8 py-5">
                <p className="font-black text-white text-base uppercase tracking-wider">
                  ✅ The VeloxSync Way
                </p>
              </div>
            </div>

            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 border-t border-slate-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
              >
                <div className="px-8 py-5 border-r border-slate-200 flex items-start gap-3">
                  <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">✗</span>
                  <p className="text-sm text-slate-500 leading-relaxed">{row.old}</p>
                </div>
                <div className="px-8 py-5 flex items-start gap-3">
                  <span className="text-teal-500 text-lg flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm text-slate-800 font-semibold leading-relaxed">{row.new}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ei-Core Intervention Engine ── */}
      <section className="bg-white px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-black uppercase tracking-wider mb-4">
              🧠 Ei-Core™ Intelligence
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">The Ei-Core™ Intervention Engine</h2>
            <p className="text-slate-500 text-lg">Two signals that change everything about your instructional day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Small-Group Generator */}
            <div className="rounded-3xl border-2 border-teal-200 bg-teal-50 p-8 hover:shadow-md transition-shadow">
              <div className="text-5xl mb-5">👥</div>
              <h3 className="font-black text-teal-900 text-2xl mb-3">Small-Group Generator</h3>
              <p className="text-teal-800 leading-relaxed mb-5">
                One-click grouping based on today's performance signals. Stop teaching to last month's data.
              </p>
              <div className="bg-white rounded-2xl border border-teal-200 px-5 py-4">
                <p className="text-xs font-black text-teal-700 uppercase tracking-wider mb-3">Today's Groups — ELA Block</p>
                <div className="space-y-2">
                  {[
                    { group: 'Group A — Mastery', count: '8 students', color: 'bg-teal-100 text-teal-700' },
                    { group: 'Group B — Approaching', count: '11 students', color: 'bg-amber-100 text-amber-700' },
                    { group: 'Group C — Intervention', count: '6 students', color: 'bg-red-100 text-red-700' },
                  ].map((g) => (
                    <div key={g.group} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{g.group}</span>
                      <span className={`text-xs font-black px-3 py-1 rounded-full ${g.color}`}>{g.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invisible Wall Alert */}
            <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-8 hover:shadow-md transition-shadow">
              <div className="text-5xl mb-5">⚠️</div>
              <h3 className="font-black text-amber-900 text-2xl mb-3">Invisible Wall Alert</h3>
              <p className="text-amber-800 leading-relaxed mb-5">
                Flags students who hit cognitive overload before they disengage — so you can intervene while there's still time.
              </p>
              <div className="bg-white rounded-2xl border border-amber-200 px-5 py-4">
                <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-3">Overload Signals — Right Now</p>
                <div className="space-y-2">
                  {[
                    { student: 'Marcus K.', signal: 'Off-task for 8 min · Math', level: 'High' },
                    { student: 'Sofia L.', signal: 'Incomplete 3 consecutive tasks', level: 'Moderate' },
                  ].map((s) => (
                    <div key={s.student} className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-black text-slate-800">{s.student}</span>
                        <p className="text-xs text-slate-500">{s.signal}</p>
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0 ${
                        s.level === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Admin Green Light ── */}
      <section
        className="px-6 py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #0F766E 0%, #0D5E58 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-6xl mb-6">🏛️</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Built for District Approval
          </h2>
          <p className="text-teal-100 text-lg mb-12 max-w-2xl mx-auto">
            Every piece of the compliance stack is pre-built — so your IT director and legal team can sign off without a multi-month review cycle.
          </p>

          {/* Three trust items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {[
              { icon: '📋', title: 'FERPA/COPPA+ Compliant', desc: 'Exceeds 2026 federal requirements. No student metadata shared with third parties.' },
              { icon: '🔒', title: 'Zero-Retention AI', desc: 'Student names and IEP details are never used to train Ei-Core. Processed and discarded.' },
              { icon: '🎖️', title: 'CISSP Oversight', desc: 'Designed and audited by a Certified Information Systems Security Professional.' },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 border border-white/20 rounded-3xl p-6 text-left">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-black text-white text-base mb-2">{item.title}</h3>
                <p className="text-teal-100/80 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/VeloxSync_Principal_OneSheet.pdf"
              download
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-black text-sm rounded-full hover:bg-slate-100 transition-colors shadow-lg"
            >
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Security Whitepaper
            </a>
            <Link
              to="/education/checkout?plan=teacher_pro"
              className="inline-block bg-yellow-400 text-slate-900 font-black text-base px-10 py-4 rounded-full hover:bg-yellow-300 transition-colors shadow-xl hover:-translate-y-0.5 transform"
            >
              Launch a 14-Day Departmental Pilot 🚀
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-sm font-black text-slate-900">VeloxSync K-12</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-700 transition-colors">Terms of Service</Link>
            <a href="mailto:education@veloxsync.com" className="hover:text-slate-700 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} VeloxSync. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 mt-6 pt-5 border-t border-slate-100">
          <span>🛡️ FERPA/COPPA+</span>
          <span>·</span>
          <span>⭐ TEKS Aligned</span>
          <span>·</span>
          <span>🛡️ IEP/504 Shield</span>
          <span>·</span>
          <span>🎖️ CISSP Oversight</span>
        </div>
      </footer>
    </div>
  );
}
