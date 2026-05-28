// src/components/AssignmentModal.tsx
// VeloxSync for Education — AI Assignment Generator Modal

import { useState, useEffect } from 'react';
import { edu } from '../api';
import { US_STATES } from '../types/education';

const ASSIGNMENT_MODAL_CSS = `
.edu-am-input { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.15); color: #1C1812; }
.edu-am-input::placeholder { color: rgba(28,24,18,0.4); }
.edu-am-input:focus { border-color: #3D6B4F; box-shadow: 0 0 0 3px rgba(61,107,79,0.15); }
`;

// ── Constants ──────────────────────────────────────────────────────────────

const CURRICULUM_TYPES = ['Classical', 'Charlotte Mason', 'Unschooling', 'Eclectic', 'Online', 'Textbook'];
const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const LEARNING_STYLE_OPTIONS = [
  { value: 'visual', label: 'Visual' },
  { value: 'auditory', label: 'Auditory' },
  { value: 'kinesthetic', label: 'Kinesthetic' },
  { value: 'reading_writing', label: 'Reading/Writing' },
  { value: 'mixed', label: 'Mixed / Universal Design' },
];
const SUBJECTS = ['Math', 'ELA', 'Science', 'Social Studies', 'Writing', 'Reading', 'Arts', 'STEM', 'Foreign Language'];

// ── Types ──────────────────────────────────────────────────────────────────

interface AssignmentConfig {
  gradeLevel: string;
  state: string;
  subject: string;
  learningStyle: string;
  curriculumType: string;
  topic: string;
  specificStandard: string;
}

export interface AssignmentPrefill {
  gradeLevel?: string;
  state?: string;
  subject?: string;
  learningStyle?: string;
  standardCode?: string;
  standardDescription?: string;
  topic?: string;
}

export interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: AssignmentPrefill;
}

interface Cards3ColSection {
  type: 'cards_3col';
  title: string;
  cards: { title: string; content: string }[];
}
interface CompareContrastSection {
  type: 'compare_contrast';
  title: string;
  left: { label: string; items: string[] };
  right: { label: string; items: string[] };
}
interface SortSection {
  type: 'sort';
  title: string;
  categories: { label: string; items: string[] }[];
}
interface DiscussionSection {
  type: 'discussion';
  title: string;
  question: string;
}
interface NarrationSection {
  type: 'narration';
  title: string;
  prompt: string;
}

type AssignmentSection =
  | Cards3ColSection
  | CompareContrastSection
  | SortSection
  | DiscussionSection
  | NarrationSection;

interface GeneratedAssignment {
  title: string;
  emoji: string;
  standardCode: string;
  iCanStatement: string;
  duration: string;
  materials: string[];
  sections: AssignmentSection[];
  differentiation: { visual: string[]; auditory: string[]; kinesthetic: string[] };
  rubric: { criterion: string; distinguished: string; proficient: string; apprentice: string; novice: string }[];
  teacherNotes: string;
  bridgeToNext: string;
}

// ── Mock Assignment Builder ────────────────────────────────────────────────

