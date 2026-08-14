import { useEffect, useState } from 'react';

const CALENDLY_URL = 'https://calendly.com/hello-merakislove/new-meeting';

const EDU_LANDING_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

:root {
  --cream: #FAF7F2;
  --cream-dark: #F3EDE3;
  --cream-deeper: #EDE5D8;
  --ink: #1C1812;
  --ink-mid: #3D3528;
  --ink-light: rgba(28,24,18,0.5);
  --ink-faint: rgba(28,24,18,0.1);
  --green: #3D6B4F;
  --green-light: #5A8F6A;
  --green-pale: #EBF2EC;
  --green-dim: rgba(61,107,79,0.1);
  --teal: #2A7F7F;
  --teal-pale: #E8F4F4;
  --teal-dim: rgba(42,127,127,0.1);
  --purple: #5B4B8A;
  --purple-pale: #F0EDF8;
  --purple-dim: rgba(91,75,138,0.1);
  --amber: #C4831A;
  --amber-pale: #FDF4E7;
  --stem-blue: #1D5FA6;
  --stem-blue-pale: #E8F0FB;
  --stem-blue-dim: rgba(29,95,166,0.1);
  --white: #FFFFFF;
  --border: rgba(28,24,18,0.1);
  --shadow-soft: 0 4px 32px rgba(28,24,18,0.06);
  --shadow-card: 0 2px 16px rgba(28,24,18,0.08);
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Open Sans', sans-serif;
  --font-code: Verdana, Geneva, sans-serif;
  --radius: 16px;
  --radius-sm: 8px;
}

.edu-landing {
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-body);
  font-weight: 400;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.edu-landing ::selection { background: var(--green); color: var(--white); }

/* COOKIE BANNER */
.edu-landing .cookie-banner {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 999;
  background: var(--ink); padding: 16px 40px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  transform: translateY(0); transition: transform 0.4s ease;
}
.edu-landing .cookie-banner.hidden { transform: translateY(110%); }
.edu-landing .cookie-text { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.6; max-width: 600px; }
.edu-landing .cookie-text a { color: #8FBF9F; text-decoration: underline; cursor: pointer; }
.edu-landing .cookie-actions { display: flex; gap: 10px; flex-shrink: 0; }
.edu-landing .cookie-accept { font-family: var(--font-body); font-size: 12px; font-weight: 600; color: var(--ink); background: #8FBF9F; border: none; cursor: pointer; padding: 8px 20px; border-radius: 100px; transition: background 0.2s; }
.edu-landing .cookie-accept:hover { background: #a8d4b5; }
.edu-landing .cookie-decline { font-family: var(--font-body); font-size: 12px; color: rgba(255,255,255,0.45); background: transparent; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; padding: 8px 16px; border-radius: 100px; }

/* NAV */
.edu-landing nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 68px;
  background: rgba(250,247,242,0.94); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
.edu-landing .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.edu-landing .nav-logo-mark { width: 32px; height: 32px; background: var(--green); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.edu-landing .nav-logo-mark svg { width: 18px; height: 18px; }
.edu-landing .nav-wordmark .name { font-family: var(--font-display); font-size: 18px; font-weight: 500; color: var(--ink); line-height: 1; letter-spacing: 0.01em; }
.edu-landing .nav-wordmark .name span { color: var(--green); }
.edu-landing .nav-wordmark .sub { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--green); margin-top: 1px; display: block; }
.edu-landing .nav-links { display: flex; align-items: center; gap: 28px; }
.edu-landing .nav-links a { font-size: 13px; font-weight: 400; color: var(--ink-mid); text-decoration: none; transition: color 0.2s; }
.edu-landing .nav-links a:hover { color: var(--green); }
.edu-landing .nav-actions { display: flex; align-items: center; gap: 12px; }
.edu-landing .btn-nav-ghost { font-family: var(--font-body); font-size: 13px; color: var(--ink-mid); background: none; border: none; cursor: pointer; }
.edu-landing .btn-nav-primary { font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--white); background: var(--green); border: none; cursor: pointer; padding: 10px 22px; border-radius: 100px; transition: background 0.2s; }
.edu-landing .btn-nav-primary:hover { background: var(--green-light); }

/* HERO */
.edu-landing .hero { padding-top: 68px; min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
.edu-landing .hero-left { display: flex; flex-direction: column; justify-content: center; padding: 80px 64px 80px 80px; }
.edu-landing .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: var(--green-dim); border: 1px solid rgba(61,107,79,0.2); border-radius: 100px; padding: 6px 14px; margin-bottom: 32px; width: fit-content; animation: fadeUp 0.7s ease both; }
.edu-landing .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2.5s infinite; }
.edu-landing .hero-eyebrow span { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--green); }
.edu-landing .hero-headline { font-family: var(--font-display); font-size: clamp(44px, 4.5vw, 68px); font-weight: 300; line-height: 1.1; letter-spacing: -0.01em; color: var(--ink); margin-bottom: 24px; animation: fadeUp 0.7s 0.1s ease both; }
.edu-landing .hero-headline em { font-style: italic; color: var(--green); }
.edu-landing .hero-headline .strike { text-decoration: line-through; color: var(--ink-light); }
.edu-landing .hero-sub { font-size: 16px; font-weight: 300; line-height: 1.75; color: var(--ink-mid); max-width: 440px; margin-bottom: 16px; animation: fadeUp 0.7s 0.2s ease both; }
.edu-landing .hero-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; animation: fadeUp 0.7s 0.25s ease both; }
.edu-landing .hero-tag { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; }
.edu-landing .hero-tag-green { color: var(--green); background: var(--green-pale); border: 1px solid rgba(61,107,79,0.2); }
.edu-landing .hero-tag-purple { color: var(--purple); background: var(--purple-pale); border: 1px solid rgba(91,75,138,0.2); }
.edu-landing .hero-tag-blue { color: var(--stem-blue); background: var(--stem-blue-pale); border: 1px solid rgba(29,95,166,0.2); }
.edu-landing .hero-actions { display: flex; align-items: center; gap: 14px; margin-bottom: 40px; animation: fadeUp 0.7s 0.3s ease both; }
.edu-landing .btn-primary { font-family: var(--font-body); font-size: 15px; font-weight: 600; color: var(--white); background: var(--green); border: none; cursor: pointer; padding: 14px 32px; border-radius: 100px; transition: background 0.2s, transform 0.15s; display: inline-block; text-decoration: none; }
.edu-landing .btn-primary:hover { background: var(--green-light); transform: translateY(-1px); }
.edu-landing .btn-secondary { font-family: var(--font-body); font-size: 15px; font-weight: 400; color: var(--ink-mid); background: transparent; border: 1.5px solid var(--border); cursor: pointer; padding: 13px 28px; border-radius: 100px; transition: border-color 0.2s, color 0.2s; }
.edu-landing .btn-secondary:hover { border-color: var(--green); color: var(--green); }
.edu-landing .hero-proof { display: flex; align-items: center; gap: 20px; animation: fadeUp 0.7s 0.4s ease both; flex-wrap: wrap; }
.edu-landing .hero-proof-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-light); }
.edu-landing .hero-proof-check { width: 16px; height: 16px; border-radius: 50%; background: var(--green-pale); border: 1px solid rgba(61,107,79,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.edu-landing .hero-proof-check svg { width: 8px; height: 8px; }
.edu-landing .hero-proof-divider { width: 1px; height: 14px; background: var(--border); }
.edu-landing .hero-right { position: relative; overflow: hidden; }
.edu-landing .hero-img { position: absolute; inset: 0; background: url('https://res.cloudinary.com/dhkuivp0s/image/upload/v1779387308/heroimage_tpjet2.jpg') center/cover no-repeat; }
.edu-landing .hero-img-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(250,247,242,0.1) 0%, transparent 100%); }
.edu-landing .hero-float { position: absolute; bottom: 48px; left: 32px; display: flex; flex-direction: column; gap: 10px; z-index: 3; animation: fadeIn 1s 0.8s ease both; opacity: 0; }
.edu-landing .hero-float-card { background: rgba(250,247,242,0.96); backdrop-filter: blur(12px); border: 1px solid rgba(61,107,79,0.2); border-radius: var(--radius-sm); padding: 12px 16px; box-shadow: var(--shadow-card); min-width: 210px; }
.edu-landing .hfc-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); margin-bottom: 3px; }
.edu-landing .hfc-val { font-family: var(--font-display); font-size: 24px; font-weight: 500; color: var(--ink); line-height: 1; }
.edu-landing .hfc-sub { font-size: 11px; color: var(--ink-light); margin-top: 2px; }

