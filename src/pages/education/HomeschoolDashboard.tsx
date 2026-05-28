// src/pages/education/HomeschoolDashboard.tsx
// VeloxSync for Education — Homeschool morning planner (cream/green, family-first)

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import EduTrialBanner from '../../components/EduTrialBanner';
import type { EduProfile, HomeschoolChild } from '../../types/education';

const CURRICULUM_TYPES = ['Classical', 'Charlotte Mason', 'Unschooling', 'Eclectic', 'Online', 'Textbook'] as const;
type CurriculumType = typeof CURRICULUM_TYPES[number];

const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Soft pastel palette — one per child in order. Wraps after the sixth.
const CHILD_COLORS = ['#C2D9C4', '#D4CCE6', '#F0D5C0', '#C4DBE8', '#E8C4C4', '#E8DCC4'];

// Mock today's plan — three rotating lesson sets so a family of 3+ children
// doesn't all show the same plan. Real plans come from Ei-Core in phase 2.
type Lesson = { subject: string; title: string; desc: string; duration: number };
const LESSON_SETS: Lesson[][] = [
  [
    { subject: 'Math',    title: 'Fraction Division',         desc: 'Visual models and practice problems.', duration: 25 },
    { subject: 'Reading', title: "Charlotte's Web — Chapter 4", desc: 'Read aloud, then narrate the chapter.', duration: 20 },
    { subject: 'Science', title: 'Plant Life Cycles',         desc: 'Observation walk and journal entry.',  duration: 25 },
  ],
  [
    { subject: 'Python',  title: 'Build a Quiz Game',   desc: 'Functions and conditionals in a small project.', duration: 30 },
    { subject: 'History', title: 'Ancient Egypt',       desc: 'Short reading and a written narration.',         duration: 20 },
    { subject: 'Art',     title: 'Watercolor Landscape', desc: 'Wet-on-wet technique. Hands-on practice.',      duration: 25 },
  ],
  [
    { subject: 'Math',    title: 'Multiplication — 7s',          desc: 'Quick recall drill and a game.',     duration: 15 },
    { subject: 'Reading', title: 'Frog and Toad Are Friends',    desc: 'Read aloud, then narrate together.', duration: 20 },
    { subject: 'Nature',  title: 'Backyard Bird Count',          desc: 'Tally observations in your journal.', duration: 25 },
  ],
];

const getMockPlan = (i: number): Lesson[] => LESSON_SETS[i % LESSON_SETS.length];

const formatToday = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const greetingForHour = (h: number) =>
  h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