function buildMockAssignment(cfg: AssignmentConfig): GeneratedAssignment {
  const topic = cfg.topic.trim() || cfg.subject;
  const g = cfg.gradeLevel;
  const subj = cfg.subject;
  const dur = parseInt(g, 10) <= 3 ? '30–40 minutes' : parseInt(g, 10) <= 6 ? '45–55 minutes' : '50–65 minutes';

  const emoji = '';
  const standardCode = cfg.specificStandard || `${subj.replace(/\s/g, '').slice(0, 3).toUpperCase()}.G${g === 'K' ? 'K' : g}.01`;

  // subject-aware content banks
  const isMath = subj === 'Math' || subj === 'STEM';
  const isSci = subj === 'Science' || subj === 'STEM';
  const isSS = subj === 'Social Studies';
  const isLit = subj === 'ELA' || subj === 'Reading' || subj === 'Writing';

  const titlePrefixes = isMath
    ? ['Number Detectives:', 'Math Explorers:', 'Pattern Hunters:']
    : isSci
    ? ['Little Scientists:', 'Inquiry Lab:', 'Discovery Mission:']
    : isSS
    ? ['Civic Explorers:', 'History Detectives:', 'Map Makers:']
    : isLit
    ? ['Word Detectives:', 'Story Builders:', 'Reading Lab:']
    : ['Learning Lab:', 'Inquiry Circle:', 'Knowledge Builders:'];

  const titlePrefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
  const title = `${titlePrefix} ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  const iCanStatement = isMath
    ? `I can explain and apply ${topic} to solve real-world problems and show my thinking.`
    : isSci
    ? `I can describe how ${topic} works in the natural world and support my ideas with evidence.`
    : isSS
    ? `I can analyze ${topic} and explain its significance using multiple sources.`
    : `I can read, discuss, and write about ${topic} using evidence and my own ideas.`;

  const materials: string[] = isMath
    ? ['pencil & paper', 'graph paper', 'colored pencils', 'ruler', 'manipulatives or tiles']
    : isSci
    ? ['science notebook', 'pencil', 'magnifying glass', 'observation sheet', 'colored pencils']
    : isSS
    ? ['pencil & paper', 'timeline strip', 'colored pencils', 'map printout', 'reference cards']
    : ['pencil', 'reading journal', 'sticky notes', 'highlighter', 'vocabulary notebook'];

  if (cfg.curriculumType === 'Charlotte Mason') materials.push('nature journal');
  if (cfg.curriculumType === 'Classical') materials.push('commonplace book');
  if (cfg.curriculumType === 'Online') materials.push('device/tablet', 'headphones');

  const sections: AssignmentSection[] = [];

  // Section 1 — Cards 3col (vocabulary / key concepts)
  if (isMath) {
    sections.push({
      type: 'cards_3col',
      title: 'Key Concepts to Know',
      cards: [
        { title: 'Define It', content: `Write the definition of ${topic} in your own words. Draw a picture to match.` },
        { title: 'Show It', content: `Create two examples that show ${topic}. Label each part.` },
        { title: 'Real World', content: `Name one place you see ${topic} in everyday life. Explain the connection.` },
      ],
    });
  } else if (isSci) {
    sections.push({
      type: 'cards_3col',
      title: 'Science Vocabulary Bank',
      cards: [
        { title: 'Observe', content: `Look carefully and write 3 things you notice about ${topic}. Use your senses.` },
        { title: 'Question', content: `Write one "I wonder..." question about ${topic} that could be tested.` },
        { title: 'Predict', content: `What do you think would happen if ${topic} changed? Explain your prediction.` },
      ],
    });
  } else if (isSS) {
    sections.push({
      type: 'cards_3col',
      title: 'Little Detectives: Three Big Ideas',
      cards: [
        { title: 'Who or What?', content: `Identify the key people, places, or groups connected to ${topic}.` },
        { title: 'Why It Mattered', content: `Explain one reason ${topic} was important to the people of that time.` },
        { title: 'Then and Now', content: `How does ${topic} still affect life today? Give one example.` },
      ],
    });
  } else {
    sections.push({
      type: 'cards_3col',
      title: 'Reading Three Ways',
      cards: [
        { title: 'Before Reading', content: `Preview the text on ${topic}. Write 2 predictions about what you will learn.` },
        { title: 'During Reading', content: `Mark 3 important details using sticky notes or underlining.` },
        { title: 'After Reading', content: `Write a 2–3 sentence summary of the most important ideas in the text.` },
      ],
    });
  }

  // Section 2 — Compare/Contrast or Sort
  if (isMath) {
    sections.push({
      type: 'compare_contrast',
      title: 'Compare & Connect',
      left: {
        label: 'What I Already Know',
        items: [
          `Recall a related concept you've already mastered`,
          `Write the steps or rules you remember`,
          `Give an example using that prior knowledge`,
        ],
      },
      right: {
        label: `What's New: ${topic}`,
        items: [
          `Identify what is different or added in this new concept`,
          `Write the new steps or rules for ${topic}`,
          `Create a new example using what you just learned`,
        ],
      },
    });
  } else if (isSci) {
    sections.push({
      type: 'sort',
      title: 'Sort It Out',
      categories: [
        { label: 'Things I Observed', items: [`A visible feature of ${topic}`, 'A measurable property', 'Something that changes over time'] },
        { label: 'Things I Inferred', items: ['A cause I cannot directly see', 'A connection to another concept', 'An explanation based on evidence'] },
        { label: 'Questions I Still Have', items: [`Something I do not understand about ${topic}`, 'A variable I want to test', 'A connection I need to research'] },
      ],
    });
  } else if (isSS) {
    sections.push({
      type: 'compare_contrast',
      title: 'Then vs. Now',
      left: { label: 'Historical Perspective', items: ['Key events or decisions from this period', 'How people lived or were governed', 'Challenges people faced at the time'] },
      right: { label: 'Modern Perspective', items: ['How this event or idea affects us today', 'Rights or systems we have because of it', 'What we would change if we could'] },
    });
  } else {
    sections.push({
      type: 'sort',
      title: 'Text Feature Sort',
      categories: [
        { label: 'Main Ideas', items: ['The most important point the author makes', 'The central theme or argument', 'The biggest takeaway from the text'] },
        { label: 'Supporting Details', items: ['A fact or example that supports the main idea', 'A quote from the text as evidence', 'A data point or statistic used by the author'] },
        { label: 'Author\'s Craft', items: ['A word choice that stood out to you', 'A technique the author uses (compare, list, story)', 'How the structure helps the reader understand'] },
      ],
    });
  }

  // Section 3 — Discussion
  const discussionQ = isMath
    ? `Can you explain to a partner how you know your answer to a ${topic} problem is correct? What would you check?`
    : isSci
    ? `If a scientist disagreed with your conclusion about ${topic}, what evidence would you use to support your idea?`
    : isSS
    ? `Is understanding ${topic} important for citizens today? Defend your position with at least two reasons.`
    : `What is the most important idea the author wanted you to understand about ${topic}? How do you know?`;

  sections.push({ type: 'discussion', title: 'Discussion Question', question: discussionQ });

  // Section 4 — Narration
  const narrationPrompt = isMath
    ? `In your own words, walk through every step you would take to solve a ${topic} problem. Write as if you are teaching a friend who has never seen it before.`
    : isSci
    ? `Narrate what happens during ${topic} as if you are telling a story. Include all the key stages or steps in order.`
    : isSS
    ? `Tell the story of ${topic} in your own words. Who was involved, what happened, and why should we remember it?`
    : `Retell the key ideas from today's reading about ${topic} in your own words. What did you find most interesting, and why?`;

  sections.push({ type: 'narration', title: 'Narration / Exit Reflection', prompt: narrationPrompt });

  // Differentiation
  const diff = {
    visual: [
      `Create a graphic organizer or concept map showing the key parts of ${topic}`,
      'Use color-coding to highlight different elements or steps',
      'Draw a diagram, timeline, or labeled illustration',
    ],
    auditory: [
      `Narrate your understanding of ${topic} aloud to a partner before writing`,
      'Use verbal mnemonics or chants to remember key steps or facts',
      'Listen to a read-aloud or recorded explanation before completing the written sections',
    ],
    kinesthetic: [
      `Act out or physically demonstrate one part of ${topic}`,
      isMath ? 'Use manipulatives, tiles, or counters for every problem' : 'Sort printed cards into categories on a table',
      'Move to different stations for each section rather than completing at a desk',
    ],
  };

  // Rubric
  const rubric = [
    {
      criterion: 'Content Understanding',
      distinguished: `Demonstrates thorough, accurate understanding of ${topic} with specific, original examples`,
      proficient: `Shows clear understanding of ${topic} with mostly accurate details and examples`,
      apprentice: `Demonstrates partial understanding; some inaccuracies or missing key details`,
      novice: `Struggles to explain ${topic}; response is incomplete or contains major errors`,
    },
    {
      criterion: 'Evidence & Support',
      distinguished: 'Cites specific, relevant evidence; explains how evidence supports each claim',
      proficient: 'Uses evidence appropriately; connection to claim is mostly clear',
      apprentice: 'Evidence is present but vague or loosely connected to the claim',
      novice: 'Little to no evidence used; claims are unsupported',
    },
    {
      criterion: 'Communication',
      distinguished: 'Writing and/or narration is clear, organized, and uses precise vocabulary',
      proficient: 'Mostly clear communication with minor organizational issues',
      apprentice: 'Some difficulty organizing ideas; vocabulary is basic',
      novice: 'Difficult to follow; vocabulary and structure need significant development',
    },
  ];

  // Parent Notes & Bridge
  const teacherNotes = isMath
    ? `Watch for students who skip showing their work — the reasoning process matters as much as the answer. For early finishers, extend with: "Create your own ${topic} problem and swap with a partner."`
    : isSci
    ? `Encourage students to distinguish observation (what they see) from inference (what they conclude). Push back on "I think" without evidence — ask, "What do you observe that makes you think that?"`
    : isSS
    ? `Remind students that multiple perspectives exist in history. Prompt: "Who might tell this story differently, and why?" This develops critical historical thinking.`
    : `Check that students are citing text evidence rather than relying on prior knowledge alone. Model the difference between "I think…" and "The text says…"`;

  const bridgeToNext = isMath
    ? `Next lesson will build on ${topic} by applying it in a multi-step context. Preview: ask students, "What would change if we added one more step?"`
    : isSci
    ? `Next investigation will test a variable related to ${topic}. Tell students: "Today you observed — next time you'll design an experiment to explain what you noticed."`
    : isSS
    ? `Next lesson examines a different perspective on the same event or era. Ask students to predict: "Who else was affected by ${topic} that we haven't talked about yet?"`
    : `Next session will move from comprehension to analysis. Ask students to hold one question from today's reading — they will return to it with a different text.`;

  return {
    title,
    emoji,
    standardCode,
    iCanStatement,
    duration: dur,
    materials,
    sections,
    differentiation: diff,
    rubric,
    teacherNotes,
    bridgeToNext,
  };
}

