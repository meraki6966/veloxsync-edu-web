import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EduLanding from './pages/education/EduLanding';
import EduLogin from './pages/education/EduLogin';
import EduOnboarding from './pages/education/EduOnboarding';
import EduCheckout from './pages/education/EduCheckout';
import HomeschoolDashboard from './pages/education/HomeschoolDashboard';
import StudentProfile from './pages/education/StudentProfile';
import CurriculumTracker from './pages/education/CurriculumTracker';
import CurriculumAdvisor from './pages/education/CurriculumAdvisor';
import PacingGuide from './pages/education/PacingGuide';
import Interventions from './pages/education/Interventions';
import AssignmentGenerator from './pages/education/AssignmentGenerator';
import EduSettings from './pages/education/EduSettings';
import EduSupport from './pages/education/EduSupport';
import EduPrivacy from './pages/education/EduPrivacy';
import EduFAQ from './pages/education/EduFAQ';
import CookieConsent from './components/CookieConsent';

export default function App() {
  return (
    <BrowserRouter>
      <CookieConsent />
      <Routes>
        {/* Public */}
        <Route path="/" element={<EduLanding />} />
        <Route path="/support" element={<EduSupport publicMode />} />
        <Route path="/education/privacy" element={<EduPrivacy />} />
        <Route path="/education/faq" element={<EduFAQ />} />

        {/* Auth + signup */}
        <Route path="/education/login" element={<EduLogin />} />
        <Route path="/education/onboarding" element={<EduOnboarding />} />
        <Route path="/education/checkout" element={<EduCheckout />} />

        {/* Authenticated app */}
        <Route path="/education/dashboard" element={<HomeschoolDashboard />} />
        <Route path="/education/homeschool" element={<HomeschoolDashboard />} />
        <Route path="/education/students/:id" element={<StudentProfile />} />
        <Route path="/education/curriculum" element={<CurriculumTracker />} />
        <Route path="/education/advisor" element={<CurriculumAdvisor />} />
        <Route path="/education/pacing" element={<PacingGuide />} />
        <Route path="/education/interventions" element={<Interventions />} />
        <Route path="/education/assignments" element={<AssignmentGenerator />} />
        <Route path="/education/settings" element={<EduSettings />} />
        <Route path="/education/support" element={<EduSupport />} />
      </Routes>
    </BrowserRouter>
  );
}