/* TRUST STRIP */
.edu-landing .trust-strip { padding: 24px 80px; background: var(--white); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center; gap: 40px; flex-wrap: wrap; }
.edu-landing .trust-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 400; color: var(--ink-light); }
.edu-landing .trust-icon { width: 16px; height: 16px; color: var(--green); flex-shrink: 0; }
.edu-landing .trust-divider { width: 1px; height: 18px; background: var(--border); }

/* PAIN SECTION */
.edu-landing .pain-section { padding: 96px 80px; background: var(--cream-dark); text-align: center; }
.edu-landing .pain-headline { font-family: var(--font-display); font-size: clamp(36px, 4vw, 56px); font-weight: 300; line-height: 1.15; color: var(--ink); max-width: 720px; margin: 0 auto 20px; }
.edu-landing .pain-headline em { font-style: italic; color: var(--green); }
.edu-landing .pain-sub { font-size: 16px; font-weight: 300; color: var(--ink-mid); max-width: 500px; margin: 0 auto 56px; line-height: 1.75; }
.edu-landing .pain-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
.edu-landing .pain-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px 28px; text-align: left; transition: box-shadow 0.3s, transform 0.3s; }
.edu-landing .pain-card:hover { box-shadow: var(--shadow-soft); transform: translateY(-3px); }
.edu-landing .pain-card-num { font-family: var(--font-display); font-size: 48px; font-weight: 300; color: var(--green-pale); line-height: 1; margin-bottom: 16px; }
.edu-landing .pain-card h3 { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--ink); margin-bottom: 10px; line-height: 1.2; }
.edu-landing .pain-card p { font-size: 13px; font-weight: 300; color: var(--ink-mid); line-height: 1.7; }

/* SECTION COMMON */
.edu-landing .section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--green); display: block; margin-bottom: 14px; }
.edu-landing .section-headline { font-family: var(--font-display); font-size: clamp(36px, 3.5vw, 54px); font-weight: 400; line-height: 1.1; color: var(--ink); }
.edu-landing .section-headline em { font-style: italic; color: var(--green); }
.edu-landing .section-sub { font-size: 15px; font-weight: 300; line-height: 1.75; color: var(--ink-mid); max-width: 480px; margin-top: 14px; }

/* FEATURE BLOCKS */
.edu-landing .feature-block { display: grid; grid-template-columns: 1fr 1fr; min-height: 540px; border-bottom: 1px solid var(--border); }
.edu-landing .feature-block.reverse { direction: rtl; }
.edu-landing .feature-block.reverse > * { direction: ltr; }
.edu-landing .feature-img { position: relative; overflow: hidden; }
.edu-landing .feature-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.8s ease; }
.edu-landing .feature-block:hover .feature-img img { transform: scale(1.03); }
.edu-landing .feature-text { padding: 72px 64px; display: flex; flex-direction: column; justify-content: center; background: var(--white); }
.edu-landing .feature-block.reverse .feature-text { background: var(--cream); }
.edu-landing .feature-num { font-family: var(--font-display); font-size: 72px; font-weight: 300; color: var(--green-pale); line-height: 0.9; margin-bottom: 20px; }
.edu-landing .feature-headline { font-family: var(--font-display); font-size: clamp(30px, 3vw, 46px); font-weight: 400; line-height: 1.1; color: var(--ink); margin-bottom: 16px; }
.edu-landing .feature-headline em { font-style: italic; color: var(--green); }
.edu-landing .feature-sub { font-size: 14px; font-weight: 300; line-height: 1.75; color: var(--ink-mid); margin-bottom: 24px; max-width: 400px; }
.edu-landing .feature-points { list-style: none; display: flex; flex-direction: column; gap: 11px; }
.edu-landing .feature-points li { display: flex; align-items: flex-start; gap: 11px; font-size: 13px; font-weight: 300; color: var(--ink-mid); line-height: 1.6; }
.edu-landing .fp-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--green-pale); border: 1px solid rgba(61,107,79,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.edu-landing .fp-dot svg { width: 8px; height: 8px; }

/* ADHD SECTION */
.edu-landing .adhd-section { padding: 96px 80px; background: var(--purple-pale); border-top: 1px solid rgba(91,75,138,0.12); border-bottom: 1px solid rgba(91,75,138,0.12); }
.edu-landing .adhd-inner { max-width: 1100px; margin: 0 auto; }
.edu-landing .adhd-header { text-align: center; margin-bottom: 56px; }
.edu-landing .adhd-header .section-label { color: var(--purple); }
.edu-landing .adhd-header .section-headline em { color: var(--purple); }
.edu-landing .adhd-header .section-sub { margin: 14px auto 0; text-align: center; }
.edu-landing .adhd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.edu-landing .adhd-card { background: var(--white); border: 1px solid rgba(91,75,138,0.15); border-radius: var(--radius); padding: 32px 28px; transition: box-shadow 0.3s, transform 0.3s; }
.edu-landing .adhd-card:hover { box-shadow: 0 8px 40px rgba(91,75,138,0.1); transform: translateY(-3px); }
.edu-landing .adhd-card-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--purple-dim); border: 1px solid rgba(91,75,138,0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.edu-landing .adhd-card-icon svg { width: 24px; height: 24px; color: var(--purple); }
.edu-landing .adhd-card h3 { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--ink); margin-bottom: 10px; line-height: 1.2; }
.edu-landing .adhd-card p { font-size: 13px; font-weight: 300; color: var(--ink-mid); line-height: 1.7; margin-bottom: 16px; }
.edu-landing .adhd-card-features { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.edu-landing .adhd-card-features li { font-size: 12px; font-weight: 400; color: var(--purple); display: flex; align-items: center; gap: 8px; }
.edu-landing .adhd-card-features li::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--purple); flex-shrink: 0; }
.edu-landing .adhd-bottom { margin-top: 40px; background: var(--white); border: 1px solid rgba(91,75,138,0.15); border-radius: var(--radius); padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
.edu-landing .adhd-bottom-text h3 { font-family: var(--font-display); font-size: 28px; font-weight: 500; color: var(--ink); margin-bottom: 8px; }
.edu-landing .adhd-bottom-text p { font-size: 14px; font-weight: 300; color: var(--ink-mid); line-height: 1.65; max-width: 500px; }
.edu-landing .btn-purple { font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--white); background: var(--purple); border: none; cursor: pointer; padding: 13px 28px; border-radius: 100px; white-space: nowrap; transition: opacity 0.2s; }
.edu-landing .btn-purple:hover { opacity: 0.88; }

