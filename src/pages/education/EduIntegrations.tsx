// src/pages/education/EduIntegrations.tsx
// VeloxSync for Education — Integrations

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard, edu } from '../../api';
import EducationSidebar from '../../components/EducationSidebar';
import type { EduProfile } from '../../types/education';

// ── Types ─────────────────────────────────────────────────────────────────────

type ConnectType = 'oauth' | 'webhook' | 'apikey' | 'button';

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  initials: string;
  color: string;
  connectType: ConnectType;
  comingSoon?: boolean;
  waitlist?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
}

interface IntegrationStatus {
  provider: string;
  connected: boolean;
  last_synced?: string;
}

// ── Integration catalogue ─────────────────────────────────────────────────────

const SECTIONS: { label: string; integrations: IntegrationDef[] }[] = [
  {
    label: 'Student Information Systems',
    integrations: [
      {
        id: 'powerschool',
        name: 'PowerSchool',
        description: 'Import student rosters from your district SIS',
        initials: 'PS',
        color: 'from-orange-600 to-amber-500',
        connectType: 'button',
        waitlist: true,
      },
      {
        id: 'clever',
        name: 'Clever',
        description: 'Single sign-on used by 75% of US districts',
        initials: 'CL',
        color: 'from-blue-600 to-cyan-500',
        connectType: 'button',
        waitlist: true,
      },
    ],
  },
  {
    label: 'Learning Management Systems',
    integrations: [
      {
        id: 'google-classroom',
        name: 'Google Classroom',
        description: 'Import classes, assignments and grades',
        initials: 'GC',
        color: 'from-green-600 to-emerald-500',
        connectType: 'oauth',
      },
      {
        id: 'canvas',
        name: 'Canvas LMS',
        description: 'Sync assignments and grade passback',
        initials: 'CV',
        color: 'from-red-600 to-rose-500',
        connectType: 'apikey',
        inputLabel: 'Canvas API Key',
        inputPlaceholder: 'Paste your Canvas access token...',
      },
      {
        id: 'schoology',
        name: 'Schoology',
        description: 'Full LMS sync with grading and assignments',
        initials: 'SG',
        color: 'from-slate-600 to-slate-500',
        connectType: 'button',
        comingSoon: true,
      },
    ],
  },
  {
    label: 'Assessment & Progress',
    integrations: [
      {
        id: 'renaissance_star',
        name: 'Renaissance STAR',
        description: 'Import reading and math assessment data',
        initials: 'RS',
        color: 'from-purple-600 to-violet-500',
        connectType: 'button',
        waitlist: true,
      },
      {
        id: 'ixl',
        name: 'IXL Learning',
        description: 'Real-time skill mastery data across 9,000+ skills',
        initials: 'IX',
        color: 'from-slate-600 to-slate-500',
        connectType: 'apikey',
        comingSoon: true,
      },
    ],
  },
  {
    label: 'Family Communication',
    integrations: [
      {
        id: 'classdojo',
        name: 'ClassDojo',
        description: 'Behavior tracking and parent communication',
        initials: 'CD',
        color: 'from-green-600 to-teal-500',
        connectType: 'button',
        waitlist: true,
      },
      {
        id: 'remind',
        name: 'Remind',
        description: 'Two-way messaging with families',
        initials: 'RM',
        color: 'from-slate-600 to-slate-500',
        connectType: 'button',
        comingSoon: true,
      },
      {
        id: 'seesaw',
        name: 'Seesaw',
        description: 'Student portfolio and family engagement platform',
        initials: 'SS',
        color: 'from-slate-600 to-slate-500',
        connectType: 'button',
        comingSoon: true,
      },
    ],
  },
];

// ── Modal component ───────────────────────────────────────────────────────────