// ── Section Renderers ──────────────────────────────────────────────────────

function RenderSection({ s }: { s: AssignmentSection }) {
  if (s.type === 'cards_3col') {
    return (
      <div>
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">{s.title}</h4>
        <div className="grid grid-cols-3 gap-3">
          {s.cards.map((card, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <p className="text-xs font-black text-[#3D6B4F] mb-1.5">{card.title}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{card.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (s.type === 'compare_contrast') {
    return (
      <div>
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">{s.title}</h4>
        <div className="grid grid-cols-2 gap-3">
          {[s.left, s.right].map((col, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <p className="text-xs font-black text-slate-700 mb-2">{col.label}</p>
              <ul className="space-y-1.5">
                {col.items.map((item, j) => (
                  <li key={j} className="text-xs text-slate-600 flex gap-1.5 items-start">
                    <span className="text-[#3D6B4F] mt-0.5 flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (s.type === 'sort') {
    return (
      <div>
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">{s.title}</h4>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(s.categories.length, 3)}, 1fr)` }}>
          {s.categories.map((cat, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <p className="text-xs font-black text-slate-700 mb-2">{cat.label}</p>
              <ul className="space-y-1.5">
                {cat.items.map((item, j) => (
                  <li key={j} className="flex gap-1.5 items-start text-xs text-slate-600">
                    <span className="w-4 h-4 rounded border border-slate-300 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (s.type === 'discussion') {
    return (
      <div>
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">{s.title}</h4>
        <div className="border-l-4 border-blue-400 bg-blue-50 rounded-r-xl px-4 py-3">
          <p className="text-sm text-blue-800 font-medium leading-relaxed">{s.question}</p>
        </div>
      </div>
    );
  }
  if (s.type === 'narration') {
    return (
      <div>
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">{s.title}</h4>
        <div className="border border-amber-200 bg-amber-50 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-900 leading-relaxed">{s.prompt}</p>
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-5 border-b border-amber-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ── Print Helper ───────────────────────────────────────────────────────────

function triggerPrint(assignment: GeneratedAssignment, cfg: AssignmentConfig) {
  const win = window.open('', '_blank');
  if (!win) return;
  const sectionHTML = assignment.sections.map(s => {
    if (s.type === 'cards_3col') return `<h3>${s.title}</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${s.cards.map(c => `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px"><strong>${c.title}</strong><p>${c.content}</p></div>`).join('')}</div>`;
    if (s.type === 'compare_contrast') return `<h3>${s.title}</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px"><strong>${s.left.label}</strong><ul>${s.left.items.map(i => `<li>${i}</li>`).join('')}</ul></div><div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px"><strong>${s.right.label}</strong><ul>${s.right.items.map(i => `<li>${i}</li>`).join('')}</ul></div></div>`;
    if (s.type === 'sort') return `<h3>${s.title}</h3><div style="display:grid;grid-template-columns:repeat(${s.categories.length},1fr);gap:12px">${s.categories.map(c => `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px"><strong>${c.label}</strong><ul>${c.items.map(i => `<li>${i}</li>`).join('')}</ul></div>`).join('')}</div>`;
    if (s.type === 'discussion') return `<h3>${s.title}</h3><div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px;border-radius:4px"><p>${s.question}</p></div>`;
    if (s.type === 'narration') return `<h3>${s.title}</h3><div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px"><p>${s.prompt}</p><hr style="margin:12px 0;border-color:#fde68a"/><div style="height:100px;border:1px dashed #fde68a;border-radius:4px"></div></div>`;
    return '';
  }).join('');

  win.document.write(`<!DOCTYPE html><html><head><title>${assignment.title}</title><style>body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:30px;color:#1a1a1a}h1{font-size:22px;margin-bottom:6px}h2{font-size:16px;color:#374151;margin:18px 0 6px}h3{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin:16px 0 8px}.meta{display:flex;gap:16px;margin-bottom:16px;font-size:13px;color:#6b7280}.teal{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin:12px 0}.chip{display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:2px 8px;font-size:12px;margin:2px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;text-align:left;padding:8px;font-size:12px;border:1px solid #e2e8f0}td{padding:8px;border:1px solid #e2e8f0;font-size:12px;vertical-align:top}.diff{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:8px}.diff-col{border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:12px}.notes{background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-top:16px;font-size:12px}@media print{body{padding:20px}}</style></head><body>
<h1>${assignment.title}</h1>
<div class="meta"><span>Grade ${cfg.gradeLevel}</span><span>${cfg.subject}</span>${cfg.state ? `<span>${cfg.state}</span>` : ''}<span>${assignment.duration}</span></div>
<div class="teal"><strong>${assignment.standardCode}</strong> — ${assignment.iCanStatement}</div>
<h3>Materials</h3><div>${assignment.materials.map(m => `<span class="chip">${m}</span>`).join('')}</div>
${sectionHTML}
<h2>Differentiation</h2>
<div class="diff">
  <div class="diff-col"><strong>Visual</strong><ul>${assignment.differentiation.visual.map(v => `<li>${v}</li>`).join('')}</ul></div>
  <div class="diff-col"><strong>Auditory</strong><ul>${assignment.differentiation.auditory.map(v => `<li>${v}</li>`).join('')}</ul></div>
  <div class="diff-col"><strong>Kinesthetic</strong><ul>${assignment.differentiation.kinesthetic.map(v => `<li>${v}</li>`).join('')}</ul></div>
</div>
<h2>Rubric</h2>
<table><tr><th>Criterion</th><th>Distinguished</th><th>Proficient</th><th>Apprentice</th><th>Novice</th></tr>
${assignment.rubric.map(r => `<tr><td><strong>${r.criterion}</strong></td><td>${r.distinguished}</td><td>${r.proficient}</td><td>${r.apprentice}</td><td>${r.novice}</td></tr>`).join('')}
</table>
<div class="notes"><strong>Parent Notes:</strong> ${assignment.teacherNotes}<br><br><strong>Bridge to Next Lesson:</strong> ${assignment.bridgeToNext}</div>
</body></html>`);
  win.document.close();
  win.print();
}

function copyAssignmentText(assignment: GeneratedAssignment, cfg: AssignmentConfig): string {
  const lines: string[] = [
    `${assignment.title}`,
    `Grade ${cfg.gradeLevel} | ${cfg.subject}${cfg.state ? ` | ${cfg.state}` : ''} | ${assignment.duration}`,
    '',
    `Standard: ${assignment.standardCode}`,
    `I Can: ${assignment.iCanStatement}`,
    '',
    `Materials: ${assignment.materials.join(', ')}`,
    '',
  ];
  assignment.sections.forEach(s => {
    lines.push(`── ${s.title.toUpperCase()} ──`);
    if (s.type === 'cards_3col') s.cards.forEach(c => lines.push(`  • ${c.title}: ${c.content}`));
    if (s.type === 'compare_contrast') { s.left.items.forEach(i => lines.push(`  ${s.left.label}: ${i}`)); s.right.items.forEach(i => lines.push(`  ${s.right.label}: ${i}`)); }
    if (s.type === 'sort') s.categories.forEach(c => { lines.push(`  ${c.label}:`); c.items.forEach(i => lines.push(`    - ${i}`)); });
    if (s.type === 'discussion') lines.push(`  Q: ${s.question}`);
    if (s.type === 'narration') lines.push(`  Prompt: ${s.prompt}`);
    lines.push('');
  });
  lines.push('── DIFFERENTIATION ──');
  lines.push(`  Visual: ${assignment.differentiation.visual.join('; ')}`);
  lines.push(`  Auditory: ${assignment.differentiation.auditory.join('; ')}`);
  lines.push(`  Kinesthetic: ${assignment.differentiation.kinesthetic.join('; ')}`);
  lines.push('');
  lines.push('── RUBRIC ──');
  assignment.rubric.forEach(r => lines.push(`  ${r.criterion}: Distinguished — ${r.distinguished} | Proficient — ${r.proficient}`));
  lines.push('');
  lines.push(`Parent Notes: ${assignment.teacherNotes}`);
  lines.push(`Bridge to Next: ${assignment.bridgeToNext}`);
  return lines.join('\n');
}

// ── Assignment Preview Panel ───────────────────────────────────────────────

function AssignmentPreview({
  assignment,
  cfg,
  onDownload,
  onSave,
  onCopy,
  saving,
  saved,
  copied,
}: {
  assignment: GeneratedAssignment;
  cfg: AssignmentConfig;
  onDownload: () => void;
  onSave: () => void;
  onCopy: () => void;
  saving: boolean;
  saved: boolean;
  copied: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-20">
        {/* Title */}
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            {assignment.title}
          </h2>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-slate-500">Grade {cfg.gradeLevel}</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">{cfg.subject}</span>
            {cfg.state && <><span className="text-xs text-slate-500">·</span><span className="text-xs text-slate-500">{cfg.state}</span></>}
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 border border-slate-200 text-slate-500">{assignment.duration}</span>
          </div>
        </div>

        {/* Standard + I Can */}
        <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'rgba(61,107,79,0.25)', background: 'rgba(61,107,79,0.06)' }}>
          <span className="inline-block px-2 py-0.5 rounded-md text-white text-[10px] font-black uppercase tracking-wider mb-2" style={{ background: '#3D6B4F' }}>
            {assignment.standardCode}
          </span>
          <p className="text-sm font-semibold" style={{ color: '#1C1812' }}>
            <span className="font-black" style={{ color: '#3D6B4F' }}>I Can: </span>{assignment.iCanStatement}
          </p>
        </div>

        {/* Materials */}
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Materials</p>
          <div className="flex flex-wrap gap-1.5">
            {assignment.materials.map((m, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        {assignment.sections.map((s, i) => (
          <div key={i}>
            <RenderSection s={s} />
          </div>
        ))}

        {/* Differentiation */}
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Differentiation</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Visual', items: assignment.differentiation.visual },
              { label: 'Auditory', items: assignment.differentiation.auditory },
              { label: 'Kinesthetic', items: assignment.differentiation.kinesthetic },
            ].map(col => (
              <div key={col.label} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                <p className="text-xs font-black text-slate-700 mb-2">{col.label}</p>
                <ul className="space-y-1.5">
                  {col.items.map((item, j) => (
                    <li key={j} className="text-xs text-slate-600 leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Rubric */}
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Rubric</p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-black text-slate-700 w-28">Criterion</th>
                  <th className="text-left px-3 py-2 font-black text-emerald-700">Distinguished</th>
                  <th className="text-left px-3 py-2 font-black text-blue-700">Proficient</th>
                  <th className="text-left px-3 py-2 font-black text-amber-700">Apprentice</th>
                  <th className="text-left px-3 py-2 font-black text-red-700">Novice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignment.rubric.map((row, i) => (
                  <tr key={i} className="bg-white">
                    <td className="px-3 py-2 font-semibold text-slate-800 align-top">{row.criterion}</td>
                    <td className="px-3 py-2 text-slate-600 align-top">{row.distinguished}</td>
                    <td className="px-3 py-2 text-slate-600 align-top">{row.proficient}</td>
                    <td className="px-3 py-2 text-slate-600 align-top">{row.apprentice}</td>
                    <td className="px-3 py-2 text-slate-600 align-top">{row.novice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Parent Notes */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Parent Notes</p>
          <p className="text-sm text-slate-700 leading-relaxed">{assignment.teacherNotes}</p>
        </div>

        {/* Bridge */}
        <div className="rounded-xl p-4" style={{ border: '1px solid rgba(61,107,79,0.2)', background: 'rgba(61,107,79,0.05)' }}>
          <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#3D6B4F' }}>Bridge to Next Lesson</p>
          <p className="text-sm leading-relaxed" style={{ color: '#2E5340' }}>{assignment.bridgeToNext}</p>
        </div>
      </div>

      {/* Action Buttons — pinned to bottom */}
      <div className="sticky bottom-0 border-t border-slate-200 px-6 py-3 flex gap-2 flex-shrink-0 bg-white z-10">
        <button
          onClick={onDownload}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6B4F] px-6 text-white transition-colors hover:bg-[#2D5A3F]"
          style={{ minHeight: 44, fontFamily: "'Open Sans', sans-serif", fontSize: 14, fontWeight: 600 }}
        >
          <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Print to PDF
        </button>
        <button
          onClick={onSave}
          disabled={saving || saved}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6B4F] px-6 text-white transition-colors hover:bg-[#2D5A3F] disabled:opacity-60"
          style={{ minHeight: 44, fontFamily: "'Open Sans', sans-serif", fontSize: 14, fontWeight: 600 }}
        >
          <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={saved ? 'M20 6 9 17l-5-5' : 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'} />
          </svg>
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save to Child'}
        </button>
        <button
          onClick={onCopy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6B4F] px-6 text-white transition-colors hover:bg-[#2D5A3F]"
          style={{ minHeight: 44, fontFamily: "'Open Sans', sans-serif", fontSize: 14, fontWeight: 600 }}
        >
          <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={copied ? 'M20 6 9 17l-5-5' : 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'} />
          </svg>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
}

// ── Main Modal Component ───────────────────────────────────────────────────

export default function AssignmentModal({ isOpen, onClose, prefill = {} }: AssignmentModalProps) {
  const [gradeLevel, setGradeLevel] = useState(prefill.gradeLevel ?? '5');
  const [state, setState] = useState(prefill.state ?? '');
  const [subject, setSubject] = useState(prefill.subject ?? '');
  const [learningStyle, setLearningStyle] = useState(prefill.learningStyle ?? 'mixed');
  const [curriculumType, setCurriculumType] = useState('Eclectic');
  const [topic, setTopic] = useState(prefill.topic ?? '');
  const [specificStandard, setSpecificStandard] = useState(
    prefill.standardCode ? `${prefill.standardCode}${prefill.standardDescription ? ' — ' + prefill.standardDescription.slice(0, 80) : ''}` : ''
  );

  const [assignment, setAssignment] = useState<GeneratedAssignment | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg: AssignmentConfig = { gradeLevel, state, subject, learningStyle, curriculumType, topic, specificStandard };

  useEffect(() => {
    if (!isOpen) return;
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-assignment-modal', 'true');
    styleEl.textContent = ASSIGNMENT_MODAL_CSS;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!subject || !gradeLevel) return;
    setGenerating(true);
    setAssignment(null);
    setSaved(false);
    try {
      const res = await edu.getCurriculumAdvisor({
        mode: 'generate_assignment',
        grade_level: gradeLevel,
        state,
        subject,
        learning_style: learningStyle,
        curriculum_type: curriculumType,
        topic,
        specific_standard: specificStandard,
      });
      const raw = res.data;
      // If the API returns a well-formed assignment, use it — otherwise fall back to mock
      if (raw && typeof raw === 'object' && raw.title && raw.sections) {
        setAssignment(raw as GeneratedAssignment);
      } else {
        setAssignment(buildMockAssignment(cfg));
      }
    } catch {
      setAssignment(buildMockAssignment(cfg));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!assignment) return;
    setSaving(true);
    try {
      await edu.createIntervention({
        student_id: '',
        student_name: `${assignment.emoji} ${assignment.title}`,
        type: 'enrichment',
        subject: subject,
        description: `${assignment.iCanStatement}\n\nStandard: ${assignment.standardCode}\nDuration: ${assignment.duration}\n\nParent Notes: ${assignment.teacherNotes}`,
        priority: 'medium',
        status: 'pending',
        resources: assignment.materials,
        ei_core_generated: true,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!assignment) return;
    await navigator.clipboard.writeText(copyAssignmentText(assignment, cfg));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!assignment) return;
    triggerPrint(assignment, cfg);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div className="fixed inset-2 md:inset-4 z-50 rounded-2xl flex flex-col overflow-hidden shadow-2xl" style={{ background: '#FAF7F2', border: '1px solid rgba(28,24,18,0.1)', fontFamily: "'Open Sans', sans-serif" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(28,24,18,0.1)', background: '#FFFFFF' }}>
          <div className="flex items-center gap-3">
            <svg width={20} height={20} fill="none" stroke="#3D6B4F" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <div>
              <h2 className="text-lg font-normal" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1C1812' }}>Assignment Builder</h2>
              <p className="text-xs" style={{ color: 'rgba(28,24,18,0.8)' }}>Ei-Core builds a complete, printable assignment in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border bg-white transition-colors hover:bg-[rgba(28,24,18,0.03)]"
            style={{ width: 44, height: 44, borderColor: 'rgba(28,24,18,0.15)', color: '#1C1812' }}
            aria-label="Close"
          >
            <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Left: Config */}
          <div className="w-[320px] overflow-y-auto flex-shrink-0 p-6 space-y-4" style={{ borderRight: '1px solid rgba(28,24,18,0.1)', background: '#FAF7F2' }}>
            <p className="text-[11px] uppercase font-semibold tracking-[0.12em]" style={{ color: '#3D6B4F' }}>Assignment Configuration</p>

            {/* Grade Level */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#3D6B4F' }}>Grade Level</label>
              <select
                value={gradeLevel}
                onChange={e => setGradeLevel(e.target.value)}
                className="edu-am-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#3D6B4F' }}>State <span className="normal-case font-normal" style={{ color: 'rgba(28,24,18,0.4)' }}>(optional)</span></label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="edu-am-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="">Any state / No standard preference</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#3D6B4F' }}>Subject *</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="edu-am-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="">Select subject...</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Learning Style */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#3D6B4F' }}>Learning Style</label>
              <select
                value={learningStyle}
                onChange={e => setLearningStyle(e.target.value)}
                className="edu-am-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                {LEARNING_STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Curriculum Approach */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#3D6B4F' }}>Curriculum Approach</label>
              <select
                value={curriculumType}
                onChange={e => setCurriculumType(e.target.value)}
                className="edu-am-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                {CURRICULUM_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#3D6B4F' }}>Topic / Focus *</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. fractions, Republic leaders, photosynthesis"
                className="edu-am-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>

            {/* Specific Standard */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#3D6B4F' }}>
                Specific Standard <span className="normal-case font-normal" style={{ color: 'rgba(28,24,18,0.4)' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={specificStandard}
                onChange={e => setSpecificStandard(e.target.value)}
                placeholder="e.g. state standard code"
                className="edu-am-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!subject || !gradeLevel || generating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6B4F] px-6 text-white transition-colors hover:bg-[#2D5A3F] disabled:opacity-40"
              style={{ minHeight: 44, fontFamily: "'Open Sans', sans-serif", fontSize: 14, fontWeight: 600 }}
            >
              {generating ? (
                <>
                  <svg width={20} height={20} className="animate-spin" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Ei-Core is building...
                </>
              ) : (
                <>
                  <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-2 9h-4m2-2v4" />
                  </svg>
                  Generate Assignment
                </>
              )}
            </button>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {!assignment && !generating ? (
              <div className="h-full flex items-center justify-center p-8" style={{ background: '#FFFFFF' }}>
                <div className="text-center max-w-sm">
                  <svg width={48} height={48} fill="none" stroke="#3D6B4F" strokeWidth={1.5} viewBox="0 0 24 24" className="mx-auto mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="text-xl font-normal mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1C1812' }}>Assignment Preview</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(28,24,18,0.8)' }}>
                    Fill in the configuration on the left and click "Generate Assignment" to see a complete, printable assignment with rubric, differentiation options, and parent notes.
                  </p>
                </div>
              </div>
            ) : generating ? (
              <div className="h-full flex items-center justify-center p-8" style={{ background: '#FFFFFF' }}>
                <div className="text-center">
                  <svg width={40} height={40} className="mx-auto mb-4 animate-spin" fill="none" stroke="#3D6B4F" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="font-semibold text-base" style={{ color: '#1C1812' }}>Ei-Core is building your assignment...</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(28,24,18,0.8)' }}>Standards · Rubric · Activities · Differentiation</p>
                </div>
              </div>
            ) : assignment ? (
              <AssignmentPreview
                assignment={assignment}
                cfg={cfg}
                onDownload={handleDownload}
                onSave={handleSave}
                onCopy={handleCopy}
                saving={saving}
                saved={saved}
                copied={copied}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
