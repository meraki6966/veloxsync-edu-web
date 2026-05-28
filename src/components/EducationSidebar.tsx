import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { EduProfile } from '../types/education';

interface EduSidebarProps {
  user: { first_name?: string; last_name?: string; organization_name?: string } | null;
  eduProfile: EduProfile | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Icon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  family:   'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  children: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  brain:    'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  book:     'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  flag:     'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9',
  pencil:   'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  zap:      'M13 10V3L4 14h7v7l9-11h-7z',
  logo:     'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  signout:  'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
};

const SIDEBAR_CSS = `
.edu-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  width: 260px;
  background: #1C1812;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  font-family: 'Open Sans', sans-serif;
}
.edu-sidebar.open { transform: translateX(0); }
@media (min-width: 768px) {
  .edu-sidebar {
    position: relative;
    transform: translateX(0);
    flex-shrink: 0;
  }
}
.edu-sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(0,0,0,0.5);
}
@media (min-width: 768px) {
  .edu-sidebar-overlay { display: none; }
}
.edu-sidebar-header {
  padding: 22px 22px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 12px;
}
.edu-sidebar-logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #3D6B4F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}
.edu-sidebar-wordmark {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 500;
  color: #FAF7F2;
  line-height: 1.1;
  letter-spacing: 0.01em;
}
.edu-sidebar-wordmark span { color: #8FBF9F; }
.edu-sidebar-sub {
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8FBF9F;
  margin-top: 2px;
}
.edu-sidebar-nav {
  flex: 1;
  padding: 14px 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.edu-sidebar-link {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(250,247,242,0.65);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
}
.edu-sidebar-link:hover {
  background: rgba(255,255,255,0.04);
  color: #FAF7F2;
}
.edu-sidebar-link.active {
  background: rgba(143,191,159,0.12);
  color: #8FBF9F;
  font-weight: 600;
}
.edu-sidebar-pill {
  margin-left: auto;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8FBF9F;
  background: rgba(143,191,159,0.14);
  border: 1px solid rgba(143,191,159,0.25);
  padding: 2px 7px;
  border-radius: 100px;
}
.edu-sidebar-divider {
  height: 1px;
  background: rgba(255,255,255,0.06);
  margin: 14px 4px;
}
.edu-sidebar-eicore {
  margin: 0 14px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(143,191,159,0.08);
  border: 1px solid rgba(143,191,159,0.2);
  color: #8FBF9F;
}
.edu-sidebar-eicore-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8FBF9F;
}
.edu-sidebar-eicore-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.edu-sidebar-user {
  padding: 14px 18px 18px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 11px;
}
.edu-sidebar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3D6B4F;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}
.edu-sidebar-user-info { min-width: 0; }
.edu-sidebar-user-name {
  font-size: 13px;
  font-weight: 600;
  color: #FAF7F2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.edu-sidebar-user-role {
  font-size: 11px;
  color: rgba(250,247,242,0.45);
  margin-top: 2px;
}
.edu-sidebar-signout {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 14px 12px;
  padding: 8px 12px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  /* The cream sidebar text convention is rgba(28,24,18,0.4); on the dark
     sidebar that ink would be invisible, so we use the cream tone at the
     same 0.4 opacity. Hover turns green, per spec. */
  color: rgba(250,247,242,0.4);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  transition: color 0.15s, background 0.15s;
}
.edu-sidebar-signout:hover {
  color: #8FBF9F;
  background: rgba(143,191,159,0.08);
}
.edu-sidebar-signout svg { flex-shrink: 0; }
`;

let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected) return;
  if (typeof document === 'undefined') return;
  if (document.head.querySelector('style[data-edu-sidebar]')) {
    stylesInjected = true;
    return;
  }
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-edu-sidebar', 'true');
  styleEl.textContent = SIDEBAR_CSS;
  document.head.appendChild(styleEl);
  stylesInjected = true;
}