const DASHBOARD_CSS = `
.edu-dash {
  display: flex; min-height: 100vh; background: #FAF7F2;
  background-image: radial-gradient(circle, rgba(28,24,18,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Open Sans', sans-serif; color: #1C1812;
}
.edu-dash-main { flex: 1; overflow-y: auto; min-width: 0; }

.edu-dash-mobile-bar { display: none; }
@media (max-width: 767px) {
  .edu-dash-mobile-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; border-bottom: 1px solid rgba(28,24,18,0.08);
    background: #FAF7F2;
  }
  .edu-dash-mobile-bar button { background: none; border: none; color: #1C1812; padding: 0; cursor: pointer; }
  .edu-dash-mobile-bar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; font-weight: 500; color: #1C1812;
  }
}

.edu-dash-content { padding: 48px 56px; max-width: 1080px; margin: 0 auto; }
@media (max-width: 767px) { .edu-dash-content { padding: 24px 18px; } }

@keyframes eduFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes eduCheckBounce {
  0%   { transform: scale(0.8); }
  60%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.edu-fade { opacity: 0; animation: eduFadeUp 0.6s ease-out forwards; }
.edu-fade-1 { animation-delay: 0s; }
.edu-fade-2 { animation-delay: 0.15s; }
.edu-fade-3 { animation-delay: 0.30s; }
.edu-fade-4 { animation-delay: 0.45s; }
.edu-fade-5 { animation-delay: 0.60s; }

/* — 1. Greeting header — */
.morning-head {
  display: flex; flex-direction: column; gap: 16px;
  margin-bottom: 32px;
  background: #FFFFFF;
  border: 1px solid rgba(28,24,18,0.08);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
@media (min-width: 768px) {
  .morning-head { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 24px; }
}
.morning-date {
  display: inline-flex; align-items: center; align-self: flex-start;
  background: #3D6B4F; color: #FFFFFF;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 6px 12px; border-radius: 100px;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px rgba(61,107,79,0.18);
}
.morning-greeting {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(34px, 4.4vw, 42px); font-weight: 400;
  font-style: normal;
  line-height: 1.1; color: #1C1812; margin: 0;
}
.morning-sub {
  font-family: 'Open Sans', sans-serif;
  font-size: 15px; color: rgba(28,24,18,0.8);
  margin-top: 10px; line-height: 1.55;
}
.morning-active-pill {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: #3D6B4F;
  white-space: nowrap; align-self: flex-start;
}
.morning-active-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #3D6B4F; display: inline-block;
}

/* — 2. Children avatar row — */
.children-row {
  display: flex; gap: 22px; overflow-x: auto;
  padding: 4px 0 16px; margin-bottom: 28px;
  scrollbar-width: thin;
}
.children-row::-webkit-scrollbar { height: 6px; }
.children-row::-webkit-scrollbar-thumb { background: rgba(28,24,18,0.12); border-radius: 100px; }
.child-avatar-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  border: 2px solid transparent;
  cursor: pointer; padding: 12px;
  border-radius: 12px;
  background: transparent;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  flex-shrink: 0;
}
.child-avatar-btn:hover { transform: translateY(-2px); }
.child-avatar-btn.is-active { border-color: #3D6B4F; }
.child-avatar-circle {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 18px; font-weight: 700; color: #1C1812;
  background: #EBF2EC;
}
.child-avatar-name {
  font-family: 'Open Sans', sans-serif;
  font-size: 12px; font-weight: 600; color: #1C1812;
  max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.child-avatar-grade {
  font-family: 'Open Sans', sans-serif;
  font-size: 10px; color: rgba(28,24,18,0.8);
}
.child-avatar-all .child-avatar-circle {
  background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1);
  color: #3D6B4F;
}
.child-avatar-add .child-avatar-circle {
  background: #FFFFFF; border: 2px dashed rgba(61,107,79,0.5);
  color: #3D6B4F; font-weight: 300;
}
.child-avatar-add:hover .child-avatar-circle {
  border-color: #3D6B4F; background: rgba(61,107,79,0.04);
}

/* — 3. Ei-Core morning insight — */
.morning-insight {
  background: #FFFFFF;
  border: 1px solid rgba(28,24,18,0.08);
  border-left: 3px solid #3D6B4F;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 36px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.morning-insight-head {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
}
.morning-insight-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: #3D6B4F;
}
.morning-insight-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #3D6B4F; display: inline-block;
}
.morning-insight-dismiss {
  background: none; border: none; cursor: pointer;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px; color: rgba(28,24,18,0.8);
  padding: 0;
}
.morning-insight-dismiss:hover { color: #1C1812; }
.morning-insight-text {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px; color: rgba(28,24,18,0.8); line-height: 1.65; margin: 0;
}

/* — 4. Today's plan — */
.plan-section { margin-bottom: 36px; }
.plan-divider {
  height: 1px; background: rgba(28,24,18,0.08);
  margin: 28px 0 26px;
}
.plan-child-head {
  display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
}
.plan-child-dot {
  width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(28,24,18,0.06);
}
.plan-child-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px; font-weight: 400; font-style: normal;
  color: #1C1812; line-height: 1;
}
.plan-blocks { display: flex; flex-direction: column; gap: 14px; position: relative; }
.plan-block {
  position: relative;
  background: #FFFFFF;
  border: 1px solid rgba(28,24,18,0.08);
  border-radius: 12px;
  padding: 18px 22px 18px 30px;
  display: flex; align-items: center; gap: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s, transform 0.2s;
  overflow: hidden;
}
.plan-block:hover { box-shadow: 0 8px 24px rgba(28,24,18,0.07); }
.plan-block + .plan-block::before {
  content: '';
  position: absolute;
  top: -14px; left: 18px;
  width: 0; height: 14px;
  border-left: 1px dashed rgba(28,24,18,0.18);
}
.plan-block-stripe {
  position: absolute; top: 0; left: 0; bottom: 0; width: 6px;
}
.plan-block-body { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; }
.plan-block-icon {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: #3D6B4F;
}
.plan-block-text { flex: 1; min-width: 0; }
.plan-block-title {
  font-family: 'Open Sans', sans-serif;
  font-size: 15px; font-weight: 600; color: #1C1812;
  margin: 0 0 4px;
}
.plan-block-desc {
  font-family: 'Open Sans', sans-serif;
  font-size: 12px; color: rgba(28,24,18,0.8);
  line-height: 1.55; margin: 0;
}
.plan-block-meta {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.plan-pill {
  font-family: 'Open Sans', sans-serif;
  font-size: 10px; font-weight: 700; letter-spacing: 0.02em;
  padding: 4px 10px; border-radius: 100px;
}
.plan-pill-duration {
  color: rgba(28,24,18,0.8);
}
.plan-pill-focus {
  background: #EDE6F6; color: #6B4F8F;
}
.plan-check {
  width: 24px; height: 24px; border-radius: 50%;
  border: 1.5px solid rgba(28,24,18,0.18);
  background: #FFFFFF; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, border-color 0.2s;
  padding: 0;
}
.plan-check:hover { border-color: #3D6B4F; }
.plan-check.is-done {
  background: #3D6B4F; border-color: #3D6B4F;
  animation: eduCheckBounce 0.25s ease-out;
}
.plan-check.is-done svg { color: #FFFFFF; opacity: 1; }
.plan-check svg { color: #FFFFFF; opacity: 0; transition: opacity 0.2s; width: 14px; height: 14px; }

/* — Empty state for plan — */
.plan-empty {
  position: relative;
  background: #FFFFFF; border: 1px solid rgba(28,24,18,0.08);
  border-radius: 12px; padding: 72px 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
}
.plan-empty > * { position: relative; z-index: 1; }
.plan-empty-icon {
  color: #3D6B4F; margin: 0 auto 18px; display: block;
}
.plan-empty-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px; font-weight: 400; color: #1C1812; margin: 0 0 10px;
}
.plan-empty-sub {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px; color: rgba(28,24,18,0.8); line-height: 1.6;
  margin: 0 0 22px;
}
.plan-empty-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px; font-weight: 600; color: #FFFFFF;
  background: #3D6B4F; border: none; cursor: pointer;
  min-height: 44px; padding: 0 24px; border-radius: 8px;
  transition: background 0.2s;
}
.plan-empty-btn:hover { background: #2D5A3F; }

/* — 5. Quick stats — */
.quick-stats {
  display: grid; gap: 14px;
  grid-template-columns: 1fr;
  margin-bottom: 24px;
}
@media (min-width: 600px) { .quick-stats { grid-template-columns: repeat(3, 1fr); } }
.quick-stat {
  background: #FFFFFF;
  border: 1px solid rgba(28,24,18,0.08);
  border-radius: 12px;
  padding: 22px 22px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.quick-stat-sage   { border-bottom: 3px solid #3D6B4F; }
.quick-stat-lavender { border-bottom: 3px solid #6B4F8F; }
.quick-stat-peach  { border-bottom: 3px solid #B8794A; }
.quick-stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 42px; font-weight: 400; color: #1C1812;
  line-height: 1.05; display: flex; align-items: center; gap: 8px;
}
.quick-stat-value svg { color: #3D6B4F; width: 24px; height: 24px; }
.quick-stat-lavender .quick-stat-value svg { color: #6B4F8F; }
.quick-stat-peach .quick-stat-value svg { color: #B8794A; }
.quick-stat-label {
  font-family: 'Open Sans', sans-serif;
  font-size: 10px; color: rgba(28,24,18,0.8);
  letter-spacing: 0.08em; text-transform: uppercase;
  margin-top: 8px;
}

/* — Toast — */
.edu-dash-toast {
  position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
  z-index: 50; width: calc(100% - 32px); max-width: 420px;
  background: #FFFFFF; border: 1px solid rgba(61,107,79,0.3);
  border-left: 4px solid #3D6B4F;
  border-radius: 12px; padding: 14px 16px;
  box-shadow: 0 12px 32px rgba(28,24,18,0.12);
  display: flex; align-items: flex-start; gap: 12px;
}
.edu-dash-toast-icon { color: #3D6B4F; flex-shrink: 0; margin-top: 2px; }
.edu-dash-toast-text { flex: 1; min-width: 0; }
.edu-dash-toast-title { font-size: 13px; font-weight: 700; color: #3D6B4F; }
.edu-dash-toast-sub { font-size: 12px; color: rgba(28,24,18,0.8); margin-top: 2px; }
.edu-dash-toast-close { background: none; border: none; cursor: pointer; color: rgba(28,24,18,0.4); padding: 0; flex-shrink: 0; }
.edu-dash-toast-close:hover { color: #1C1812; }

/* — Modal — */
.edu-dash-modal-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(250,247,242,0.85); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 18px;
  font-family: 'Open Sans', sans-serif;
}
.edu-dash-modal {
  background: #FFFFFF; border: 1px solid rgba(28,24,18,0.08);
  border-radius: 12px; padding: 28px;
  width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 60px rgba(28,24,18,0.18);
}
.edu-dash-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin: -28px -28px 22px;
  padding: 22px 28px;
  background: #FFFFFF;
  border-bottom: 1px solid rgba(28,24,18,0.08);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.edu-dash-modal-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px; font-weight: 400; font-style: normal; color: #1C1812;
}
.edu-dash-modal-close { background: none; border: none; color: rgba(28,24,18,0.8); cursor: pointer; padding: 0; }
.edu-dash-modal-close:hover { color: #1C1812; }
.edu-dash-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.edu-dash-modal-field { margin-bottom: 14px; }
.edu-dash-modal-label {
  display: block; font-family: 'Open Sans', sans-serif;
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(28,24,18,0.8); margin-bottom: 6px;
}
.edu-dash-modal-input,
.edu-dash-modal-select {
  width: 100%; background: #FAF7F2;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 8px; padding: 11px 14px;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px; color: #1C1812;
  transition: border-color 0.2s;
}
.edu-dash-modal-input:focus,
.edu-dash-modal-select:focus {
  outline: none; border-color: #3D6B4F;
  box-shadow: 0 0 0 3px rgba(61,107,79,0.15);
}
.edu-dash-modal-curr { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.edu-dash-modal-curr button {
  font-family: 'Open Sans', sans-serif;
  font-size: 12.5px; font-weight: 500;
  color: rgba(28,24,18,0.8);
  background: #FAF7F2; border: 1px solid rgba(28,24,18,0.1);
  border-radius: 8px; padding: 9px 12px;
  cursor: pointer; transition: all 0.2s;
}
.edu-dash-modal-curr button.on {
  background: #EBF2EC; border-color: #3D6B4F; color: #3D6B4F; font-weight: 600;
}
.edu-dash-modal-toggle-row { display: flex; align-items: center; gap: 12px; margin: 8px 0 4px; }
.edu-dash-modal-toggle {
  position: relative; width: 38px; height: 22px; border-radius: 100px;
  background: rgba(28,24,18,0.15); border: none; cursor: pointer;
  transition: background 0.2s; flex-shrink: 0;
}
.edu-dash-modal-toggle.on { background: #3D6B4F; }
.edu-dash-modal-toggle-dot {
  position: absolute; top: 3px; left: 3px; width: 16px; height: 16px;
  border-radius: 50%; background: #FFFFFF; transition: left 0.2s;
}
.edu-dash-modal-toggle.on .edu-dash-modal-toggle-dot { left: 19px; }
.edu-dash-modal-toggle-label { font-size: 13px; color: rgba(28,24,18,0.8); font-weight: 500; }
.edu-dash-modal-actions { display: flex; gap: 10px; margin-top: 22px; }
.edu-dash-modal-btn {
  display: inline-flex; align-items: center; justify-content: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px; font-weight: 600; border-radius: 8px;
  min-height: 44px; padding: 0 24px; cursor: pointer; transition: background 0.2s, border-color 0.2s, color 0.2s; border: none;
}
.edu-dash-modal-btn-ghost {
  background: #FFFFFF; border: 1px solid rgba(28,24,18,0.15);
  color: #1C1812;
}
.edu-dash-modal-btn-ghost:hover { background: rgba(28,24,18,0.03); }
.edu-dash-modal-btn-primary { flex: 1; background: #3D6B4F; color: #FFFFFF; }
.edu-dash-modal-btn-primary:hover { background: #2D5A3F; }
.edu-dash-modal-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
`;

