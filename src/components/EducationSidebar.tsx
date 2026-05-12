// src/components/EducationSidebar.tsx
// VeloxSync for Education — dedicated sidebar

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { EduProfile } from '../types/education';

interface EduSidebarProps {
  user: { first_name?: string; last_name?: string; organization_name?: string } | null;
  eduProfile: EduProfile | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Icon = ({ d, className }: { d: string; className?: string }) => (
  <svg className={`w-4 h-4 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  home:       'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  students:   'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  book:       'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  brain:      'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  standards:  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  pencil:     'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  flag:       'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9',
  settings:   'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  family:     'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  back:       'M10 19l-7-7m0 0l7-7m-7 7h18',
  zap:        'M13 10V3L4 14h7v7l9-11h-7z',
  plug:       'M5 12H3m2 0a9 9 0 1018 0M5 12a9 9 0 0118 0m-9 4v4m-3-2h6M12 3v1',
  calendar:   'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  users:      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
};

export default function EducationSidebar({ user, eduProfile, mobileOpen = false, onMobileClose }: EduSidebarProps) {
  const location = useLocation();
  const [sysOpen, setSysOpen] = useState(false);
  const isHomeschool = eduProfile?.role === 'homeschool';

  const active = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navClass = (path: string) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
      active(path)
        ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/20'
        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
    }`;

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`
    : '??';

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onMobileClose} />
      )}
      <aside className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-[#0C1F36]/95 backdrop-blur-xl border-r border-blue-900/30 flex flex-col transform transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="p-6 border-b border-blue-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center">
              <Icon d={ICONS.brain} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">VeloxSync</h2>
              <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest">Education</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-1">

          {/* Main Dashboard */}
          <Link
            to={isHomeschool ? '/education/homeschool' : '/education'}
            className={navClass(isHomeschool ? '/education/homeschool' : '/education')}
          >
            <Icon d={isHomeschool ? ICONS.family : ICONS.home} />
            <span>{isHomeschool ? 'My Learning Family' : 'My Classroom'}</span>
          </Link>

          {/* Students */}
          <Link to="/education/students" className={navClass('/education/students')}>
            <Icon d={ICONS.students} />
            <span>Students</span>
          </Link>

          {/* Curriculum Tracker */}
          <Link to="/education/curriculum" className={navClass('/education/curriculum')}>
            <Icon d={ICONS.book} />
            <span>Curriculum Tracker</span>
          </Link>

          {/* Curriculum Advisor */}
          <Link to="/education/advisor" className={navClass('/education/advisor')}>
            <Icon d={ICONS.brain} />
            <span className="flex-1">Curriculum Advisor</span>
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20 uppercase tracking-wider">AI</span>
          </Link>

          {/* Standards Library */}
          <Link to="/education/standards" className={navClass('/education/standards')}>
            <Icon d={ICONS.standards} />
            <span>Standards Library</span>
          </Link>

          {/* Interventions */}
          <Link to="/education/interventions" className={navClass('/education/interventions')}>
            <Icon d={ICONS.flag} />
            <span>Interventions</span>
          </Link>

          {/* Pacing Guide */}
          <Link to="/education/pacing" className={navClass('/education/pacing')}>
            <Icon d={ICONS.calendar} />
            <span>Pacing Guide</span>
          </Link>

          {/* Differentiation Groups */}
          <Link to="/education/groups" className={navClass('/education/groups')}>
            <Icon d={ICONS.users} />
            <span>Diff. Groups</span>
          </Link>

          {/* Assignment Generator */}
          <Link to="/education/assignments" className={navClass('/education/assignments')}>
            <Icon d={ICONS.pencil} />
            <span className="flex-1">Assignment Generator</span>
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/20 uppercase tracking-wider">AI</span>
          </Link>

          {/* Integrations */}
          <Link to="/education/integrations" className={navClass('/education/integrations')}>
            <Icon d={ICONS.plug} />
            <span>Integrations</span>
          </Link>

          {/* Divider */}
          <div className="pt-3 mt-3 border-t border-slate-700/50">
            <button
              onClick={() => setSysOpen(p => !p)}
              className="w-full flex items-center justify-between px-4 py-2 mb-1"
            >
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System</span>
              <svg className={`w-3 h-3 text-slate-500 transition-transform ${sysOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {sysOpen && (
              <div className="space-y-0.5">
                <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                  <Icon d={ICONS.settings} />
                  <span>Settings</span>
                </Link>
                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors">
                  <Icon d={ICONS.back} />
                  <span>Main Dashboard</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Ei-Core badge */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/8 border border-blue-500/15">
            <Icon d={ICONS.zap} className="text-blue-400 w-3 h-3" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Ei-Core Active</span>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-t border-blue-900/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white font-black text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-400 truncate capitalize">
                {eduProfile?.role === 'homeschool' ? 'Homeschool Parent' : eduProfile?.role === 'admin' ? 'Administrator' : 'Teacher'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
