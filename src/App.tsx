import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EduLanding from './pages/education/EduLanding';
import K12Landing from './pages/education/K12Landing';
import HomeschoolLanding from './pages/education/HomeschoolLanding';
import EduOnboarding from './pages/education/EduOnboarding';
import EduCheckout from './pages/education/EduCheckout';
import TeacherDashboard from './pages/education/TeacherDashboard';
import HomeschoolDashboard from './pages/education/HomeschoolDashboard';
import StudentRoster from './pages/education/StudentRoster';
import StudentProfile from './pages/education/StudentProfile';
import CurriculumTracker from './pages/education/CurriculumTracker';
import CurriculumAdvisor from './pages/education/CurriculumAdvisor';
import PacingGuide from './pages/education/PacingGuide';
import Interventions from './pages/education/Interventions';
import DifferentiationGroups from './pages/education/DifferentiationGroups';
import AssignmentGenerator from './pages/education/AssignmentGenerator';
import EduIntegrations from './pages/education/EduIntegrations';
import TexasTeks from './pages/education/TexasTeks';
import IepCompliance from './pages/education/IepCompliance';
import CommonCore from './pages/education/CommonCore';
import EducationDashboard from './pages/dashboards/EducationDashboard';
import CookieConsent from './components/CookieConsent';

export default function App() {
  return (
    <BrowserRouter>
      <CookieConsent />
      <Routes>
        <Route path="/" element={<EduLanding />} />
        <Route path="/k12" element={<K12Landing />} />
        <Route path="/homeschool" element={<HomeschoolLanding />} />
        <Route path="/onboarding" element={<EduOnboarding />} />
        <Route path="/checkout" element={<EduCheckout />} />
        <Route path="/dashboard" element={<TeacherDashboard />} />
        <Route path="/dashboard/homeschool" element={<HomeschoolDashboard />} />
        <Route path="/dashboard/education" element={<EducationDashboard />} />
        <Route path="/students" element={<StudentRoster />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/curriculum" element={<CurriculumTracker />} />
        <Route path="/advisor" element={<CurriculumAdvisor />} />
        <Route path="/pacing" element={<PacingGuide />} />
        <Route path="/interventions" element={<Interventions />} />
        <Route path="/groups" element={<DifferentiationGroups />} />
        <Route path="/assignments" element={<AssignmentGenerator />} />
        <Route path="/integrations" element={<EduIntegrations />} />
        <Route path="/texas-teks" element={<TexasTeks />} />
        <Route path="/iep-compliance" element={<IepCompliance />} />
        <Route path="/common-core" element={<CommonCore />} />
      </Routes>
    </BrowserRouter>
  );
}