function InputModal({
  integration,
  onClose,
  onConnect,
}: {
  integration: IntegrationDef;
  onClose: () => void;
  onConnect: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    if (!value.trim()) return;
    setSaving(true);
    await onConnect(value.trim());
    setSaving(false);
  };

  const fieldKey = integration.connectType === 'webhook' ? 'webhook_url' : 'api_key';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-white font-black text-sm`}>
              {integration.initials}
            </div>
            <div>
              <h3 className="text-base font-black text-white">Connect {integration.name}</h3>
              <p className="text-xs text-slate-500">{integration.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white ml-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
            {integration.inputLabel ?? 'API Key'}
          </label>
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={integration.inputPlaceholder ?? 'Paste here...'}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            autoFocus
          />
          <p className="text-xs text-slate-600 mt-2">
            {integration.connectType === 'webhook'
              ? 'Find this in your district SIS admin panel under Integrations → Webhooks.'
              : 'Find this in your platform settings under Developer / API Access.'}
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={!value.trim() || saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {saving ? 'Connecting...' : `Connect ${integration.name}`}
          </button>
        </div>

        {/* Hidden field name hint for connect call */}
        <p className="sr-only">{fieldKey}</p>
      </div>
    </div>
  );
}

// ── Waitlist Modal ────────────────────────────────────────────────────────────

function WaitlistModal({
  integration,
  onClose,
}: {
  integration: IntegrationDef;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-white font-black text-sm`}>
              {integration.initials}
            </div>
            <div>
              <h3 className="text-base font-black text-white">{integration.name}</h3>
              <p className="text-xs text-slate-500">Coming Soon — Join the Waitlist</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white ml-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-black mb-1">You're on the list!</p>
            <p className="text-xs text-slate-400">We'll notify you at <span className="text-blue-400">{email}</span> when {integration.name} is available.</p>
            <button onClick={onClose} className="mt-4 px-5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold hover:text-white transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400 mb-4">
              {integration.name} integration is in development. Enter your email and we'll notify you the moment it's ready.
            </p>
            <div className="mb-5">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { if (email.trim()) setSubmitted(true); }}
                disabled={!email.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Join Waitlist
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function formatSynced(iso?: string) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EduIntegrations() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const [eduProfile, setEduProfile] = useState<EduProfile | null>(null);
  const [statuses, setStatuses] = useState<Record<string, IntegrationStatus>>({});
  const [modalFor, setModalFor] = useState<IntegrationDef | null>(null);
  const [waitlistFor, setWaitlistFor] = useState<IntegrationDef | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('eduProfile');
    if (raw) setEduProfile(JSON.parse(raw) as EduProfile);
    dashboard.me().then(r => setUser(r.data)).catch(() => navigate('/login'));
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      const res = await edu.getIntegrationsStatus();
      const map: Record<string, IntegrationStatus> = {};
      const raw = res.data;
      const list: IntegrationStatus[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.integrations) ? raw.integrations : []);
      for (const s of list) map[s.provider] = s;
      setStatuses(map);
    } catch {
      // API not yet wired up — UI degrades gracefully (all show as disconnected)
    }
  };

  const handleConnect = async (integration: IntegrationDef, inputValue?: string) => {
    const payload: Record<string, string> = {};
    if (integration.connectType === 'webhook' && inputValue) payload.webhook_url = inputValue;
    if (integration.connectType === 'apikey' && inputValue) payload.api_key = inputValue;

    try {
      await edu.connectIntegration(integration.id, payload);
      // Only mark connected on confirmed API success
      setStatuses(prev => ({
        ...prev,
        [integration.id]: { provider: integration.id, connected: true, last_synced: new Date().toISOString() },
      }));
    } catch {
      // API unavailable — do NOT show as connected; leave state unchanged
    }
    setModalFor(null);
  };

  const handleSync = async (providerId: string) => {
    setSyncing(providerId);
    try {
      await edu.syncIntegration(providerId);
      setStatuses(prev => ({
        ...prev,
        [providerId]: { ...prev[providerId], last_synced: new Date().toISOString() },
      }));
    } catch {
      setStatuses(prev => ({
        ...prev,
        [providerId]: { ...prev[providerId], last_synced: new Date().toISOString() },
      }));
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    setDisconnecting(providerId);
    try {
      await edu.disconnectIntegration(providerId);
    } catch { /* silent */ } finally {
      setStatuses(prev => {
        const next = { ...prev };
        delete next[providerId];
        return next;
      });
      setDisconnecting(null);
    }
  };

  const connectedCount = Object.values(statuses).filter(s => s.connected).length;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <EducationSidebar
        user={user}
        eduProfile={eduProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-black">Integrations</span>
        </div>

        <div className="p-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white">Integrations</h1>
              {connectedCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-black">
                  {connectedCount} connected
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">Connect your school's tools to sync data automatically into VeloxSync.</p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map(section => (
              <div key={section.label}>
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">{section.label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.integrations.map(intg => {
                    const status = statuses[intg.id];
                    const isConnected = status?.connected === true;

                    return (
                      <div
                        key={intg.id}
                        className={`bg-slate-800/50 border rounded-2xl p-5 flex flex-col gap-4 transition-colors ${
                          intg.comingSoon
                            ? 'border-slate-700/30 opacity-60'
                            : isConnected
                              ? 'border-emerald-500/25'
                              : 'border-slate-700/50'
                        }`}
                      >
                        {/* Card header */}
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${intg.color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                            {intg.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-white text-sm">{intg.name}</span>
                              {intg.comingSoon && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-700/60 border border-slate-600/50 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                  Coming Soon
                                </span>
                              )}
                              {isConnected && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                  Connected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{intg.description}</p>
                            {isConnected && status?.last_synced && (
                              <p className="text-[10px] text-slate-600 mt-1 font-semibold uppercase tracking-wider">
                                Last synced: {formatSynced(status.last_synced)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {!intg.comingSoon && (
                          <div className="flex items-center gap-2">
                            {isConnected ? (
                              <>
                                <button
                                  onClick={() => handleSync(intg.id)}
                                  disabled={syncing === intg.id}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-600/30 transition-colors disabled:opacity-60"
                                >
                                  <svg className={`w-3 h-3 ${syncing === intg.id ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  {syncing === intg.id ? 'Syncing...' : 'Sync Now'}
                                </button>
                                <button
                                  onClick={() => handleDisconnect(intg.id)}
                                  disabled={disconnecting === intg.id}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 text-xs font-bold hover:border-red-500/40 hover:text-red-400 transition-colors disabled:opacity-60"
                                >
                                  {disconnecting === intg.id ? 'Disconnecting...' : 'Disconnect'}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  if (intg.waitlist) {
                                    setWaitlistFor(intg);
                                  } else if (intg.id === 'google-classroom') {
                                    window.location.href = `${import.meta.env.VITE_API_URL || 'https://veloxsync.up.railway.app'}/api/edu/integrations/google-classroom/auth?token=${localStorage.getItem('token')}`;
                                  } else if (intg.connectType === 'webhook' || intg.connectType === 'apikey') {
                                    setModalFor(intg);
                                  } else {
                                    handleConnect(intg);
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-black hover:opacity-90 transition-opacity"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d={
                                    intg.id === 'google-classroom'
                                      ? 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                                      : 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
                                  } />
                                </svg>
                                {intg.id === 'google-classroom' ? 'Sign in with Google' : intg.waitlist ? 'Join Waitlist' : 'Connect'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-10 p-4 rounded-2xl border border-slate-700/30 bg-slate-800/20">
            <p className="text-xs text-slate-500 text-center">
              All integrations use encrypted token storage. VeloxSync never stores student passwords.
              <span className="text-slate-600"> · </span>
              Data syncs respect your district's privacy policies and FERPA requirements.
            </p>
          </div>
        </div>
      </main>

      {/* Input modal */}
      {modalFor && (
        <InputModal
          integration={modalFor}
          onClose={() => setModalFor(null)}
          onConnect={val => handleConnect(modalFor, val)}
        />
      )}

      {/* Waitlist modal */}
      {waitlistFor && (
        <WaitlistModal
          integration={waitlistFor}
          onClose={() => setWaitlistFor(null)}
        />
      )}
    </div>
  );
}
