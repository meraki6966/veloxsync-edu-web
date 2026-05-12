// src/pages/education/EduLanding.tsx
// VeloxSync for Education — Brightwheel-inspired warm, colorful, teacher-friendly design

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    emoji: '🧠',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    iconColor: 'text-teal-600',
    label: 'Ei-Core AI Advisor',
    desc: 'Personalized curriculum recommendations powered by AI for every learner.',
  },
  {
    emoji: '📐',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconColor: 'text-amber-600',
    label: 'Standards Alignment',
    desc: 'CCSS, TEKS, NGSSS and 40+ state frameworks mapped automatically.',
  },
  {
    emoji: '📝',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconColor: 'text-rose-500',
    label: 'AI Assignment Generator',
    desc: 'Tell Ei-Core the grade, subject, state, and learning style. Get a complete, printable, standards-aligned assignment in seconds.',
  },
  {
    emoji: '🚩',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconColor: 'text-purple-600',
    label: 'Interventions Tracker',
    desc: 'Flag at-risk students early and document support strategies in one place.',
  },
  {
    emoji: '👥',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    iconColor: 'text-sky-600',
    label: 'Differentiation Groups',
    desc: 'Auto-sort students by mastery and generate targeted activity plans.',
  },
  {
    emoji: '📅',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconColor: 'text-emerald-600',
    label: 'Pacing Guide',
    desc: "See who's on track, who's ahead, and who needs a boost — week by week.",
  },
  {
    emoji: '🔗',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    iconColor: 'text-indigo-600',
    label: 'SIS & LMS Integrations',
    desc: 'Connect Google Classroom, Canvas, Clever, PowerSchool and more.',
  },
];

