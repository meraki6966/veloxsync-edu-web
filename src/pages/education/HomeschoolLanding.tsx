// src/pages/education/HomeschoolLanding.tsx
// VeloxSync for Homeschool Families — Protect the Flow. Reclaim the Relationship.

import { useState } from 'react';
import { Link } from 'react-router-dom';

const SAMPLE_PORTFOLIO = `**The Opening (The Atmosphere)**

This semester, Elara moved through her studies with the quiet attention that Charlotte Mason educators recognize as a sign of genuine engagement. Rather than surface-level compliance, her work reflected a child who was reading to be changed by what she encountered. Her narration sessions grew in depth from week to week — early responses were accurate but thin; by mid-semester, she was drawing comparisons between historical figures unprompted, a sign that living connections were forming.

**The Mastery Narrative**

In Language Arts, Elara's written narration fluency increased measurably over the 14-week period. Her composition signal strength — tracked by sentence variety, idea development, and self-correction frequency — rose 24% from baseline. In Natural Sciences, she moved from observational description into early hypothesis formation, logging 9 independent nature journal entries with increasing analytical depth. In Mathematics, a focused 3-week sprint on fractions produced a 31% improvement in mastery signal, moving her from procedural dependence to relational understanding.

**The Human Signal**

In week 7, Elara encountered a significant cognitive wall around long division. She became disengaged across all subjects for approximately 4 days — a signal Ei-Core flagged as cross-subject friction, not subject-specific difficulty. The intervention: her parent paused the formal sequence and introduced a living mathematics read-aloud (Lilavati, adapted). Within 2 sessions, her curiosity re-engaged. She returned to division 6 days later and worked through the block with noticeably less frustration. The breakthrough was not about the algorithm — it was about restoring her relationship to the subject.

**The Compliance Translation**

The portfolio maps to the following state standard domains:
- ELA: Reading Informational Text (RI.5.1–5.3), Writing (W.5.2), Speaking & Listening (SL.5.4)
- Mathematics: Number & Operations — Fractions (5.NF), Operations & Algebraic Thinking (5.OA)
- Science: Earth and Life Science observation and journaling (NGSS 5-LS2-1, 5-ESS3-1)
- Social Studies: Historical thinking skills, primary source analysis, geographic reasoning

All documentation is family-owned and exportable in compliance-ready format.`;

function PortfolioModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-7 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="font-black text-slate-900 text-lg">Sample Portfolio — Elara Thompson</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Grade 5 · 2025–2026 · Charlotte Mason</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-2xl font-light leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest mb-6">
            📂 Ei-Core Narrative Portfolio · Charlotte Mason Method
          </div>
          <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
            {SAMPLE_PORTFOLIO.split('\n\n').map((block, i) => {
              if (block.startsWith('**') && block.includes('**\n')) {
                const [heading, ...rest] = block.split('\n');
                return (
                  <div key={i}>
                    <h3 className="font-black text-slate-900 text-sm mb-1.5">
                      {heading.replace(/\*\*/g, '')}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{rest.join(' ')}</p>
                  </div>
                );
              }
              if (block.startsWith('- ')) {
                return (
                  <ul key={i} className="list-none space-y-1 pl-0">
                    {block.split('\n').map((line, j) => (
                      <li key={j} className="text-sm text-slate-600 flex gap-2">
                        <span className="text-teal-500 flex-shrink-0">•</span>
                        {line.replace(/^- /, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p key={i} className="text-sm text-slate-600 leading-relaxed">{block}</p>;
            })}
          </div>
        </div>

        <div className="p-7 pt-0">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <p className="font-black text-slate-900 text-base mb-1">Ready to generate yours?</p>
            <p className="text-sm text-slate-500 mb-4">Start free — Ei-Core synthesizes your family's actual logs into a portfolio like this.</p>
            <Link
              to="/register?type=homeschool"
              className="inline-block bg-amber-500 text-white font-black text-sm px-8 py-3 rounded-full hover:bg-amber-600 transition-colors shadow-sm"
            >
              Generate Your Portfolio 🌱
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const PHILOSOPHY_CARDS = [
  {
    emoji: '📜',
    title: 'Classical (Trivium)',
    subtitle: 'Grammar · Logic · Rhetoric',
    desc: 'Ei-Core maps content to the stage of learning automatically — Grammar for knowledge, Logic for analysis, Rhetoric for expression.',
    bg: 'bg-teal-600',
    border: 'border-teal-700',
    tag: 'Stage-aware content mapping',
  },
  {
    emoji: '🌱',
    title: 'Montessori (Mastery)',
    subtitle: 'Self-directed · Hands-on · Mastery-based',
    desc: "Progress tracked by demonstrated mastery, not seat time. Ei-Core recognizes when your child is ready to move forward.",
    bg: 'bg-purple-600',
    border: 'border-purple-700',
    tag: 'Mastery-gated progression',
  },
  {
    emoji: '📖',
    title: 'Charlotte Mason (Narration)',
    subtitle: 'Living books · Nature study · Narration',
    desc: 'Guided prompts and Ei-Core synthesis turn daily observations into portfolio-ready documentation. Living lessons captured in your family vocabulary.',
    bg: 'bg-amber-500',
    border: 'border-amber-600',
    tag: 'Ei-Core narrative synthesis',
  },
];

export default function HomeschoolLanding() {
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {portfolioModalOpen && <PortfolioModal onClose={() => setPortfolioModalOpen(false)} />}

      {/* ── Nav ── */}
      <nav className="border-b border-slate-100 bg-white px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/education-home" className="flex items-center gap-3">
            <span className="text-3xl">🏡</span>
            <div>
              <span className="font-black text-slate-900 text-base">VeloxSync</span>
              <span className="ml-2 text-[10px] font-black text-amber-700 uppercase tracking-widest border border-amber-300 px-1.5 py-0.5 rounded-full bg-amber-50">
                Homeschool
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 hover:text-amber-700 transition-colors border-2 border-slate-200 px-4 py-2 rounded-full hover:border-amber-300"
            >
              Sign In
            </Link>
            <Link
              to="/education/checkout?plan=homeschool_family"
              className="px-5 py-2 rounded-full bg-amber-500 text-white text-sm font-black hover:bg-amber-600 transition-colors shadow-sm"
            >
              Start Free — No Credit Card
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden px-6 py-28 text-center"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #10B981 60%, #0D9488 100%)' }}
      >
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FDE68A, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #6EE7B7, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black uppercase tracking-wider mb-8 backdrop-blur-sm">
            <span>🏡</span> For Homeschool Families
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6 drop-shadow-sm">
            Protect the Flow.<br />
            <span className="text-yellow-200">Reclaim the Relationship.</span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
            VeloxSync maps to your family's philosophy — Classical, Montessori, or Charlotte Mason — and handles the paperwork so you can focus on learning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/education/checkout?plan=homeschool_family"
              className="inline-block bg-yellow-400 text-slate-900 font-black text-lg px-10 py-4 rounded-full hover:bg-yellow-300 transition-colors shadow-xl hover:-translate-y-0.5 transform"
            >
              Start Free — No Credit Card 🌱
            </Link>
          </div>

          {/* Privacy promise bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              'Your data never leaves your sovereign instance',
              'No public AI training',
              'Family-owned export',
            ].map((badge) => (
              <span
                key={badge}
                className="text-xs font-bold text-white/90 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm"
              >
                🔒 {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy Mapping ── */}
      <section className="px-6 py-20" style={{ background: '#FFFBEB' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider mb-4">
              📚 Philosophy Mapping
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Built for How Your Family Actually Learns</h2>
            <p className="text-slate-500 text-lg">
              Three philosophies. One platform. Ei-Core adapts to yours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {PHILOSOPHY_CARDS.map((card) => (
              <div
                key={card.title}
                className={`rounded-3xl p-8 text-white flex flex-col shadow-md hover:shadow-xl transition-all hover:-translate-y-1 transform ${card.bg} border-2 ${card.border}`}
              >
                <div className="text-5xl mb-5">{card.emoji}</div>
                <h3 className="font-black text-white text-xl mb-1">{card.title}</h3>
                <p className="text-white/70 text-sm mb-4 font-medium">{card.subtitle}</p>
                <p className="text-white/90 text-sm leading-relaxed flex-1 mb-5">{card.desc}</p>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-white/20 border border-white/30 px-3 py-1.5 rounded-full w-fit">
                  {card.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sovereign Portfolio ── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-black uppercase tracking-wider mb-4">
              📂 Sovereign Portfolio
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Your Portfolio. Your Proof.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left description */}
            <div>
              <ul className="space-y-6">
                {[
                  {
                    icon: '📄',
                    title: 'Auto-generated end-of-year portfolios',
                    desc: 'High-fidelity portfolios ready for state review. One click, beautifully formatted.',
                  },
                  {
                    icon: '🎤',
                    title: 'Narrative documentation with guided prompts and Ei-Core synthesis',
                    desc: "Guided prompts walk you through observations while Ei-Core synthesizes them into structured, portfolio-ready documentation.",
                  },
                  {
                    icon: '📥',
                    title: 'Export to PDF instantly',
                    desc: 'Families own their data. Export a complete learning record at any time, no lock-in.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="text-3xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-base mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Mock portfolio card */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-black text-slate-900 text-lg">Emma Richardson</p>
                  <p className="text-xs text-slate-500 font-medium">Grade 5 · 2025–2026 · Classical</p>
                </div>
                <span className="text-3xl">📂</span>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { subject: 'Language Arts', progress: 88, color: 'bg-teal-500' },
                  { subject: 'Mathematics', progress: 74, color: 'bg-purple-500' },
                  { subject: 'History & Geography', progress: 95, color: 'bg-amber-500' },
                  { subject: 'Natural Sciences', progress: 81, color: 'bg-emerald-500' },
                ].map((sub) => (
                  <div key={sub.subject}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700">{sub.subject}</span>
                      <span className="text-xs font-black text-slate-600">{sub.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className={`h-full rounded-full ${sub.color}`} style={{ width: `${sub.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
                <p className="text-xs font-bold text-amber-700 text-center">
                  📋 48 lessons documented · 3 portfolios generated
                </p>
              </div>

              <button
                onClick={() => setPortfolioModalOpen(true)}
                className="w-full bg-teal-600 text-white font-black text-sm py-3 rounded-full hover:bg-teal-700 transition-colors shadow-md"
              >
                Preview Sample Portfolio →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy First ── */}
      <section className="bg-slate-900 text-white px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Your Data is Sacred.
          </h2>
          <p className="text-3xl md:text-4xl font-black text-yellow-300 mb-8 leading-tight">
            "No-Report Guarantee"
          </p>
          <p className="text-slate-300 text-xl mb-16 max-w-2xl mx-auto leading-relaxed">
            Family data never leaves your sovereign instance unless you export it. No telemetry. No training pipelines. No exceptions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: '🔒',
                title: 'Zero-Retention AI',
                desc: 'Learning sessions are processed in real time and never stored in any shared model.',
                bg: 'bg-teal-500/10 border-teal-500/30',
                titleColor: 'text-teal-300',
              },
              {
                icon: '🚫',
                title: 'No Third-Party Sharing',
                desc: "Your family's data is never sold, rented, or shared with advertisers, researchers, or vendors.",
                bg: 'bg-purple-500/10 border-purple-500/30',
                titleColor: 'text-purple-300',
              },
              {
                icon: '📤',
                title: 'Sovereign Export Only',
                desc: 'You initiate every export. Data leaves your instance only when you choose, in your preferred format.',
                bg: 'bg-amber-500/10 border-amber-500/30',
                titleColor: 'text-amber-300',
              },
            ].map((pillar) => (
              <div key={pillar.title} className={`border-2 ${pillar.bg} rounded-3xl p-7 text-left`}>
                <div className="text-3xl mb-4">{pillar.icon}</div>
                <h3 className={`font-black text-base mb-2 ${pillar.titleColor}`}>{pillar.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="px-6 py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #10B981 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🌱</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Start your family's free trial
          </h2>
          <p className="text-white/90 text-xl mb-10 font-medium">
            7 days, no card required. Cancel anytime. Your data is yours to keep.
          </p>
          <Link
            to="/education/checkout?plan=homeschool_family"
            className="inline-block bg-yellow-400 text-slate-900 font-black text-lg px-12 py-5 rounded-full hover:bg-yellow-300 transition-colors shadow-xl hover:-translate-y-0.5 transform"
          >
            Start Free — 7 Days On Us 🎉
          </Link>
          <p className="text-white/70 text-xs mt-5 font-medium">
            🔒 Your data never leaves your sovereign instance · No credit card required
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="text-sm font-black text-slate-900">VeloxSync Homeschool</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-700 transition-colors">Terms of Service</Link>
            <a href="mailto:education@veloxsync.com" className="hover:text-slate-700 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} VeloxSync. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 mt-6 pt-5 border-t border-slate-100">
          <span>🔒 Sovereign Privacy</span>
          <span>·</span>
          <span>📚 Classical / Montessori / Charlotte Mason</span>
          <span>·</span>
          <span>📥 Family-Owned Export</span>
        </div>
      </footer>
    </div>
  );
}
