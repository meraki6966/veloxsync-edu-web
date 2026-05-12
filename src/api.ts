import axios from 'axios';

// Education product API. Defaults to the education-specific Railway deployment.
const API_BASE = import.meta.env.VITE_API_URL || 'https://veloxsync-edu-api.up.railway.app';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Routes where a 401 means "not entitled / feature unavailable" — not "session expired".
// These should fail silently rather than wiping the token and redirecting to login.
const SILENT_401_PREFIXES = ['/api/edu'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? '';
      const isSilent = SILENT_401_PREFIXES.some((prefix) => url.startsWith(prefix));
      if (!isSilent) {
        localStorage.removeItem('token');
        window.location.href = '/onboarding';
      }
    }
    return Promise.reject(error);
  }
);

// ========================================
// AUTH
// ========================================
export const auth = {
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post('/api/auth/login', data),
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    organization_type?: string;
    user_type?: string;
  }) => api.post('/api/auth/register', data),
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/onboarding';
  },
};

export const mfa = {
  setup:        ()                                  => api.post('/api/mfa/setup', {}),
  verifySetup:  (code: string)                      => api.post('/api/mfa/verify-setup', { code }),
  verify:       (code: string, tempToken: string)   => api.post('/api/mfa/verify', { code, tempToken }),
  disable:      (password: string)                  => api.post('/api/mfa/disable', { password }),
};

// ========================================
// DASHBOARD (shared identity / org context)
// ========================================
export const dashboard = {
  me: () => api.get('/api/dashboard/me'),
  stats: () => api.get('/api/dashboard/stats'),
  updateIndustry: (industryType: string) =>
    api.patch('/api/dashboard/organization/industry', { industry_type: industryType }),
  updateProfile: (data: any) => api.put('/api/dashboard/profile', data),
  updateOrganization: (data: any) => api.put('/api/dashboard/organization', data),
};

// ========================================
// CALENDAR (used by some edu surfaces)
// ========================================
export const calendar = {
  status:     () => api.get('/api/calendar/status'),
  disconnect: () => api.delete('/api/calendar/disconnect'),
};

// ========================================
// PORTFOLIO — homeschool sovereign narrative synthesis
// ========================================
export const portfolioApi = {
  generate: (data: {
    philosophy: 'Classical' | 'Montessori' | 'Charlotte Mason' | 'Eclectic';
    raw_logs: string[];
    mastery_signals: string[];
    cognitive_friction_events: string[];
    student_name: string;
    grade_level: string;
  }) => api.post<{ narrative: string }>('/api/edu/portfolio/generate', data),
};

// ========================================
// EDUCATION (legacy SchoolFlow / IEP endpoints)
// ========================================
export const education = {
  getStudents: () => api.get('/api/Education/students'),
  createStudent: (data: any) => api.post('/api/Education/students', data),
  getIEPs: (studentId?: number) =>
    api.get('/api/Education/ieps', { params: { studentId } }),
  updateIEP: (iepId: number | string, data: any) =>
    api.put(`/api/Education/ieps/${iepId}`, data),
  getAccommodations: (studentId: number | string) =>
    api.get(`/api/Education/students/${studentId}/accommodations`),
};

// ========================================
// EDU — VeloxSync for Education v2 API
// ========================================
export const edu = {
  // Classrooms
  listClassrooms: () =>
    api.get('/api/edu/classrooms'),
  createClassroom: (data: { name: string; grade_band: string; school_type: string; state: string; subject?: string }) =>
    api.post('/api/edu/classrooms', data),
  getClassroom: (id: string) =>
    api.get(`/api/edu/classrooms/${id}`),

  // Students
  listStudents: () =>
    api.get('/api/edu/students'),
  createStudent: (data: any) =>
    api.post('/api/edu/students', data),
  getStudent: (id: string) =>
    api.get(`/api/edu/students/${id}`),
  updateStudent: (id: string, data: any) =>
    api.put(`/api/edu/students/${id}`, data),
  deleteStudent: (id: string) =>
    api.delete(`/api/edu/students/${id}`),

  // Standards
  listStandards: (params?: { state?: string; grade_band?: string; subject?: string }) =>
    api.get('/api/edu/standards', { params }),

  // Curriculum Progress
  getStudentProgress: (studentId: string) =>
    api.get(`/api/edu/progress/${studentId}`),
  updateProgress: (studentId: string, standardId: string, data: any) =>
    api.put(`/api/edu/progress/${studentId}/${standardId}`, data),

  // Interventions
  listInterventions: () =>
    api.get('/api/edu/interventions'),
  createIntervention: (data: any) =>
    api.post('/api/edu/interventions', data),
  resolveIntervention: (id: string, data: any) =>
    api.patch(`/api/edu/interventions/${id}`, data),

  // Homeschool
  listHomeschoolChildren: () =>
    api.get('/api/edu/homeschool/children'),
  addHomeschoolChild: (data: any) =>
    api.post('/api/edu/homeschool/children', data),

  // AI
  getStudentInsight: (data: any) =>
    api.post('/api/edu/ai/student-insight', data),
  getCurriculumAdvisor: (data: any) =>
    api.post('/api/edu/ai/curriculum-advisor', data),
  getClassInsight: (data: any) =>
    api.post('/api/edu/ai/class-insight', data),

  // Integrations
  getIntegrationsStatus: () =>
    api.get('/api/edu/integrations/status'),
  connectIntegration: (provider: string, data?: Record<string, string>) =>
    api.post(`/api/edu/integrations/${provider}/connect`, data ?? {}),
  disconnectIntegration: (provider: string) =>
    api.delete(`/api/edu/integrations/${provider}`),
  syncIntegration: (provider: string) =>
    api.post(`/api/edu/integrations/${provider}/sync`),

  // Assessment, Pacing, Groups
  createAssessment: (data: any) =>
    api.post('/api/edu/assessments', data),
  getPacingGuide: (classroomId: string) =>
    api.get(`/api/edu/pacing/${classroomId}`),
  generateGroups: (classroomId: string) =>
    api.post(`/api/edu/groups/${classroomId}`, {}),

  // Documents
  uploadDocument: (formData: FormData) =>
    api.post('/api/edu/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  listDocuments: () =>
    api.get('/api/edu/documents'),
};

// ========================================
// EDU BILLING — Stripe checkout & trial
// ========================================
export const eduBilling = {
  checkout: (plan: string, urls?: { success_url?: string; cancel_url?: string }) =>
    api.post('/api/edu/billing/checkout', { plan, ...urls }),
  portal: () =>
    api.post('/api/edu/billing/portal', {}),
  status: () =>
    api.get('/api/edu/billing/status'),
};

export default api;