export default function EducationSidebar({
  user,
  eduProfile,
  mobileOpen = false,
  onMobileClose,
}: EduSidebarProps) {
  ensureStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('edu_token');
    localStorage.removeItem('edu_user');
    localStorage.removeItem('eduProfile');
    navigate('/education/login');
  };

  const isActive = (path: string) => {
    if (path === '/education/dashboard') {
      return location.pathname === '/education/dashboard' || location.pathname === '/education/homeschool';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}` || '··'
    : '··';

  const firstName = user?.first_name ?? (eduProfile as unknown as { firstName?: string } | null)?.firstName;
  const lastName = user?.last_name ?? '';
  const displayName = firstName ? `${firstName} ${lastName}`.trim() : 'Your family';

  return (
    <>
      {mobileOpen && <div className="edu-sidebar-overlay" onClick={onMobileClose} />}
      <aside className={`edu-sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="edu-sidebar-header">
          <div className="edu-sidebar-logo">
            <Icon d={ICONS.logo} />
          </div>
          <div>
            <div className="edu-sidebar-wordmark">Velox<span>Sync</span></div>
            <div className="edu-sidebar-sub">For Education</div>
          </div>
        </div>

        <nav className="edu-sidebar-nav">
          <Link
            to="/education/dashboard"
            className={`edu-sidebar-link${isActive('/education/dashboard') ? ' active' : ''}`}
            onClick={onMobileClose}
          >
            <Icon d={ICONS.family} />
            <span>My Learning Family</span>
          </Link>

          <Link
            to="/education/pacing"
            className={`edu-sidebar-link${isActive('/education/pacing') ? ' active' : ''}`}
            onClick={onMobileClose}
          >
            <Icon d={ICONS.calendar} />
            <span>Daily Plan</span>
          </Link>

          <Link
            to="/education/advisor"
            className={`edu-sidebar-link${isActive('/education/advisor') ? ' active' : ''}`}
            onClick={onMobileClose}
          >
            <Icon d={ICONS.brain} />
            <span>Curriculum Advisor</span>
            <span className="edu-sidebar-pill">AI</span>
          </Link>

          <Link
            to="/education/curriculum"
            className={`edu-sidebar-link${isActive('/education/curriculum') ? ' active' : ''}`}
            onClick={onMobileClose}
          >
            <Icon d={ICONS.book} />
            <span>Standards Library</span>
          </Link>

          <Link
            to="/education/interventions"
            className={`edu-sidebar-link${isActive('/education/interventions') ? ' active' : ''}`}
            onClick={onMobileClose}
          >
            <Icon d={ICONS.flag} />
            <span>Interventions</span>
          </Link>

          <Link
            to="/education/assignments"
            className={`edu-sidebar-link${isActive('/education/assignments') ? ' active' : ''}`}
            onClick={onMobileClose}
          >
            <Icon d={ICONS.pencil} />
            <span>Assignment Generator</span>
            <span className="edu-sidebar-pill">AI</span>
          </Link>

          <div className="edu-sidebar-divider" />

          <Link
            to="/education/settings"
            className={`edu-sidebar-link${isActive('/education/settings') ? ' active' : ''}`}
            onClick={onMobileClose}
          >
            <Icon d={ICONS.settings} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="edu-sidebar-eicore">
          <span className="edu-sidebar-eicore-dot" />
          <Icon d={ICONS.zap} />
          <span className="edu-sidebar-eicore-label">Ei-Core Active</span>
        </div>

        <div className="edu-sidebar-user">
          <div className="edu-sidebar-avatar">{initials.toUpperCase()}</div>
          <div className="edu-sidebar-user-info">
            <div className="edu-sidebar-user-name">{displayName}</div>
            <div className="edu-sidebar-user-role">Homeschool Parent</div>
          </div>
        </div>

        <button type="button" className="edu-sidebar-signout" onClick={handleSignOut}>
          <Icon d={ICONS.signout} />
          <span>Sign out</span>
        </button>
      </aside>
    </>
  );
}