const PLANS = [
  {
    id: 'teacher_pro',
    name: 'Teacher Pro',
    price: '$9',
    period: '/month',
    description: 'For individual classroom teachers who want AI-powered insight without the complexity.',
    cta: 'Start Free — No Card Required',
    ctaLink: '/education/checkout?plan=teacher_pro',
    highlight: false,
    badge: null,
    accentColor: 'teal',
    headerBg: 'bg-teal-600',
    badgeBg: 'bg-teal-600',
    borderColor: 'border-teal-200',
    ctaBg: 'bg-teal-600 hover:bg-teal-700',
    trialColor: 'text-teal-600',
    checkColor: 'text-teal-500',
    features: [
      'Up to 35 students',
      'Ei-Core AI curriculum advisor',
      'Standards library (all 50 states)',
      'Intervention tracker',
      'Differentiation groups',
      'Pacing guide',
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
    cta: 'Start Free — No Card Required',
    ctaLink: '/education/checkout?plan=homeschool_family',
    highlight: true,
    badge: 'Most Popular',
    accentColor: 'amber',
    headerBg: 'bg-amber-500',
    badgeBg: 'bg-amber-500',
    borderColor: 'border-amber-300',
    ctaBg: 'bg-amber-500 hover:bg-amber-600',
    trialColor: 'text-amber-600',
    checkColor: 'text-amber-500',
    features: [
      'Up to 8 children',
      'Multi-curriculum support (Classical, CM, Eclectic…)',
      'Per-child pacing & progress tracking',
      'Family Ei-Core insights',
      'IEP & accommodation tracking',
      'Printable lesson plans',
      'Standards alignment (optional)',
      'Priority email support',
    ],
  },
  {
    id: 'school_license',
    name: 'School License',
    price: '$199',
    period: '/year',
    description: 'District-ready licensing for schools and admin teams with centralized management.',
    cta: 'Contact Us',
    ctaLink: 'mailto:education@veloxsync.com?subject=School License Inquiry',
    highlight: false,
    badge: null,
    isContact: true,
    accentColor: 'rose',
    headerBg: 'bg-rose-500',
    badgeBg: 'bg-rose-500',
    borderColor: 'border-rose-200',
    ctaBg: 'bg-rose-500 hover:bg-rose-600',
    trialColor: 'text-rose-500',
    checkColor: 'text-rose-400',
    features: [
      'Unlimited teachers & students',
      'Admin dashboard & reporting',
      'School-wide intervention tracking',
      'SIS / LMS integrations (Clever, PowerSchool…)',
      'FERPA-compliant data handling',
      'Custom onboarding & training',
      'Dedicated account manager',
      'SLA-backed support',
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'What is VeloxSync for Education?',
    a: 'VeloxSync for Education is an AI-powered platform that helps teachers, homeschool parents, and school administrators turn student data into actionable next steps — intervention recommendations, differentiation groups, pacing guidance, and more.',
  },
  {
    q: 'How does Ei-Core AI work for classrooms?',
    a: 'Ei-Core analyzes student progress data against your state standards, detects learning gaps early, and surfaces specific recommendations — which students need help, how to group them by mastery level, and what to teach next. It generates accommodation-aware plans for IEP students automatically.',
  },
  {
    q: 'Does it work for homeschool families?',
    a: 'Yes. The Homeschool Family plan supports up to 8 children across different curricula — Classical, Charlotte Mason, Eclectic, and more. Each child gets their own pacing guide, progress tracking, and Ei-Core insights.',
  },
  {
    q: 'Is student data safe and FERPA-compliant?',
    a: 'Absolutely. VeloxSync never sells or shares student data. All data is encrypted at rest and in transit. The School License plan includes full FERPA-compliant data handling with audit logs and role-based access control.',
  },
  {
    q: 'Which integrations are supported?',
    a: 'VeloxSync connects with Google Classroom, Canvas LMS, Clever, PowerSchool, and more. Most setups take under 15 minutes with no IT involvement required.',
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const PrivacyBadge = () => (
  <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
    🔒 Encrypted & never used for AI training.
  </p>
);

export default function EduLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 480);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Adam McClarin",
      "jobTitle": "Principal Architect",
      "url": "https://adammcclarin.com",
      "worksFor": {
        "@type": "Organization",
        "name": "Meraki Is Love",
        "url": "https://merakislove.com",
        "logo": "https://merakislove.com/logo.png"
      },
      "brand": [
        {
          "@type": "Brand",
          "name": "VeloxSync Platform",
          "url": "https://veloxsync.app",
          "description": "The Sovereign Business Operating System powered by Ei-Core AI."
        },
        {
          "@type": "Brand",
          "name": "AuraFit Intelligence",
          "url": "https://aurafit.ai",
          "description": "Tonally-matched AI fitness assistants built on VeloxSync architecture."
        }
      ],
      "knowsAbout": [
        "Sovereign Architecture",
        "Private AI Ecosystems",
        "CISSP Security Standards",
        "Systems Harmonization",
        "VeloxSync Platform Architecture"
      ],
      "sameAs": [
        "https://www.linkedin.com/in/adam-mcclarin",
        "https://medium.com/@adammcclarin",
        "https://adammcclarin1.substack.com",
        "https://dribbble.com/adammcclarin",
        "https://veloxsync.app",
        "https://www.veloxsync.app/education-home"
      ],
      "subjectOf": {
        "@type": "CreativeWork",
        "name": "Velox Academy: Sovereign Systems Education",
        "url": "https://www.veloxsync.app/education-home"
      }
    });
    document.head.appendChild(script);

    const eduScript = document.createElement('script');
    eduScript.type = 'application/ld+json';
    eduScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "VeloxSync for Education",
      "alternateName": "Classroom Intelligence Layer",
      "operatingSystem": "Web",
      "applicationCategory": "EducationalApplication",
      "description": "A Classroom Intelligence Layer powered by the Ei-Core engine. Automatically aligns student learning signals to Texas TEKS, Common Core standards, and IEP requirements.",
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
      "featureList": [
        "Native Texas TEKS Alignment",
        "Real-time IEP & 504 Compliance Monitoring",
        "Automated Small Group Instruction Grouping",
        "Cognitive Overload Signal Detection",
        "Cross-Vertical Ei-Core AI Integration"
      ],
      "educationalCredentialAwarded": "Texas TEKS Compliance Framework",
      "keywords": "TEKS alignment AI, IEP automation for teachers, Texas classroom data, Ei-Core education AI, student learning signals, FERPA compliant AI, SOPPA student privacy, homeschool curriculum AI, Charlotte Mason AI, Common Core alignment"
    });
    document.head.appendChild(eduScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(eduScript);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Sticky Nav ── */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      } bg-white border-b border-slate-100 shadow-md`}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-sm font-black text-slate-900">VeloxSync Education</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: 'Features', id: 'features' },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Pricing', id: 'pricing' },
              { label: 'FAQ', id: 'faq' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollToId(id)}
                className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
          <Link
            to="/education/checkout"
            className="px-5 py-2 rounded-full bg-teal-600 text-white text-sm font-black hover:bg-teal-700 transition-colors shadow-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </div>

      {/* ── Static Nav ── */}
      <nav className="border-b border-slate-100 bg-white px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <div>
              <span className="font-black text-slate-900 text-base">VeloxSync</span>
              <span className="ml-2 text-[10px] font-black text-teal-700 uppercase tracking-widest border border-teal-300 px-1.5 py-0.5 rounded-full bg-teal-50">Education</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-teal-700 transition-colors border-2 border-slate-200 px-4 py-2 rounded-full hover:border-teal-300">
              Sign In
            </Link>
            <Link to="/education/checkout" className="px-5 py-2 rounded-full bg-teal-600 text-white text-sm font-black hover:bg-teal-700 transition-colors shadow-sm">
              Start Free — No Card Required
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-24 text-center" style={{ background: 'linear-gradient(135deg, #0F766E 0%, #0891B2 60%, #38BDF8 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F59E0B, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F87171, transparent 70%)' }} />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black uppercase tracking-wider mb-8 backdrop-blur-sm">
            <span>✨</span>
            Powered by Ei-Core AI
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6 drop-shadow-sm">
            Every student learns differently.<br />
            <span className="text-yellow-300">Teachers don't have time to figure it out.</span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
            VeloxSync turns student data into exact next steps — who needs help, how to group them, what to teach next, and generates the assignments to make it happen.
          </p>
          <p className="text-sm text-white/70 font-medium mb-8">14-day free trial · No credit card required · Cancel anytime</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/education/checkout" className="inline-block bg-yellow-400 text-slate-900 font-black text-lg px-10 py-4 rounded-full hover:bg-yellow-300 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transform">
              Start Now — Free for 14 Days 🚀
            </a>
            <button onClick={() => scrollToId('how-it-works')} className="inline-flex items-center gap-2 px-6 py-4 rounded-full border-2 border-white/40 text-white font-bold text-sm hover:bg-white/10 transition-colors">
              See how it works ↓
            </button>
          </div>
          <PrivacyBadge />
        </div>
      </section>

      {/* ── Path Chooser ── */}
      <section className="bg-white px-6 py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Choose Your Path</p>
            <h2 className="text-3xl font-black text-slate-900">Who are you teaching?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Teacher / Admin path */}
            <Link
              to="/k12"
              className="group rounded-3xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 p-8 flex items-center gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-3xl flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                🏫
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-1">Teachers & Administrators</p>
                <h3 className="font-black text-slate-900 text-xl mb-1">I'm a Teacher or Administrator</h3>
                <p className="text-sm text-slate-600">TEKS alignment, IEP/504 Shield, district compliance.</p>
              </div>
              <svg className="w-5 h-5 text-teal-600 flex-shrink-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Homeschool parent path */}
            <Link
              to="/homeschool"
              className="group rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-8 flex items-center gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-3xl flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                🏡
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Homeschool Families</p>
                <h3 className="font-black text-slate-900 text-xl mb-1">I'm a Homeschool Parent</h3>
                <p className="text-sm text-slate-600">Classical, Montessori, Charlotte Mason — your philosophy, our platform.</p>
              </div>
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

          </div>
        </div>
      </section>

      {/* ── Dual Entry Path ── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3">Who are you teaching?</h2>
            <p className="text-slate-500 text-lg">We built two dedicated experiences — pick yours.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left Card — Classroom Teachers */}
            <div className="rounded-3xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 via-white to-sky-50 p-10 flex flex-col shadow-md hover:shadow-xl transition-shadow hover:-translate-y-1 transform">
              <div className="text-5xl mb-5">🏫</div>
              <span className="inline-block text-[10px] font-black text-teal-700 uppercase tracking-widest border border-teal-300 px-3 py-1 rounded-full bg-teal-100 mb-5 w-fit">
                For Classroom Teachers
              </span>
              <h2 className="text-3xl font-black text-slate-900 mb-3 leading-tight">
                Scale Your Impact.<br />Not Your Workload.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed mb-6">
                Built for teachers managing 25+ distinct learning signals simultaneously.
              </p>
              <ul className="space-y-3.5 mb-10 flex-1">
                {[
                  'Automated TEKS & IEP Alignment',
                  'One-Click Small Group Generation',
                  'District-Level Data Rigor',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-slate-700 font-medium">
                    <span className="text-teal-500 text-lg flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/k12"
                className="block w-full text-center bg-teal-600 text-white font-black text-base px-6 py-4 rounded-full hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg"
              >
                Launch Classroom Portal →
              </Link>
            </div>

            {/* Right Card — Homeschool Families */}
            <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-10 flex flex-col shadow-md hover:shadow-xl transition-shadow hover:-translate-y-1 transform">
              <div className="text-5xl mb-5">🏡</div>
              <span className="inline-block text-[10px] font-black text-amber-700 uppercase tracking-widest border border-amber-300 px-3 py-1 rounded-full bg-amber-100 mb-5 w-fit">
                For Homeschool Families
              </span>
              <h2 className="text-3xl font-black text-slate-900 mb-3 leading-tight">
                Personalized Pace.<br />Sovereign Progress.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed mb-6">
                Reclaim the joy of teaching by removing the administrative fog of homeschooling.
              </p>
              <ul className="space-y-3.5 mb-10 flex-1">
                {[
                  'Flexible Curriculum Mapping (Classical, Charlotte Mason, Montessori)',
                  'Holistic Family Progress Tracking',
                  'Stress-Free Portfolio Generation',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-slate-700 font-medium">
                    <span className="text-amber-500 text-lg flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/homeschool"
                className="block w-full text-center bg-amber-500 text-white font-black text-base px-6 py-4 rounded-full hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
              >
                Launch Homeschool Portal →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Standards & Compliance Authority ── */}
      <section className="px-6 py-20" style={{ background: '#F0FDFA' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-black uppercase tracking-wider mb-4">
              📚 Standards Intelligence
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">Built on every framework<br />your state requires</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Ei-Core is natively trained on every major state framework — so you never have to map it yourself.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-white rounded-3xl border-2 border-teal-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="text-4xl mb-5">⭐</div>
              <h3 className="font-black text-slate-900 text-xl mb-3">Texas TEKS Intelligence</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-3 flex-1">
                <span className="font-bold text-slate-700 block mb-1">The Problem:</span>
                Texas educators spend 10+ hours/week manually mapping student performance to TEKS frameworks.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                <span className="font-bold text-slate-700 block mb-1">The Solution:</span>
                Ei-Core auto-maps every classroom signal to required TEKS standards in real time.
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3 mb-4">
                <p className="text-sm font-black text-teal-700">✅ Real-time small group grouping aligned to state-mandated milestones</p>
              </div>
              <Link to="/education/texas-teks" className="text-sm font-black text-teal-600 hover:text-teal-800 transition-colors">
                Learn more about Texas TEKS →
              </Link>
            </div>

            <div className="bg-white rounded-3xl border-2 border-blue-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="text-4xl mb-5">🌍</div>
              <h3 className="font-black text-slate-900 text-xl mb-3">Common Core Standards</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-3 flex-1">
                <span className="font-bold text-slate-700 block mb-1">The Problem:</span>
                40+ states require CCSS alignment across ELA and Math — tracking it manually is unsustainable.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                <span className="font-bold text-slate-700 block mb-1">The Solution:</span>
                Ei-Core reads student progress against CCSS clusters, surfacing mastery gaps before they compound.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 mb-4">
                <p className="text-sm font-black text-blue-700">🗺️ Automatic standard mapping across 40+ states</p>
              </div>
              <Link to="/education/common-core" className="text-sm font-black text-blue-600 hover:text-blue-800 transition-colors">
                Learn more about Common Core →
              </Link>
            </div>

            <div className="bg-white rounded-3xl border-2 border-amber-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="text-4xl mb-5">🛡️</div>
              <h3 className="font-black text-slate-900 text-xl mb-3">Proactive IEP & 504</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-3 flex-1">
                <span className="font-bold text-slate-700 block mb-1">The Problem:</span>
                IEP compliance is reactive. Teachers struggle to prove accommodations were met in every lesson.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                <span className="font-bold text-slate-700 block mb-1">The Solution:</span>
                VeloxSync treats IEP requirements as Primary Signals — flagging gaps before they become compliance issues.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
                <p className="text-sm font-black text-amber-700">📋 Differentiation as a verified data point, not a goal</p>
              </div>
              <Link to="/education/iep-compliance" className="text-sm font-black text-amber-600 hover:text-amber-800 transition-colors">
                Learn more about IEP & 504 →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Positioning Anchor ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-3xl font-black text-slate-400 mb-3">Other edtech tools collect data.</p>
          <p className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">VeloxSync builds<br /><span className="text-teal-600">your assignments.</span></p>
        </div>
      </section>

      {/* ── Signal Cards / Painful Moments ── */}
      <section id="how-it-works" className="px-6 py-20" style={{ background: '#FFFBEB' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider mb-4">
              💡 Real Classroom Moments
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Built for the moments<br />that overwhelm you</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow" style={{ background: '#FEF2F2' }}>
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-5 text-3xl">😰</div>
              <h3 className="font-black text-red-800 text-xl mb-3">"This student is falling behind"</h3>
              <p className="text-base text-red-700/80 leading-relaxed">Ei-Core detects learning gaps against your state standards before a student is too far behind to catch up. You get the intervention recommendation, not just the data.</p>
            </div>

            <div className="rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow" style={{ background: '#FFFBEB' }}>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-5 text-3xl">🤹</div>
              <h3 className="font-black text-amber-800 text-xl mb-3">"Your class is split into 5 different levels"</h3>
              <p className="text-base text-amber-700/80 leading-relaxed">Stop teaching to the middle. VeloxSync auto-groups students by mastery and gives you differentiation strategies for each group.</p>
            </div>

            <div className="rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow" style={{ background: '#FAF5FF' }}>
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-5 text-3xl">📋</div>
              <h3 className="font-black text-purple-800 text-xl mb-3">"You have 3 IEP students and 22 others"</h3>
              <p className="text-base text-purple-700/80 leading-relaxed">Ei-Core generates accommodation-aware recommendations for every IEP student while keeping the whole class moving forward.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="bg-white px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-black uppercase tracking-wider mb-4">
              🛠️ Everything In One Place
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Everything you need in one classroom OS</h2>
            <p className="text-slate-500 text-lg">Built for teachers, homeschool parents, and school administrators.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.label} className={`${f.bg} border-2 ${f.border} rounded-3xl p-7 hover:shadow-lg transition-all hover:-translate-y-1 transform`}>
                <div className="text-4xl mb-5">{f.emoji}</div>
                <h3 className="font-black text-slate-900 text-lg mb-2">{f.label}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Steps ── */}
      <section className="px-6 py-20" style={{ background: '#F0FDFA' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-200 text-teal-800 text-xs font-black uppercase tracking-wider mb-4">
              ⚡ From Standard to Assignment
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Three steps. That's it.</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Ei-Core handles the rest.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-10 left-[36%] right-[36%] h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #0F766E, #F59E0B)' }} />
            {[
              {
                step: '1',
                color: '#0F766E',
                bg: 'bg-teal-600',
                shadow: 'shadow-teal-300',
                emoji: '🎯',
                title: 'Pick your standard',
                desc: 'Select grade, state, subject, and learning style. Ei-Core knows every state framework from TEKS to Common Core to Florida B.E.S.T.',
              },
              {
                step: '2',
                color: '#F59E0B',
                bg: 'bg-amber-500',
                shadow: 'shadow-amber-300',
                emoji: '✨',
                title: 'Ei-Core builds it',
                desc: 'A complete assignment appears instantly — theme, activities, rubric, differentiation options, and teacher notes all included.',
              },
              {
                step: '3',
                color: '#F87171',
                bg: 'bg-rose-400',
                shadow: 'shadow-rose-300',
                emoji: '🖨️',
                title: 'Download and teach',
                desc: "Print it, save it, or share it. Every assignment is ready to use the moment it's generated.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center relative">
                <div className={`w-24 h-24 rounded-full ${item.bg} flex flex-col items-center justify-center mb-6 shadow-xl ${item.shadow} relative z-10`}>
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-xs font-black text-white/80 mt-0.5">STEP {item.step}</span>
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-3">{item.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              to="/education/checkout"
              className="inline-block px-10 py-4 rounded-full bg-teal-600 text-white font-black text-base hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              Try It Free — No Card Required 🚀
            </Link>
            <PrivacyBadge />
          </div>
        </div>
      </section>

      {/* ── Differentiation Line ── */}
      <section className="border-y border-slate-100 bg-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl md:text-2xl font-bold text-slate-400 mb-2">
            PowerSchool stores records. Canvas tracks assignments.
          </p>
          <p className="text-3xl md:text-5xl font-black text-slate-900">VeloxSync tells you <span className="text-teal-600">what to teach next.</span></p>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-20" style={{ background: '#FAF5FF' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-wider mb-4">
              💳 Transparent Pricing
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg mb-3">Choose the plan that fits your classroom.</p>
            <p className="text-sm font-bold text-teal-600">
              ✅ All plans include a 14-day free trial. No credit card required to start.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl overflow-hidden flex flex-col bg-white shadow-md hover:shadow-xl transition-shadow ${
                  plan.highlight ? 'ring-4 ring-amber-400 ring-offset-2' : ''
                }`}
              >
                {/* Colored header strip */}
                <div className={`${plan.headerBg} px-8 pt-8 pb-6 text-white`}>
                  {plan.badge && (
                    <span className="inline-block px-3 py-1 rounded-full bg-white/30 text-white text-[10px] font-black uppercase tracking-wider mb-3">
                      🌟 {plan.badge}
                    </span>
                  )}
                  <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-white/70 text-base mb-1.5">{plan.period}</span>
                  </div>
                  <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-wider">14-day free trial included</p>
                </div>

                {/* Features */}
                <div className="px-8 py-6 flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                        <span className={`${plan.checkColor} text-lg flex-shrink-0 leading-none`}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-8 pb-8">
                  {plan.isContact ? (
                    <a
                      href={plan.ctaLink}
                      className={`${plan.ctaBg} text-white font-black px-8 py-4 rounded-full w-full text-center text-sm block transition-colors shadow-md`}
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <Link
                      to={plan.ctaLink}
                      className={`${plan.ctaBg} text-white font-black px-8 py-4 rounded-full w-full text-center text-sm block transition-colors shadow-md`}
                    >
                      {plan.cta}
                    </Link>
                  )}
                  <PrivacyBadge />
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-base font-bold text-slate-500 mt-10">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* ── Sovereign Privacy Shield ── */}
      <section className="bg-slate-900 text-white px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-6xl mb-6">🛡️</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Your Data is Sacred.<br /><span className="text-yellow-300">Not a Training Set.</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
              While other platforms rent your data to train corporate algorithms, we build a Sovereign Perimeter around your classroom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
            {[
              {
                title: 'Zero-Retention Intelligence',
                body: 'Student names, IEP details, and academic performance are processed in real-time but never used to train the Ei-Core model.',
                icon: '🔒',
                accent: 'border-teal-500/40 bg-teal-500/5',
                titleColor: 'text-teal-300',
              },
              {
                title: 'Private Instance Architecture',
                body: 'Your classroom data lives in an isolated environment. What happens in your lessons stays in your lessons.',
                icon: '🏛️',
                accent: 'border-yellow-500/40 bg-yellow-500/5',
                titleColor: 'text-yellow-300',
              },
              {
                title: 'CISSP-Certified Oversight',
                body: 'Security protocols designed by a Certified Information Systems Security Professional. Enterprise-level encryption for the elementary classroom.',
                icon: '🎖️',
                accent: 'border-purple-500/40 bg-purple-500/5',
                titleColor: 'text-purple-300',
              },
              {
                title: 'FERPA & COPPA+ Compliance',
                body: 'We exceed 2026 federal requirements. No third-party vendor ever has access to identifiable student metadata.',
                icon: '📋',
                accent: 'border-emerald-500/40 bg-emerald-500/5',
                titleColor: 'text-emerald-300',
              },
            ].map((pillar) => (
              <div key={pillar.title} className={`border-2 ${pillar.accent} rounded-3xl p-7 flex gap-5`}>
                <span className="text-3xl flex-shrink-0">{pillar.icon}</span>
                <div>
                  <h3 className={`font-black ${pillar.titleColor} text-base mb-2`}>{pillar.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mb-10">
            <p className="text-yellow-300 italic text-base max-w-xl mx-auto leading-relaxed mb-8 font-medium">
              "You own the signals. We just provide the lens. Export your data and classroom logic at any time."
            </p>
            <a
              href="/VeloxSync_Principal_OneSheet.pdf"
              download
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-black text-sm rounded-full border border-white/20 hover:bg-slate-100 transition-colors shadow-lg"
            >
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Security Briefing
            </a>
          </div>

          {/* Colorful trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-4 py-2">
              <span>🛡️</span>
              <span className="text-xs font-black text-teal-300 uppercase tracking-wider">Sovereign Secure</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2">
              <span>📋</span>
              <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">FERPA Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2">
              <span>👶</span>
              <span className="text-xs font-black text-purple-300 uppercase tracking-wider">COPPA+ Certified</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2">
              <span>🎖️</span>
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">CISSP Oversight</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-white px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider mb-4">
              ❓ Common Questions
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-lg">Everything you need to know before starting your free trial.</p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={`border-2 rounded-3xl overflow-hidden transition-all ${openFaq === i ? 'border-teal-300 shadow-md' : 'border-slate-200'}`}>
                <button
                  className="w-full flex items-center justify-between px-7 py-5 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-base font-black text-slate-800 pr-4">{item.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${openFaq === i ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <svg
                      className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-7 pb-6 border-t border-teal-100 bg-teal-50/30">
                    <p className="text-base text-slate-600 leading-relaxed pt-5">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-24 text-center" style={{ background: 'linear-gradient(135deg, #0F766E 0%, #0891B2 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Ready to teach smarter?
          </h2>
          <p className="text-white/80 text-xl mb-10 font-medium">
            Join thousands of teachers and homeschool families who spend less time sorting data and more time teaching.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/education/checkout" className="inline-block bg-yellow-400 text-slate-900 font-black text-lg px-12 py-5 rounded-full hover:bg-yellow-300 transition-colors shadow-xl hover:-translate-y-0.5 transform">
              Start Free — 14 Days On Us 🎉
            </Link>
            <a href="mailto:education@veloxsync.com" className="inline-block border-2 border-white/40 text-white font-bold text-base px-8 py-5 rounded-full hover:bg-white/10 transition-colors">
              Talk to a human →
            </a>
          </div>
          <PrivacyBadge />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-sm font-black text-slate-900">VeloxSync Education</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-700 transition-colors">Terms of Service</Link>
            <a href="mailto:education@veloxsync.com" className="hover:text-slate-700 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} VeloxSync. All rights reserved.</p>
        </div>
        <div className="max-w-6xl mx-auto mt-5 text-center">
          <p className="text-xs text-slate-400">
            For organizational leaders:{' '}
            <Link to="/sovereign-audit" className="text-violet-500 hover:text-violet-400 transition-colors font-bold">
              Take the Sovereign Audit →
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 mt-6 pt-5 border-t border-slate-100">
          <span>🛡️ SOVEREIGN SECURE</span>
          <span>·</span>
          <span>📋 FERPA Compliant</span>
          <span>·</span>
          <span>👶 COPPA+ Certified</span>
          <span>·</span>
          <span>🎖️ CISSP Oversight</span>
          <span>·</span>
          <span>🔒 Zero Student Data Retention</span>
        </div>
      </footer>
    </div>
  );
}
