// src/types/education.ts
// VeloxSync for Education — shared type definitions

export interface Classroom {
  id: string;
  name: string;
  grade_band: 'K-2' | '3-5' | '6-8' | '9-12';
  subject?: string;
  school_type: 'public' | 'private' | 'charter';
  state: string;
  student_count: number;
  created_at: string;
}

export interface SubjectHealth {
  subject: string;
  status: 'green' | 'amber' | 'red';
  score?: number;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  age?: number;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'mixed';
  has_iep: boolean;
  iep_notes?: string;
  strengths: string[];
  challenge_areas: string[];
  overall_progress: number;
  classroom_id?: string;
  subjects?: SubjectHealth[];
  created_at: string;
}

export interface StateStandard {
  id: string;
  state: string;
  grade_band: string;
  subject: string;
  code: string;
  description: string;
  category: string;
}

export interface CurriculumProgress {
  id: string;
  student_id: string;
  student_name?: string;
  standard_id: string;
  standard?: StateStandard;
  status: 'not_started' | 'in_progress' | 'mastered' | 'needs_review';
  score?: number;
  last_assessed?: string;
  notes?: string;
}

export interface LearningIntervention {
  id: string;
  student_id: string;
  student_name?: string;
  type: string;
  subject?: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  resources?: string[];
  status: 'pending' | 'in_progress' | 'resolved';
  ei_core_generated?: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface HomeschoolChild {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  age: number;
  curriculum_type: 'Classical' | 'Charlotte Mason' | 'Unschooling' | 'Eclectic' | 'Online' | 'Textbook';
  subjects: string[];
  overall_progress: number;
  strengths: string[];
  challenge_areas: string[];
  has_iep: boolean;
  created_at: string;
}

export interface StudentInsight {
  student_id: string;
  student_name: string;
  summary: string;
  recommendations: string[];
  learning_style_description: string;
  suggested_interventions: LearningIntervention[];
  generated_at: string;
}

export interface ClassInsight {
  classroom_id?: string;
  summary: string;
  at_risk_count: number;
  mastery_average: number;
  recommendations: string[];
  generated_at: string;
}

export interface CurriculumRecommendation {
  id: string;
  title: string;
  description: string;
  resources: string[];
  grade_level: string;
  subject: string;
  learning_style?: string;
  curriculum_type?: string;
  rationale: string;
}

export interface EduProfile {
  role: 'teacher' | 'homeschool' | 'admin';
  state: string;
  schoolType?: 'public' | 'private' | 'charter';
  gradeBand?: 'K-2' | '3-5' | '6-8' | '9-12';
  curriculumType?: 'Classical' | 'Charlotte Mason' | 'Unschooling' | 'Eclectic' | 'Online' | 'Textbook';
  classroomName?: string;
  firstChildName?: string;
  completedAt?: string;
}

export const LEARNING_STYLES: Record<Student['learning_style'], { label: string; color: string; description: string }> = {
  visual: {
    label: 'Visual',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Learns best through diagrams, charts, videos, and visual representations.',
  },
  auditory: {
    label: 'Auditory',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Learns best through listening, discussion, verbal instructions, and music.',
  },
  kinesthetic: {
    label: 'Kinesthetic',
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    description: 'Learns best through hands-on activities, movement, and real-world practice.',
  },
  reading_writing: {
    label: 'Reading/Writing',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Learns best through reading texts and writing notes, reports, and summaries.',
  },
  mixed: {
    label: 'Mixed',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    description: 'Adapts well to multiple learning modalities depending on the subject.',
  },
};

export const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming',
];

// ── Grade Band Config ─────────────────────────────────────────────────────────
export const GRADE_BAND_CONFIG = {
  'K-2':  { label: 'Early Learners', icon: '🌱', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', ring: 'ring-emerald-500/30' },
  '3-5':  { label: 'Elementary',     icon: '📚', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/25',         bg: 'bg-blue-500/10',    dot: 'bg-blue-400',    ring: 'ring-blue-500/30' },
  '6-8':  { label: 'Middle School',  icon: '🔬', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/25',   bg: 'bg-purple-500/10',  dot: 'bg-purple-400',  ring: 'ring-purple-500/30' },
  '9-12': { label: 'High School',    icon: '🎓', badge: 'bg-orange-500/15 text-orange-300 border-orange-500/25',   bg: 'bg-orange-500/10',  dot: 'bg-orange-400',  ring: 'ring-orange-500/30' },
} as const;

export function getGradeBand(gradeLevel: string | null | undefined): keyof typeof GRADE_BAND_CONFIG {
  if (gradeLevel === null || gradeLevel === undefined) return '3-5';
  const g = String(gradeLevel).trim();
  if (g === 'K' || g === 'k' || g === '0' || g === '1' || g === '2') return 'K-2';
  if (g === '3' || g === '4' || g === '5') return '3-5';
  if (g === '6' || g === '7' || g === '8') return '6-8';
  if (g === '9' || g === '10' || g === '11' || g === '12') return '9-12';
  return '3-5'; // safe fallback for any unrecognized value
}

// ── Curriculum Frameworks by State ────────────────────────────────────────────
export const CURRICULUM_FRAMEWORKS: Record<string, { abbr: string; full: string }> = {
  'Texas':          { abbr: 'TEKS',    full: 'Texas Essential Knowledge and Skills' },
  'California':     { abbr: 'CA',      full: 'California State Standards + NGSS' },
  'Florida':        { abbr: 'NGSSS',   full: 'Next Generation Sunshine State Standards' },
  'New York':       { abbr: 'NYSLS',   full: 'New York State Learning Standards' },
  'Virginia':       { abbr: 'SOL',     full: 'Virginia Standards of Learning' },
  'Massachusetts':  { abbr: 'MCF',     full: 'Massachusetts Curriculum Frameworks' },
  'Ohio':           { abbr: 'OLS',     full: 'Ohio Learning Standards' },
  'Georgia':        { abbr: 'GPS',     full: 'Georgia Performance Standards' },
  'North Carolina': { abbr: 'NCSCS',   full: 'NC Standard Course of Study' },
  'Pennsylvania':   { abbr: 'PAS',     full: 'Pennsylvania Academic Standards' },
  'Minnesota':      { abbr: 'MNACS',   full: 'Minnesota Academic Content Standards' },
  'Nebraska':       { abbr: 'NeSA',    full: 'Nebraska State Standards' },
  'Indiana':        { abbr: 'INACAD',  full: 'Indiana Academic Standards' },
};
export function getCurriculumFramework(state: string): { abbr: string; full: string } {
  return CURRICULUM_FRAMEWORKS[state] ?? { abbr: 'CCSS', full: 'Common Core State Standards' };
}