/* STEM SECTION */
.edu-landing .stem-section { padding: 96px 80px; background: var(--ink); position: relative; overflow: hidden; }
.edu-landing .stem-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 70% 50%, rgba(29,95,166,0.15) 0%, transparent 70%); pointer-events: none; }
.edu-landing .stem-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
.edu-landing .stem-header { text-align: center; margin-bottom: 56px; }
.edu-landing .stem-header .section-label { color: #6BA3E8; }
.edu-landing .stem-headline { font-family: var(--font-display); font-size: clamp(40px, 4vw, 62px); font-weight: 300; line-height: 1.1; color: var(--white); margin-bottom: 16px; }
.edu-landing .stem-headline em { font-style: italic; color: #6BA3E8; }
.edu-landing .stem-sub { font-size: 16px; font-weight: 300; color: rgba(255,255,255,0.6); max-width: 560px; margin: 0 auto; line-height: 1.75; }
.edu-landing .stem-tracks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
.edu-landing .stem-track { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius); padding: 28px 24px; transition: background 0.3s, border-color 0.3s; }
.edu-landing .stem-track:hover { background: rgba(255,255,255,0.08); border-color: rgba(29,95,166,0.4); }
.edu-landing .stem-track-age { font-family: var(--font-code); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #6BA3E8; margin-bottom: 12px; }
.edu-landing .stem-track h3 { font-family: var(--font-display); font-size: 24px; font-weight: 500; color: var(--white); margin-bottom: 10px; }
.edu-landing .stem-track p { font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.55); line-height: 1.65; margin-bottom: 16px; }
.edu-landing .stem-track-skills { list-style: none; display: flex; flex-direction: column; gap: 7px; }
.edu-landing .stem-track-skills li { font-family: var(--font-code); font-size: 11px; color: rgba(255,255,255,0.45); display: flex; align-items: center; gap: 8px; }
.edu-landing .stem-track-skills li::before { content: '>'; color: #6BA3E8; font-family: var(--font-code); font-size: 11px; }
.edu-landing .stem-code-preview { background: rgba(0,0,0,0.4); border: 1px solid rgba(29,95,166,0.3); border-radius: var(--radius); padding: 28px 32px; }
.edu-landing .stem-code-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.edu-landing .stem-code-dot { width: 6px; height: 6px; border-radius: 50%; background: #6BA3E8; animation: pulse 2s infinite; }
.edu-landing .stem-code-title { font-family: var(--font-code); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #6BA3E8; }
.edu-landing .stem-code-badge { margin-left: auto; font-family: var(--font-code); font-size: 9px; color: #6BA3E8; background: rgba(29,95,166,0.15); border: 1px solid rgba(29,95,166,0.3); padding: 3px 10px; border-radius: 100px; letter-spacing: 0.08em; text-transform: uppercase; }
.edu-landing .code-block { font-family: var(--font-code); font-size: 13px; line-height: 1.8; color: rgba(255,255,255,0.75); }
.edu-landing .code-comment { color: rgba(255,255,255,0.3); }
.edu-landing .code-keyword { color: #6BA3E8; }
.edu-landing .code-string { color: #8FBF9F; }
.edu-landing .code-func { color: #E8A87C; }
.edu-landing .stem-project-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
.edu-landing .stem-project { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; }
.edu-landing .stem-project-grade { font-family: var(--font-code); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: #6BA3E8; margin-bottom: 6px; }
.edu-landing .stem-project-name { font-size: 12px; font-weight: 600; color: var(--white); margin-bottom: 4px; }
.edu-landing .stem-project-desc { font-family: var(--font-code); font-size: 10px; color: rgba(255,255,255,0.35); line-height: 1.5; }

/* EI-CORE SECTION */
.edu-landing .eicore-section { padding: 96px 80px; background: var(--green); position: relative; overflow: hidden; }
.edu-landing .eicore-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 70% at 60% 50%, rgba(255,255,255,0.08) 0%, transparent 70%); pointer-events: none; }
.edu-landing .eicore-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
.edu-landing .eicore-text .section-label { color: rgba(255,255,255,0.65); }
.edu-landing .eicore-headline { font-family: var(--font-display); font-size: clamp(38px, 4vw, 58px); font-weight: 300; line-height: 1.1; color: var(--white); margin: 14px 0; }
.edu-landing .eicore-headline em { font-style: italic; color: rgba(255,255,255,0.7); }
.edu-landing .eicore-sub { font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.75; max-width: 400px; margin-bottom: 32px; }
.edu-landing .btn-white { font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--green); background: var(--white); border: none; cursor: pointer; padding: 13px 28px; border-radius: 100px; transition: opacity 0.2s; }
.edu-landing .btn-white:hover { opacity: 0.92; }
.edu-landing .eicore-card { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: var(--radius); padding: 28px; backdrop-filter: blur(8px); }
.edu-landing .eicore-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.12); }
.edu-landing .eicore-card-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.8); animation: pulse 2s infinite; }
.edu-landing .eicore-card-title { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.8); }
.edu-landing .eicore-card-badge { margin-left: auto; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); padding: 3px 10px; border-radius: 100px; }
.edu-landing .eicore-insight { background: rgba(255,255,255,0.1); border-left: 3px solid rgba(255,255,255,0.5); border-radius: 0 8px 8px 0; padding: 14px 16px; margin-bottom: 14px; font-size: 13px; color: rgba(255,255,255,0.9); line-height: 1.65; }
.edu-landing .eicore-insight-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 5px; }
.edu-landing .eicore-actions { display: flex; flex-direction: column; gap: 8px; }
.edu-landing .eicore-action { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; }
.edu-landing .eicore-action-num { font-family: var(--font-display); font-size: 18px; font-weight: 500; color: rgba(255,255,255,0.7); width: 20px; flex-shrink: 0; }
.edu-landing .eicore-action-text { font-size: 12px; color: rgba(255,255,255,0.75); flex: 1; }
.edu-landing .eicore-action-check { width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.edu-landing .eicore-action-check svg { width: 9px; height: 9px; }

/* PRICING */
.edu-landing .pricing-section { padding: 96px 80px; background: var(--white); text-align: center; }
.edu-landing .pricing-toggle { display: inline-flex; align-items: center; background: var(--cream-dark); border: 1px solid var(--border); border-radius: 100px; padding: 4px; margin: 28px auto; }
.edu-landing .pricing-toggle button { font-family: var(--font-body); font-size: 13px; font-weight: 400; color: var(--ink-mid); background: transparent; border: none; cursor: pointer; padding: 9px 22px; border-radius: 100px; transition: all 0.2s; }
.edu-landing .pricing-toggle button.active { background: var(--white); color: var(--green); font-weight: 600; box-shadow: var(--shadow-card); }
.edu-landing .pricing-save { font-size: 10px; font-weight: 600; color: var(--white); background: var(--amber); padding: 2px 8px; border-radius: 100px; margin-left: 6px; }
.edu-landing .pricing-card-single { background: var(--cream); border: 1.5px solid rgba(61,107,79,0.25); border-radius: 24px; padding: 48px 40px; max-width: 540px; margin: 0 auto; position: relative; box-shadow: var(--shadow-soft); }
.edu-landing .pricing-card-single::before { content: 'Most loved by families'; position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--green); color: var(--white); font-size: 11px; font-weight: 600; padding: 4px 16px; border-radius: 100px; white-space: nowrap; letter-spacing: 0.04em; }
.edu-landing .pricing-plan-name { font-family: var(--font-display); font-size: 32px; font-weight: 400; color: var(--ink); margin-bottom: 8px; }
.edu-landing .pricing-price { font-family: var(--font-display); font-size: 72px; font-weight: 300; color: var(--ink); line-height: 1; margin-bottom: 8px; }
.edu-landing .pricing-price sup { font-size: 30px; vertical-align: super; color: var(--green); font-weight: 400; }
.edu-landing .pricing-price sub { font-size: 18px; color: var(--ink-light); font-family: var(--font-body); font-weight: 300; }
.edu-landing .pricing-desc { font-size: 14px; font-weight: 300; color: var(--ink-mid); margin-bottom: 32px; line-height: 1.65; }
.edu-landing .pricing-divider { height: 1px; background: var(--border); margin-bottom: 28px; }
.edu-landing .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 13px; margin-bottom: 32px; text-align: left; }
.edu-landing .pricing-features li { display: flex; align-items: center; gap: 11px; font-size: 14px; font-weight: 300; color: var(--ink-mid); }
.edu-landing .pricing-check { width: 20px; height: 20px; border-radius: 50%; background: var(--green-pale); border: 1px solid rgba(61,107,79,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.edu-landing .pricing-check svg { width: 9px; height: 9px; }
.edu-landing .pricing-btn { display: block; width: 100%; font-family: var(--font-body); font-size: 15px; font-weight: 600; color: var(--white); background: var(--green); border: none; cursor: pointer; padding: 15px; border-radius: 100px; transition: background 0.2s; margin-bottom: 12px; }
.edu-landing .pricing-btn:hover { background: var(--green-light); }
.edu-landing .pricing-note { font-size: 12px; color: var(--ink-light); }

/* FAQ */
.edu-landing .faq-section { padding: 96px 80px; background: var(--cream-dark); }
.edu-landing .faq-inner { max-width: 720px; margin: 0 auto; }
.edu-landing .faq-header { text-align: center; margin-bottom: 48px; }
.edu-landing details.faq-item { border-bottom: 1px solid var(--border); }
.edu-landing .faq-question { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; cursor: pointer; font-size: 15px; font-weight: 400; color: var(--ink); gap: 16px; list-style: none; }
.edu-landing .faq-question::-webkit-details-marker { display: none; }
.edu-landing .faq-icon { width: 24px; height: 24px; border-radius: 50%; background: var(--green-pale); border: 1px solid rgba(61,107,79,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.25s, background 0.2s; color: var(--green); font-size: 18px; line-height: 1; }
.edu-landing details[open] .faq-icon { transform: rotate(45deg); background: var(--green); color: var(--white); }
.edu-landing .faq-answer { font-size: 14px; font-weight: 300; color: var(--ink-mid); line-height: 1.75; padding-bottom: 20px; }

/* CTA */
.edu-landing .cta-section { padding: 120px 80px; background: var(--green); text-align: center; position: relative; overflow: hidden; }
.edu-landing .cta-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,255,255,0.07) 0%, transparent 70%); pointer-events: none; }
.edu-landing .cta-inner { position: relative; z-index: 1; }
.edu-landing .cta-headline { font-family: var(--font-display); font-size: clamp(44px, 5vw, 70px); font-weight: 300; line-height: 1.1; color: var(--white); margin-bottom: 20px; }
.edu-landing .cta-headline em { font-style: italic; color: rgba(255,255,255,0.65); }
.edu-landing .cta-sub { font-size: 16px; font-weight: 300; color: rgba(255,255,255,0.72); max-width: 420px; margin: 0 auto 40px; line-height: 1.75; }
.edu-landing .cta-actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.edu-landing .btn-cta-primary { font-family: var(--font-body); font-size: 15px; font-weight: 600; color: var(--green); background: var(--white); border: none; cursor: pointer; padding: 15px 40px; border-radius: 100px; transition: opacity 0.2s; }
.edu-landing .btn-cta-primary:hover { opacity: 0.92; }
.edu-landing .btn-cta-ghost { font-family: var(--font-body); font-size: 15px; font-weight: 400; color: rgba(255,255,255,0.8); background: transparent; border: 1.5px solid rgba(255,255,255,0.4); cursor: pointer; padding: 14px 36px; border-radius: 100px; transition: border-color 0.2s; text-decoration: none; display: inline-block; }
.edu-landing .btn-cta-ghost:hover { border-color: rgba(255,255,255,0.8); }
.edu-landing .cta-note { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 20px; }