// — Subject icon helper —
function subjectIcon(subject: string) {
  const s = subject.toLowerCase();
  const common = { width: 20, height: 20, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.5 } as const;
  if (s.includes('math')) {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path strokeLinecap="round" d="M7 7h10M8 11h2m3 0h3M8 14h2m3 0h3M8 17h2m3 0h3" />
      </svg>
    );
  }
  if (s.includes('read')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5C10 4.5 7 4 4 4.5v14c3-.5 6 0 8 2 2-2 5-2.5 8-2v-14c-3-.5-6 0-8 2zM12 6.5v14" />
      </svg>
    );
  }
  if (s.includes('science') || s.includes('nature')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 3v6.5L4 19a2 2 0 001.7 3h12.6a2 2 0 001.7-3L14 9.5V3M9 3h6" />
      </svg>
    );
  }
  if (s.includes('cod') || s.includes('python')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8l-5 4 5 4M15 8l5 4-5 4M14 6l-4 12" />
      </svg>
    );
  }
  if (s.includes('writ')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5z" />
      </svg>
    );
  }
  if (s.includes('history')) {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
      </svg>
    );
  }
  if (s.includes('art')) {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18c5 0 9 3.6 9 8 0 2.5-2 4-4 4h-2a2 2 0 00-2 2c0 1.1.4 2 .6 2.6.3.8-.3 1.4-1.6 1.4z" />
        <circle cx="7.5" cy="11" r="1" /><circle cx="11" cy="7.5" r="1" /><circle cx="16.5" cy="9.5" r="1" />
      </svg>
    );
  }
  // default: notebook
  return (
    <svg {...common}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h11l3 3v13H5z" />
      <path strokeLinecap="round" d="M9 9h6M9 13h6M9 17h4" />
    </svg>
  );
}

