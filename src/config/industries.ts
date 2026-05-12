export const industries = {
 standard: {
 name: 'VeloxSync Platform',
 tagline: 'Performance Intelligence Platform',
 color: 'indigo',
 icon: '',
 features: ['Employee Management', 'Team Analytics', 'Burnout Prevention', 'AI Coaching'],
 metrics: {
 primary: 'Employees',
 secondary: 'Teams',
 tertiary: 'Projects'
 },
 terminology: {
 employee: 'Employee',
 employees: 'Employees',
 team: 'Team',
 teams: 'Teams',
 manager: 'Manager'
 }
 },
 professional_services: {
 name: 'VeloxSync Platform - Professional Services',
 tagline: 'Performance Intelligence Platform',
 color: 'indigo',
 icon: '',
 features: ['Employee Management', 'Team Analytics', 'Burnout Prevention', 'AI Coaching'],
 metrics: {
 primary: 'Employees',
 secondary: 'Teams',
 tertiary: 'Projects'
 },
 terminology: {
 employee: 'Employee',
 employees: 'Employees',
 team: 'Team',
 teams: 'Teams',
 manager: 'Manager'
 }
 },
 education: {
 name: 'VeloxSync Platform - Education',
 tagline: 'Educational Excellence Platform',
 color: 'emerald',
 icon: '',
 features: ['Student Management', 'Class Analytics', 'Teacher Wellness', 'AI Tutoring'],
 metrics: {
 primary: 'Students',
 secondary: 'Classes',
 tertiary: 'Courses'
 },
 terminology: {
 employee: 'Student',
 employees: 'Students',
 team: 'Class',
 teams: 'Classes',
 manager: 'Teacher'
 }
 },
 project_management: {
 name: 'VeloxSync Platform - Project Management',
 tagline: 'Project & Construction Platform',
 color: 'amber',
 icon: '',
 features: ['Crew Management', 'Site Analytics', 'Safety Tracking', 'AI Project Support'],
 metrics: {
 primary: 'Workers',
 secondary: 'Crews',
 tertiary: 'Sites'
 },
 terminology: {
 employee: 'Worker',
 employees: 'Workers',
 team: 'Crew',
 teams: 'Crews',
 manager: 'Foreman'
 }
 }
};

export type IndustryType = keyof typeof industries;

export const getIndustryConfig = (type: string) => {
 return industries[type as IndustryType] || industries.standard;
};

export const industryColors: Record<string, { bg: string; text: string; light: string; border: string }> = {
 indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-100' },
 emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-100' },
 amber: { bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-100' },
};

export const industryOptions = [
 { value: 'standard', label: 'VeloxSync Platform' },
 { value: 'professional_services', label: 'VeloxSync Platform - Professional Services' },
 { value: 'education', label: 'VeloxSync Platform - Education' },
 { value: 'project_management', label: 'VeloxSync Platform - Project Management' },
];