/* FOOTER */
.edu-landing footer { background: var(--ink); padding: 56px 80px 32px; }
.edu-landing .footer-top { display: grid; grid-template-columns: 260px 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
.edu-landing .footer-brand p { font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.38); line-height: 1.7; margin-top: 14px; max-width: 210px; }
.edu-landing .footer-col h4 { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 18px; }
.edu-landing .footer-col a { display: block; font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.48); text-decoration: none; margin-bottom: 11px; transition: color 0.2s; }
.edu-landing .footer-col a:hover { color: #8FBF9F; }
.edu-landing .footer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); }
.edu-landing .footer-copy { font-size: 11px; color: rgba(255,255,255,0.18); }
.edu-landing .footer-legal { display: flex; gap: 20px; }
.edu-landing .footer-legal a { font-size: 11px; color: rgba(255,255,255,0.18); text-decoration: none; }
.edu-landing .footer-legal a:hover { color: rgba(255,255,255,0.4); }

/* ANIMATIONS */
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.edu-landing .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
.edu-landing .reveal.visible { opacity: 1; transform: translateY(0); }
.edu-landing .reveal-delay-1 { transition-delay: 0.1s; }
.edu-landing .reveal-delay-2 { transition-delay: 0.2s; }
.edu-landing .reveal-delay-3 { transition-delay: 0.3s; }
`;

const CheckSvg = () => (
  <svg viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4L3.5 6L6.5 2" stroke="#3D6B4F" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CheckSvgWhite = () => (
  <svg viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export default function EduLanding() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [cookieHidden, setCookieHidden] = useState(false);
  const [heroFloatVisible, setHeroFloatVisible] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-landing', 'true');
    styleEl.textContent = EDU_LANDING_CSS;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem('vs_edu_cookies')) {
      setCookieHidden(true);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll('.edu-landing .reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHeroFloatVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('vs_edu_cookies', 'accepted');
    setCookieHidden(true);
  };

  const declineCookies = () => {
    localStorage.setItem('vs_edu_cookies', 'declined');
    setCookieHidden(true);
  };

  return (
    <div className="edu-landing">
      {/* COOKIE BANNER */}
      <div className={`cookie-banner${cookieHidden ? ' hidden' : ''}`} id="cookieBanner">
        <div className="cookie-text">
          We use cookies to improve your experience. FERPA-compliant. We never share or sell student data.{' '}
          <a onClick={(e) => e.preventDefault()}>Privacy Policy</a>
        </div>
        <div className="cookie-actions">
          <button className="cookie-decline" onClick={declineCookies}>Decline</button>
          <button className="cookie-accept" onClick={acceptCookies}>Accept</button>
        </div>
      </div>

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">
          <div className="nav-logo-mark">
            <svg viewBox="0 0 48 48" fill="none">
              <line x1="11" y1="10" x2="24" y2="35" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <line x1="37" y1="10" x2="24" y2="35" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <circle cx="24" cy="35" r="3" fill="#8FBF9F" />
              <path d="M 18,41 A 6.5,6.5 0 0,1 30,41" stroke="#8FBF9F" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div className="nav-wordmark">
            <div className="name">Velox<span>Sync</span></div>
            <div className="sub">For Education</div>
          </div>
        </a>
        <div className="nav-links">
          <a href="#features">How it works</a>
          <a href="#adhd">ADHD Support</a>
          <a href="#stem">STEM &amp; Coding</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions">
          <button className="btn-nav-ghost" onClick={() => { window.location.href = '/education/login'; }}>Sign in</button>
          <button className="btn-nav-primary" onClick={() => { window.location.href = '/education/checkout'; }}>Start free trial</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-headline">
            Your child is not<br />
            <span className="strike">behind.</span><br />
            They just learn <em>differently.</em>
          </h1>
          <p className="hero-sub">
            Ei-Core watches your child's progress, finds the exact gap, and tells you what to teach tomorrow. Built for every learning style — including ADHD and cognitive differences.
          </p>
          <div className="hero-tags">
            <span className="hero-tag hero-tag-green">AI Curriculum</span>
            <span className="hero-tag hero-tag-purple">ADHD Support</span>
            <span className="hero-tag hero-tag-blue">K-12 STEM &amp; Coding</span>
          </div>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => { window.location.href = '/education/checkout'; }}>Start free — 14 days</button>
            <button className="btn-secondary">See how it works</button>
          </div>
          <div className="hero-proof">
            <div className="hero-proof-item">
              <div className="hero-proof-check"><CheckSvg /></div>
              No credit card
            </div>
            <div className="hero-proof-divider"></div>
            <div className="hero-proof-item">
              <div className="hero-proof-check"><CheckSvg /></div>
              FERPA compliant
            </div>
            <div className="hero-proof-divider"></div>
            <div className="hero-proof-item">
              <div className="hero-proof-check"><CheckSvg /></div>
              Up to 6 children
            </div>
            <div className="hero-proof-divider"></div>
            <div className="hero-proof-item">
              <div className="hero-proof-check"><CheckSvg /></div>
              ADHD-friendly
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-img"></div>
          <div className="hero-img-overlay"></div>
          <div className="hero-float" style={{ opacity: heroFloatVisible ? 1 : 0 }}>
            <div className="hero-float-card">
              <div className="hfc-label">Ei-Core found it</div>
              <div className="hfc-val">Gap detected.</div>
              <div className="hfc-sub">Elijah needs 2 sessions on fractions before moving forward</div>
            </div>
            <div className="hero-float-card">
              <div className="hfc-label">Today's plan ready</div>
              <div className="hfc-val">3 lessons</div>
              <div className="hfc-sub">Personalized for each child — including ADHD focus mode</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="trust-strip">
        <div className="trust-item">
          <svg className="trust-icon" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L2 5V9c0 3.5 2.8 6.5 7 7 4.2-.5 7-3.5 7-7V5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          FERPA Compliant
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <svg className="trust-icon" viewBox="0 0 18 18" fill="none">
            <path d="M9 1l2.5 5 5.5.8-4 3.9.9 5.5L9 13.5l-4.9 2.7.9-5.5L1 6.8l5.5-.8L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          112 State Standards
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <svg className="trust-icon" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          ADHD &amp; IEP Support
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <svg className="trust-icon" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 8h2M6 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          K-12 STEM &amp; Coding
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <svg className="trust-icon" viewBox="0 0 18 18" fill="none">
            <path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Zero Data Retention
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <svg className="trust-icon" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          Secure Platform
        </div>
      </div>

      {/* PAIN SECTION */}
      <div className="pain-section">
        <span className="section-label" style={{ display: 'block', textAlign: 'center' }}>Why families find us</span>
        <h2 className="pain-headline">Every homeschool parent has <em>that moment.</em></h2>
        <p className="pain-sub">
          You realize your child is not where they should be. You do not know why. The curriculum does not adapt. And if your child has ADHD or learns differently, you feel even more alone.
        </p>
        <div className="pain-cards">
          <div className="pain-card reveal">
            <div className="pain-card-num">01</div>
            <h3>You cannot find the gap</h3>
            <p>Curriculum moves forward whether your child is ready or not. By the time you notice something is wrong, weeks of gaps have compounded into months.</p>
          </div>
          <div className="pain-card reveal reveal-delay-1">
            <div className="pain-card-num">02</div>
            <h3>ADHD makes everything harder</h3>
            <p>Standard lesson plans were not designed for how ADHD brains work. Sitting still, long reading passages, rigid schedules — these fight against your child, not with them.</p>
          </div>
          <div className="pain-card reveal reveal-delay-2">
            <div className="pain-card-num">03</div>
            <h3>STEM feels overwhelming to teach</h3>
            <p>You want your child to learn coding and science but you are not sure where to start or how to progress. Most curriculum stops at worksheets. Your child needs to build things.</p>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features">
        <div className="feature-block">
          <div className="feature-img">
            <img src="https://res.cloudinary.com/dhkuivp0s/image/upload/v1779387308/gapfinder_zym5rf.jpg" alt="Child studying" loading="lazy" />
          </div>
          <div className="feature-text">
            <div className="feature-num">01</div>
            <span className="section-label">Gap Finder</span>
            <h2 className="feature-headline">We find <em>exactly</em> where they fell behind.</h2>
            <p className="feature-sub">Ei-Core maps your child's progress against state standards and finds the precise concept where the gap began. Not a grade level. The exact moment.</p>
            <ul className="feature-points">
              <li><div className="fp-dot"><CheckSvg /></div>Continuous progress monitoring across all subjects</li>
              <li><div className="fp-dot"><CheckSvg /></div>Root cause analysis — not just what, but why</li>
              <li><div className="fp-dot"><CheckSvg /></div>Clear remediation path so you know what to teach first</li>
            </ul>
          </div>
        </div>
        <div className="feature-block reverse">
          <div className="feature-img">
            <img src="https://res.cloudinary.com/dhkuivp0s/image/upload/v1779387308/dailyplan_lxc56h.jpg" alt="Parent planning" loading="lazy" />
          </div>
          <div className="feature-text">
            <div className="feature-num">02</div>
            <span className="section-label">Daily Plan</span>
            <h2 className="feature-headline">Wake up knowing <em>exactly</em> what to teach.</h2>
            <p className="feature-sub">Every morning Ei-Core generates a personalized lesson plan for each child based on where they are right now — not where the curriculum says they should be.</p>
            <ul className="feature-points">
              <li><div className="fp-dot"><CheckSvg /></div>Daily plans generated fresh every morning per child</li>
              <li><div className="fp-dot"><CheckSvg /></div>Adapts automatically when mastery is detected</li>
              <li><div className="fp-dot"><CheckSvg /></div>Works for multiple children at different levels simultaneously</li>
            </ul>
          </div>
        </div>
        <div className="feature-block">
          <div className="feature-img">
            <img src="https://res.cloudinary.com/dhkuivp0s/image/upload/v1779387309/progress_wmy0xy.jpg" alt="Child progress" loading="lazy" />
          </div>
          <div className="feature-text">
            <div className="feature-num">03</div>
            <span className="section-label">Progress Tracker</span>
            <h2 className="feature-headline">Watch them <em>catch up</em> in real time.</h2>
            <p className="feature-sub">A visual mastery map shows exactly where each child stands against state standards. Portfolio-ready reports for co-ops, records, and accountability.</p>
            <ul className="feature-points">
              <li><div className="fp-dot"><CheckSvg /></div>Standards mastery map across all subjects and grades</li>
              <li><div className="fp-dot"><CheckSvg /></div>Portfolio-ready progress reports for co-ops and records</li>
              <li><div className="fp-dot"><CheckSvg /></div>Ei-Core celebrates milestones and tells you when to move on</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ADHD SECTION */}
      <section className="adhd-section" id="adhd">
        <div className="adhd-inner">
          <div className="adhd-header">
            <span className="section-label" style={{ color: 'var(--purple)', display: 'block', textAlign: 'center' }}>Built for every brain</span>
            <h2 className="section-headline" style={{ textAlign: 'center' }}>
              ADHD and cognitive support <em style={{ color: 'var(--purple)' }}>built in.</em>
            </h2>
            <p className="section-sub" style={{ textAlign: 'center', margin: '14px auto 0' }}>
              Not an add-on. Not an afterthought. Every feature in VeloxSync was designed with neurodivergent learners in mind from the start.
            </p>
          </div>
          <div className="adhd-grid">
            <div className="adhd-card reveal">
              <div className="adhd-card-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Sensory-Friendly Focus Mode</h3>
              <p>Reduces visual noise, increases text size, and activates focus timers that match ADHD attention spans. Your child sees only what they need right now.</p>
              <ul className="adhd-card-features">
                <li>Adjustable reading mode with Open Sans large text</li>
                <li>Pomodoro-style focus timers (5, 10, 15, 25 min)</li>
                <li>Distraction-free lesson view</li>
                <li>High-contrast and low-stimulation themes</li>
              </ul>
            </div>
            <div className="adhd-card reveal reveal-delay-1">
              <div className="adhd-card-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <h3>Cognitive Load Tracking</h3>
              <p>Ei-Core monitors how much mental effort each child is expending across sessions. When overload is detected, it automatically lightens the plan before frustration sets in.</p>
              <ul className="adhd-card-features">
                <li>Real-time cognitive load indicators per child</li>
                <li>Automatic lesson simplification when overloaded</li>
                <li>Parent alerts when a child needs a break</li>
                <li>Weekly cognitive load reports</li>
              </ul>
            </div>
            <div className="adhd-card reveal reveal-delay-2">
              <div className="adhd-card-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M4 10h16M4 14h10M4 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Differentiated Pacing</h3>
              <p>Lessons automatically slow down, break into smaller chunks, and add more movement-based activities when ADHD patterns are detected in session data.</p>
              <ul className="adhd-card-features">
                <li>Lessons chunked into 10-15 min micro-sessions</li>
                <li>Movement and kinesthetic activity suggestions</li>
                <li>IEP accommodation tracking and reminders</li>
                <li>Multiple modality lesson delivery (visual, audio, hands-on)</li>
              </ul>
            </div>
          </div>
          <div className="adhd-bottom reveal">
            <div className="adhd-bottom-text">
              <h3>Every child learns at their own frequency.</h3>
              <p>Whether your child has ADHD, dyslexia, sensory processing differences, or simply learns better with shorter sessions and hands-on projects — Ei-Core adapts to them. No diagnosis required. No labels. Just a plan that actually fits.</p>
            </div>
            <button className="btn-purple">Learn about ADHD support</button>
          </div>
        </div>
      </section>

      {/* STEM SECTION */}
      <section className="stem-section" id="stem">
        <div className="stem-bg"></div>
        <div className="stem-inner">
          <div className="stem-header">
            <span className="section-label" style={{ color: '#6BA3E8', display: 'block', textAlign: 'center' }}>K-12 STEM &amp; Coding</span>
            <h2 className="stem-headline">From blocks to <em>real code.</em><br />Every age. Every level.</h2>
            <p className="stem-sub">A complete STEM and coding curriculum built into your Family Plan. Age-appropriate tracks that grow with your child from visual block coding all the way to Python, robotics, and real project builds.</p>
          </div>
          <div className="stem-tracks">
            <div className="stem-track reveal">
              <div className="stem-track-age">Ages 5-10 &nbsp;·&nbsp; Grades K-5</div>
              <h3>Explorer Track</h3>
              <p>Visual block coding, science experiments, math through building. Everything designed to spark curiosity without overwhelming young learners.</p>
              <ul className="stem-track-skills">
                <li>Scratch &amp; block-based visual coding</li>
                <li>Simple robotics with household materials</li>
                <li>Science experiments with guided discovery</li>
                <li>Math through real-world building projects</li>
                <li>Logic puzzles and computational thinking</li>
              </ul>
            </div>
            <div className="stem-track reveal reveal-delay-1">
              <div className="stem-track-age">Ages 11-14 &nbsp;·&nbsp; Grades 6-8</div>
              <h3>Builder Track</h3>
              <p>Introduction to real programming languages, project-based science, and engineering challenges that produce things your child can show off.</p>
              <ul className="stem-track-skills">
                <li>Python fundamentals with real projects</li>
                <li>HTML &amp; CSS — build your first website</li>
                <li>Arduino and basic electronics</li>
                <li>Physics and chemistry labs at home</li>
                <li>App prototyping and UI/UX basics</li>
              </ul>
            </div>
            <div className="stem-track reveal reveal-delay-2">
              <div className="stem-track-age">Ages 15-18 &nbsp;·&nbsp; Grades 9-12</div>
              <h3>Creator Track</h3>
              <p>Production-level coding skills, advanced STEM projects, and portfolio-building work that colleges and employers actually want to see.</p>
              <ul className="stem-track-skills">
                <li>Python, JavaScript, or Java — student chooses</li>
                <li>Web development: HTML, CSS, React basics</li>
                <li>Data science and AI fundamentals</li>
                <li>Capstone projects for college portfolio</li>
                <li>AP Computer Science preparation</li>
              </ul>
            </div>
          </div>
          <div className="stem-code-preview reveal">
            <div className="stem-code-header">
              <div className="stem-code-dot"></div>
              <div className="stem-code-title">Ei-Core // Today's Coding Lesson — Zara, Grade 8</div>
              <div className="stem-code-badge">Python · Builder Track</div>
            </div>
            <div className="code-block">
              <span className="code-comment"># Lesson: Build a simple quiz game — Zara's first real Python project</span>
              <br /><br />
              <span className="code-keyword">def</span> <span className="code-func">ask_question</span>(question, correct_answer):
              <br />&nbsp;&nbsp;&nbsp;&nbsp;answer = <span className="code-func">input</span>(<span className="code-string">{'f"\\n{question}\\nYour answer: "'}</span>)
              <br />&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-keyword">if</span> answer.lower() == correct_answer.lower():
              <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-func">print</span>(<span className="code-string">"✓ Correct! Great work Zara."</span>)
              <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-keyword">return</span> <span className="code-string">True</span>
              <br />&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-keyword">else</span>:
              <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-func">print</span>(<span className="code-string">{'f"Not quite — the answer was {correct_answer}"'}</span>)
              <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-keyword">return</span> <span className="code-string">False</span>
            </div>
            <div className="stem-project-cards" style={{ marginTop: 20 }}>
              <div className="stem-project"><div className="stem-project-grade">Grade 3</div><div className="stem-project-name">Scratch Story</div><div className="stem-project-desc">Animate a character you draw</div></div>
              <div className="stem-project"><div className="stem-project-grade">Grade 6</div><div className="stem-project-name">Weather App</div><div className="stem-project-desc">Python + live weather API</div></div>
              <div className="stem-project"><div className="stem-project-grade">Grade 8</div><div className="stem-project-name">Quiz Game</div><div className="stem-project-desc">Full Python application</div></div>
              <div className="stem-project"><div className="stem-project-grade">Grade 11</div><div className="stem-project-name">Portfolio Site</div><div className="stem-project-desc">React — college-ready</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* EI-CORE */}
      <section className="eicore-section" id="eicore">
        <div className="eicore-bg"></div>
        <div className="eicore-inner">
          <div className="eicore-text">
            <span className="section-label">Ei-Core&trade; for Education</span>
            <h2 className="eicore-headline">The AI that thinks like a <em>specialist.</em><br />Costs like an app.</h2>
            <p className="eicore-sub">Ei-Core is not a chatbot. It is a continuous intelligence engine that monitors every child, supports ADHD and cognitive differences, guides your STEM path, and gives you specific actions — not advice.</p>
          </div>
          <div className="eicore-card">
            <div className="eicore-card-header">
              <div className="eicore-card-dot"></div>
              <div className="eicore-card-title">Ei-Core Intelligence Feed</div>
              <div className="eicore-card-badge">● Live</div>
            </div>
            <div className="eicore-insight">
              <div className="eicore-insight-label">ADHD Alert — Elijah, Grade 6</div>
              Cognitive load is elevated this morning. Elijah has been on-task for 47 minutes without a break. Recommend a 10-minute movement break before starting the fractions lesson. Switching to a hands-on manipulative activity rather than worksheets today.
            </div>
            <div className="eicore-actions">
              <div className="eicore-action">
                <div className="eicore-action-num">01</div>
                <div className="eicore-action-text">Take a 10-min movement break — jumping jacks or short walk</div>
                <div className="eicore-action-check"><CheckSvgWhite /></div>
              </div>
              <div className="eicore-action">
                <div className="eicore-action-num">02</div>
                <div className="eicore-action-text">Fractions lesson using fraction tiles (physical manipulatives)</div>
                <div className="eicore-action-check"><CheckSvgWhite /></div>
              </div>
              <div className="eicore-action">
                <div className="eicore-action-num">03</div>
                <div className="eicore-action-text">Zara: Python lesson ready — 15 min focused session</div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <span className="section-label" style={{ display: 'block', textAlign: 'center' }}>Simple pricing</span>
        <h2 className="section-headline" style={{ textAlign: 'center' }}>One plan. <em>Everything included.</em></h2>
        <p className="section-sub" style={{ textAlign: 'center', margin: '14px auto 0' }}>
          AI curriculum, ADHD support, and a full K-12 STEM and coding platform. Less than one workbook a month.
        </p>
        <div className="pricing-toggle">
          <button className={billing === 'monthly' ? 'active' : ''} onClick={() => setBilling('monthly')}>Monthly</button>
          <button className={billing === 'annual' ? 'active' : ''} onClick={() => setBilling('annual')}>
            Annual <span className="pricing-save">Save 34%</span>
          </button>
        </div>
        <div className="pricing-card-single">
          <div className="pricing-plan-name">Family Plan</div>
          <div className="pricing-price">
            <sup>$</sup>{billing === 'monthly' ? '19' : '149'}<sub>{billing === 'monthly' ? '/month' : '/year'}</sub>
          </div>
          <div className="pricing-desc">
            Everything Ei-Core can do for up to 6 children. AI curriculum, ADHD support, K-12 STEM and coding, daily plans, gap detection, and progress tracking — all included from day one.
          </div>
          <div className="pricing-divider"></div>
          <ul className="pricing-features">
            <li><div className="pricing-check"><CheckSvg /></div>Up to 6 children, all grade levels K-12</li>
            <li><div className="pricing-check"><CheckSvg /></div>Unlimited Ei-Core AI lesson and curriculum generation</li>
            <li><div className="pricing-check"><CheckSvg /></div>Full ADHD support — focus mode, cognitive load, differentiated pacing</li>
            <li><div className="pricing-check"><CheckSvg /></div>Complete K-12 STEM and coding platform (Explorer, Builder, Creator tracks)</li>
            <li><div className="pricing-check"><CheckSvg /></div>112 state standards pre-loaded, all subjects</li>
            <li><div className="pricing-check"><CheckSvg /></div>Daily personalized plans for every child every morning</li>
            <li><div className="pricing-check"><CheckSvg /></div>Portfolio-ready progress reports, FERPA compliant</li>
            <li><div className="pricing-check"><CheckSvg /></div>IEP accommodation tracking and support</li>
          </ul>
          <button className="pricing-btn" onClick={() => { window.location.href = '/education/checkout'; }}>Start your 14-day free trial</button>
          <div className="pricing-note">No credit card required. Cancel any time.</div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="faq-inner">
          <div className="faq-header">
            <span className="section-label" style={{ display: 'block', textAlign: 'center' }}>Questions</span>
            <h2 className="section-headline" style={{ textAlign: 'center' }}>Things parents ask <em>first.</em></h2>
          </div>
          <details className="faq-item">
            <summary className="faq-question">Does VeloxSync work for children with ADHD?<div className="faq-icon">+</div></summary>
            <p className="faq-answer">Yes, and it was designed with ADHD learners in mind from the start. Focus timers, shorter lesson chunks, cognitive load monitoring, differentiated pacing, and movement break suggestions are all built into every plan. No diagnosis required. Ei-Core detects patterns that suggest a child needs a different approach and adapts automatically.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">What does the STEM and coding platform include?<div className="faq-icon">+</div></summary>
            <p className="faq-answer">A full K-12 curriculum across three age-appropriate tracks. The Explorer Track (K-5) covers visual block coding, science experiments, and math through building. The Builder Track (6-8) introduces Python, HTML/CSS, Arduino, and project-based science. The Creator Track (9-12) covers production-level coding, web development, data science, and college portfolio projects. All included in the Family Plan.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">Do I need to already have a curriculum?<div className="faq-icon">+</div></summary>
            <p className="faq-answer">No. VeloxSync works as your primary planning tool or alongside your existing curriculum. Ei-Core generates lessons and assignments from scratch, or it supplements what you are already using. You stay in control of what gets taught and when.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">Which state standards are included?<div className="faq-icon">+</div></summary>
            <p className="faq-answer">112 state standards are pre-loaded including Common Core Math, Common Core ELA, TEKS (Texas), NGSS, and standards for all major U.S. states across all grade levels and subjects. Standards are updated annually.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">Is my child's data safe?<div className="faq-icon">+</div></summary>
            <p className="faq-answer">Yes. VeloxSync is FERPA compliant and built on a zero-retention model. Ei-Core processes your child's data in real time and discards it immediately. Your family's data is never sold, never shared, and never used to train AI models. You own everything.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">Can I track IEP accommodations?<div className="faq-icon">+</div></summary>
            <p className="faq-answer">Yes. VeloxSync includes IEP accommodation tracking. You enter your child's specific accommodations and Ei-Core applies them automatically to every lesson plan it generates. The system also sends reminders when accommodation check-ins are due and generates documentation for your records.</p>
          </details>
          <details className="faq-item">
            <summary className="faq-question">Does this work for non-traditional schedules?<div className="faq-icon">+</div></summary>
            <p className="faq-answer">Completely. Year-round learning, seasonal breaks, mixed-grade households, unit studies, project-based approaches — Ei-Core adapts to how your family actually works, not the other way around.</p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg"></div>
        <div className="cta-inner">
          <span className="section-label" style={{ color: 'rgba(255,255,255,0.6)', display: 'block', textAlign: 'center', marginBottom: 14 }}>Start today</span>
          <h2 className="cta-headline">Your child is ready<br />to <em>catch up.</em></h2>
          <p className="cta-sub">14 days free. No credit card. ADHD support and a full coding platform included on day one.</p>
          <div className="cta-actions">
            <button className="btn-cta-primary" onClick={() => { window.location.href = '/education/checkout'; }}>Start free trial</button>
            <a href={CALENDLY_URL} className="btn-cta-ghost" target="_blank" rel="noopener noreferrer">Book a call</a>
          </div>
          <p className="cta-note">// 14-day free trial — no credit card — FERPA compliant — cancel any time</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div className="nav-logo-mark">
                <svg viewBox="0 0 48 48" fill="none">
                  <line x1="11" y1="10" x2="24" y2="35" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <line x1="37" y1="10" x2="24" y2="35" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="24" cy="35" r="3" fill="#8FBF9F" />
                </svg>
              </div>
              <div>
                <div className="nav-wordmark">
                  <div className="name" style={{ color: 'white' }}>Velox<span>Sync</span></div>
                  <div className="sub">For Education</div>
                </div>
              </div>
            </a>
            <p>K-12 intelligence powered by Ei-Core. Built for the families who chose to do this themselves.</p>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="#">How it works</a>
            <a href="#">Ei-Core AI</a>
            <a href="#">ADHD Support</a>
            <a href="#">STEM &amp; Coding</a>
            <a href="#">Pricing</a>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#">State Standards Library</a>
            <a href="/support">Support</a>
            <a href="/education/faq">FAQ</a>
            <a href="/education/privacy">Privacy Policy</a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">Book a call</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Meraki is Love</a>
            <a href="#">Contact</a>
            <a href="https://veloxsync.app">VeloxSync HR</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">&copy; 2026 Meraki is Love, LLC. VeloxSync and Ei-Core are trademarks of Meraki is Love, LLC.</div>
          <div className="footer-legal">
            <a href="/education/privacy">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">FERPA</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