let dashStylesInjected = false;
function ensureDashStyles() {
  if (dashStylesInjected) return;
  if (typeof document === 'undefined') return;
  if (document.head.querySelector('style[data-edu-dash]')) {
    dashStylesInjected = true;
    return;
  }
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-edu-dash', 'true');
  styleEl.textContent = DASHBOARD_CSS;
  document.head.appendChild(styleEl);
  dashStylesInjected = true;
}

function AddChildModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (c: Omit<HomeschoolChild, 'id' | 'created_at' | 'overall_progress'>) => void;
}) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', grade_level: '3', age: '',
    curriculum_type: 'Eclectic' as CurriculumType,
    strengths: '', challenge_areas: '', has_iep: false,
  });

  const handleSave = () => {
    if (!form.first_name) return;
    onSave({
      first_name: form.first_name,
      last_name: form.last_name,
      grade_level: form.grade_level,
      age: parseInt(form.age) || 8,
      curriculum_type: form.curriculum_type,
      subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      strengths: form.strengths.split(',').map(s => s.trim()).filter(Boolean),
      challenge_areas: form.challenge_areas.split(',').map(s => s.trim()).filter(Boolean),
      has_iep: form.has_iep,
    });
  };

  return (
    <div className="edu-dash-modal-overlay">
      <div className="edu-dash-modal">
        <div className="edu-dash-modal-head">
          <h2 className="edu-dash-modal-title">Add a learner.</h2>
          <button onClick={onClose} className="edu-dash-modal-close" aria-label="Close">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="edu-dash-modal-grid">
          <div>
            <label className="edu-dash-modal-label">First Name *</label>
            <input
              className="edu-dash-modal-input"
              value={form.first_name}
              onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
              placeholder="Emma"
            />
          </div>
          <div>
            <label className="edu-dash-modal-label">Last Name</label>
            <input
              className="edu-dash-modal-input"
              value={form.last_name}
              onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
              placeholder="Smith"
            />
          </div>
        </div>

        <div className="edu-dash-modal-grid">
          <div>
            <label className="edu-dash-modal-label">Grade</label>
            <select
              className="edu-dash-modal-select"
              value={form.grade_level}
              onChange={e => setForm(p => ({ ...p, grade_level: e.target.value }))}
            >
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g === 'K' ? 'K' : `Grade ${g}`}</option>)}
            </select>
          </div>
          <div>
            <label className="edu-dash-modal-label">Age</label>
            <input
              className="edu-dash-modal-input"
              type="number"
              value={form.age}
              onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
              placeholder="8"
              min={4}
              max={20}
            />
          </div>
        </div>

        <div className="edu-dash-modal-field">
          <label className="edu-dash-modal-label">Curriculum Approach</label>
          <div className="edu-dash-modal-curr">
            {CURRICULUM_TYPES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setForm(p => ({ ...p, curriculum_type: c }))}
                className={form.curriculum_type === c ? 'on' : ''}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="edu-dash-modal-field">
          <label className="edu-dash-modal-label">Strengths</label>
          <input
            className="edu-dash-modal-input"
            value={form.strengths}
            onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))}
            placeholder="Reading, Art, Math"
          />
        </div>

        <div className="edu-dash-modal-field">
          <label className="edu-dash-modal-label">Challenge Areas</label>
          <input
            className="edu-dash-modal-input"
            value={form.challenge_areas}
            onChange={e => setForm(p => ({ ...p, challenge_areas: e.target.value }))}
            placeholder="Writing, Focus, Spelling"
          />
        </div>

        <div className="edu-dash-modal-toggle-row">
          <button
            type="button"
            aria-pressed={form.has_iep}
            className={`edu-dash-modal-toggle${form.has_iep ? ' on' : ''}`}
            onClick={() => setForm(p => ({ ...p, has_iep: !p.has_iep }))}
          >
            <span className="edu-dash-modal-toggle-dot" />
          </button>
          <span className="edu-dash-modal-toggle-label">Has Learning Plan / IEP</span>
        </div>

        <div className="edu-dash-modal-actions">
          <button onClick={onClose} className="edu-dash-modal-btn edu-dash-modal-btn-ghost">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.first_name}
            className="edu-dash-modal-btn edu-dash-modal-btn-primary"
          >
            Add Child
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomeschoolDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string; organization_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [children, setChildren] = useState<HomeschoolChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [familyInsight, setFamilyInsight] = useState<{ summary: string; recommendations: string[] } | null>(null);
  const [insightDismissed, setInsightDismissed] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [showTrialBanner, setShowTrialBanner] = useState(searchParams.get('checkout') === 'success');

  useEffect(() => { ensureDashStyles(); }, []);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/education/login'));
    loadChildren();
  }, []);

  useEffect(() => {
    if (!showTrialBanner) return;
    const t = setTimeout(() => setShowTrialBanner(false), 8000);
    return () => clearTimeout(t);
  }, [showTrialBanner]);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const res = await edu.listHomeschoolChildren();
      const d = res.data;
      setChildren(Array.isArray(d) ? d : (Array.isArray(d?.children) ? d.children : []));
    } catch {
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (data: Omit<HomeschoolChild, 'id' | 'created_at' | 'overall_progress'>) => {
    try {
      await edu.addHomeschoolChild({ ...data, overall_progress: 0 });
      setShowAdd(false);
      loadChildren();
    } catch {
      setShowAdd(false);
    }
  };

  const loadFamilyInsight = async () => {
    if (children.length === 0) return;
    try {
      const res = await edu.getClassInsight({
        is_homeschool: true,
        children: children.map(c => ({
          name: `${c.first_name} ${c.last_name}`,
          grade: c.grade_level,
          curriculum: c.curriculum_type,
          progress: c.overall_progress,
        })),
      });
      setFamilyInsight(res.data);
    } catch {
      setFamilyInsight({
        summary: `Your learning family has ${children.length} child${children.length !== 1 ? 'ren' : ''} with diverse curriculum approaches. Ei-Core has analyzed their pacing and learning styles to provide personalized recommendations.`,
        recommendations: [],
      });
    }
  };

  useEffect(() => {
    if (children.length > 0) loadFamilyInsight();
  }, [children.length]);

  const firstName =
    user?.first_name ??
    (eduProfile as unknown as { firstName?: string } | null)?.firstName ??
    'friend';

  const today = useMemo(() => new Date(), []);
  const greeting = `${greetingForHour(today.getHours())}, ${firstName}.`;
  const dateLabel = formatToday(today);

  const colorFor = (idx: number) => CHILD_COLORS[idx % CHILD_COLORS.length];

  const visibleChildren = selectedChildId
    ? children.filter(c => c.id === selectedChildId)
    : children;

  const totalLessons = children.length * 3;
  const standardsMastered = children.reduce((sum, c) => sum + Math.floor((c.overall_progress || 0) / 10), 0);

  const toggleComplete = (key: string) =>
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }));

  const insightCopy =
    children.length === 0
      ? 'Add your first child and Ei-Core will generate personalized insights by tomorrow morning.'
      : familyInsight?.summary
        ?? 'Ei-Core is reviewing your family\'s pacing this morning. Insights will appear here shortly.';

  return (
    <div className="edu-dash">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="edu-dash-main">
        <EduTrialBanner />

        {showTrialBanner && (
          <div className="edu-dash-toast">
            <svg className="edu-dash-toast-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div className="edu-dash-toast-text">
              <div className="edu-dash-toast-title">Your 14-day trial has started.</div>
              <div className="edu-dash-toast-sub">Welcome to VeloxSync for Education.</div>
            </div>
            <button className="edu-dash-toast-close" onClick={() => setShowTrialBanner(false)} aria-label="Dismiss">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="edu-dash-mobile-bar">
          <button onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="edu-dash-mobile-bar-title">Today</span>
        </div>

        <div className="edu-dash-content">
          {/* 1. Greeting */}
          <header className="morning-head edu-fade edu-fade-1">
            <div>
              <div className="morning-date">{dateLabel}</div>
              <h1 className="morning-greeting">{greeting}</h1>
              <p className="morning-sub">Here is your family's plan for today.</p>
            </div>
            <span className="morning-active-pill" aria-label="Ei-Core is active">
              <span className="morning-active-dot" />
              Ei-Core Active
            </span>
          </header>

          {/* 2. Children avatar row */}
          <div className="children-row edu-fade edu-fade-2" role="tablist" aria-label="Filter by child">
            {children.length > 0 && (
              <button
                type="button"
                className={`child-avatar-btn child-avatar-all${selectedChildId === null ? ' is-active' : ''}`}
                onClick={() => setSelectedChildId(null)}
                aria-pressed={selectedChildId === null}
              >
                <div className="child-avatar-circle">All</div>
                <div className="child-avatar-name">Everyone</div>
                <div className="child-avatar-grade">family view</div>
              </button>
            )}
            {children.map((child, i) => {
              const initials = `${child.first_name[0] ?? ''}${child.last_name?.[0] ?? ''}`.toUpperCase();
              const isActive = selectedChildId === child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  className={`child-avatar-btn${isActive ? ' is-active' : ''}`}
                  onClick={() => setSelectedChildId(isActive ? null : child.id)}
                  aria-pressed={isActive}
                >
                  <div className="child-avatar-circle" style={{ background: colorFor(i) }}>{initials}</div>
                  <div className="child-avatar-name">{child.first_name}</div>
                  <div className="child-avatar-grade">{child.grade_level === 'K' ? 'Grade K' : `Grade ${child.grade_level}`}</div>
                </button>
              );
            })}
            <button
              type="button"
              className="child-avatar-btn child-avatar-add"
              onClick={() => setShowAdd(true)}
              aria-label="Add a child"
            >
              <div className="child-avatar-circle">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="child-avatar-name">Add</div>
              <div className="child-avatar-grade">new learner</div>
            </button>
          </div>

          {/* 3. Ei-Core morning insight */}
          {!insightDismissed && (
            <div className="morning-insight edu-fade edu-fade-3">
              <div className="morning-insight-head">
                <div className="morning-insight-label">
                  <span className="morning-insight-dot" aria-hidden="true" />
                  Ei-Core Insight
                </div>
                <button
                  className="morning-insight-dismiss"
                  onClick={() => setInsightDismissed(true)}
                  aria-label="Dismiss insight"
                >
                  Dismiss
                </button>
              </div>
              <p className="morning-insight-text">{insightCopy}</p>
            </div>
          )}

          {/* 4. Today's plan */}
          <section className="plan-section edu-fade edu-fade-4">
            {loading ? (
              <div className="plan-empty">
                <div className="plan-empty-title" style={{ marginBottom: 0 }}>Loading family…</div>
              </div>
            ) : children.length === 0 ? (
              <div className="plan-empty">
                <svg className="plan-empty-icon" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <h2 className="plan-empty-title">Add your first learner.</h2>
                <p className="plan-empty-sub">
                  Ei-Core will personalize curriculum recommendations and pacing for each child.
                </p>
                <button className="plan-empty-btn" onClick={() => setShowAdd(true)}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Child
                </button>
              </div>
            ) : (
              visibleChildren.map((child, visibleIdx) => {
                const fullIdx = children.findIndex(c => c.id === child.id);
                const color = colorFor(fullIdx);
                const plan = getMockPlan(fullIdx);
                return (
                  <div key={child.id}>
                    {visibleIdx > 0 && <div className="plan-divider" />}
                    <div className="plan-child-head">
                      <span className="plan-child-dot" style={{ background: color }} />
                      <h2 className="plan-child-name">{child.first_name}</h2>
                    </div>
                    <div className="plan-blocks">
                      {plan.map((lesson, lessonIdx) => {
                        const key = `${child.id}-${lessonIdx}`;
                        const done = !!completed[key];
                        return (
                          <div key={key} className="plan-block">
                            <span className="plan-block-stripe" style={{ background: color }} />
                            <div className="plan-block-body">
                              <span className="plan-block-icon">
                                {subjectIcon(lesson.subject)}
                              </span>
                              <div className="plan-block-text">
                                <p className="plan-block-title">{lesson.subject} — {lesson.title}</p>
                                <p className="plan-block-desc">{lesson.desc}</p>
                              </div>
                            </div>
                            <div className="plan-block-meta">
                              {child.has_iep && (
                                <span className="plan-pill plan-pill-focus">Focus Mode</span>
                              )}
                              <span className="plan-pill plan-pill-duration" style={{ background: color }}>{lesson.duration} min</span>
                              <button
                                type="button"
                                className={`plan-check${done ? ' is-done' : ''}`}
                                onClick={() => toggleComplete(key)}
                                aria-pressed={done}
                                aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                              >
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </section>

          {/* 5. Quick stats */}
          {children.length > 0 && (
            <div className="quick-stats edu-fade edu-fade-5">
              <div className="quick-stat quick-stat-sage">
                <div className="quick-stat-value">{standardsMastered}</div>
                <div className="quick-stat-label">Standards mastered · across all children</div>
              </div>
              <div className="quick-stat quick-stat-lavender">
                <div className="quick-stat-value">{totalLessons}</div>
                <div className="quick-stat-label">Lessons this week</div>
              </div>
              <div className="quick-stat quick-stat-peach">
                <div className="quick-stat-value">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.24 17 6.5c1.5 2 1 4 .5 5 .393-.5 1.5-1 2.5.5 1 1.5 1.5 5-2.343 6.657z" />
                  </svg>
                  4 days
                </div>
                <div className="quick-stat-label">Streak</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showAdd && (
        <AddChildModal
          onClose={() => setShowAdd(false)}
          onSave={handleAddChild}
        />
      )}
    </div>
  );
}
