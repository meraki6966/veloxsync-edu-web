// src/utils/educationGuard.ts
// ============================================================
// VeloxSync Education Feature Guard
// Use these helpers anywhere in the app to conditionally
// show or hide features based on industry === 'education'
// ============================================================

export type Industry = 'professional_services' | 'project_management' | 'education';

/**
 * Returns true if the current org is in education mode.
 * Pass the organization's industry string.
 */
export const isEducation = (industry: string | undefined): boolean =>
  industry === 'education';

// ── FEATURES TO HIDE IN EDUCATION ──────────────────────────

/**
 * Succession Planning — completely hidden in education.
 * You cannot "replace" a student who is burning out.
 */
export const showSuccessionPlanning = (industry: string) => !isEducation(industry);

/**
 * Billable hours, cost tracking, financial ROI metrics.
 * Teachers do not track financial efficiency of assignments.
 */
export const showFinancialMetrics = (industry: string) => !isEducation(industry);

/**
 * Shift swapping and PTO mechanics.
 * Not relevant on the teacher-to-student dashboard.
 */
export const showShiftAndPTO = (industry: string) => !isEducation(industry);

/**
 * 9-Box Talent Grid — corporate performance/potential matrix.
 * Replace with Roster Health Matrix in education.
 */
export const showNineBox = (industry: string) => !isEducation(industry);

// ── LABEL REMAPPING FOR EDUCATION ──────────────────────────

/**
 * Returns the correct label for the burnout/load score field.
 */
export const getCognitiveLabel = (industry: string): string =>
  isEducation(industry) ? 'Cognitive Load' : 'Burnout Risk';

/**
 * Returns the correct label for the resignation/disconnect risk field.
 */
export const getRiskLabel = (industry: string): string =>
  isEducation(industry) ? 'Disconnect Risk' : 'Resignation Risk';

/**
 * Returns the correct label for the employee list header.
 */
export const getRosterLabel = (industry: string): string =>
  isEducation(industry) ? 'Student Roster' : 'Employee Directory';

/**
 * Returns the correct label for a "team" in context.
 */
export const getTeamLabel = (industry: string): string =>
  isEducation(industry) ? 'Classroom' : 'Team';

/**
 * Returns the correct label for the main dashboard view.
 */
export const getDashboardTitle = (industry: string): string =>
  isEducation(industry) ? 'Teacher Command Center' : 'Performance Dashboard';

// ── TRAFFIC LIGHT HELPERS ──────────────────────────────────

export type LoadStatus = 'sync' | 'friction' | 'overload';

/**
 * Calculates a student's load status from their cognitive load score.
 * Used to power the Roster Health Matrix traffic light.
 */
export const getLoadStatus = (cognitive_load_score: number): LoadStatus => {
  if (cognitive_load_score <= 39) return 'sync';
  if (cognitive_load_score <= 69) return 'friction';
  return 'overload';
};

export const LOAD_STATUS_CONFIG: Record<LoadStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  description: string;
}> = {
  sync: {
    label: 'Sync',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
    description: 'Student is engaged and load is balanced.',
  },
  friction: {
    label: 'Friction',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
    description: 'Student has 3+ heavy assignments due this week.',
  },
  overload: {
    label: 'Overload',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
    description: 'Student has missed a deadline and is in top 10% cognitive load.',
  },
};

/**
 * Returns the daily bandwidth load status from total cognitive weight.
 * Used by the Bandwidth Heatmap calendar cells.
 */
export const getDailyLoadStatus = (totalWeight: number): LoadStatus => {
  if (totalWeight <= 4) return 'sync';
  if (totalWeight <= 8) return 'friction';
  return 'overload';
};

export const HEATMAP_COLORS: Record<LoadStatus, string> = {
  sync:     'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  friction: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  overload: 'bg-red-500/25 border-red-500/40 text-red-300',
};
