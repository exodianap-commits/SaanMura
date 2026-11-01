import React, { useState } from 'react';
import type { Profile } from '@saanmura/shared-types';

interface LoginViewProps {
  onLogin: (profile: Profile) => void;
  availableProfiles: Profile[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, availableProfiles }) => {
  const [activeTab, setActiveTab] = useState<'gov' | 'master'>('gov');
  const [email, setEmail] = useState('admin@saanmura.gov.ph');
  const [password, setPassword] = useState('AdminPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Find profile
    const matched = availableProfiles.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matched) {
      setError('Invalid credentials or unregistered government agency email.');
      return;
    }

    if (matched.role === 'contributor') {
      setError(
        'Access Denied: Contributor accounts are restricted to the SaanMura Mobile App. Administrative and Verifier portals require verified DTI or LGU accreditation.'
      );
      return;
    }

    onLogin(matched);
  };

  const handleQuickLogin = (role: 'admin' | 'verifier' | 'contributor') => {
    const matched = availableProfiles.find((p) => p.role === role);
    if (matched) {
      if (role === 'contributor') {
        setError(
          'Access Denied: Contributor accounts are restricted to the SaanMura Mobile App. Demonstrating security policy rejection.'
        );
      } else {
        setError(null);
        onLogin(matched);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F0] flex flex-col justify-between text-[#111c2d]">
      {/* Top Header */}
      <header className="w-full bg-surface-container-lowest border-b border-outline-variant/60 py-3 px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-fixed flex items-center justify-center font-bold text-lg font-headline shadow-xs">
              ₱
            </span>
            <div>
              <span className="font-headline text-base font-bold text-primary tracking-tight">
                SaanMura PriceWatch PH
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium block -mt-0.5">
                Official DTI & Civic Verifier Gateway • RA 7581
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
            <span className="material-symbols-outlined text-[16px]">security</span>
            <span>Government Gateway 256-bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-lg p-6 sm:p-7 space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary mx-auto shadow-xs">
              <span className="material-symbols-outlined text-[26px]">admin_panel_settings</span>
            </div>
            <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight">
              Admin & Verifier Portal Login
            </h1>
            <p className="text-xs text-on-surface-variant">
              Sign in to manage price monitoring governance, verification queues, and catalog administration.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/40">
            <button
              type="button"
              onClick={() => setActiveTab('gov')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gov'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Agency Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('master')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'master'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              PhilSys Admin ID
            </button>
          </div>

          {error && (
            <div className="p-3 bg-tertiary-container/40 border border-tertiary/40 rounded-xl text-tertiary text-xs space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Security Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-on-surface mb-1">
                {activeTab === 'gov' ? 'Official Agency Work Email' : 'PhilSys Admin ID / PSN'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                  {activeTab === 'gov' ? 'mail' : 'credit_card'}
                </span>
                <input
                  type={activeTab === 'gov' ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === 'gov'
                      ? 'e.g. admin@saanmura.gov.ph'
                      : 'PSN-1092-8401-2290'
                  }
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant/60 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-on-surface">Password / Passkey</label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact DTI IT Service Desk: helpdesk@dti.gov.ph'); }} className="text-primary font-semibold text-[11px] hover:underline">
                  Forgot credentials?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-surface border border-outline-variant/60 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-outline hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-[#7b4200] active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Sign In to Admin Console</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>

          {/* Quick Demo Logins Bar for Seamless Verification */}
          <div className="pt-2 border-t border-outline-variant/40 space-y-2">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block text-center">
              Quick Role Switch (Demo Mode)
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-1.5 px-2 rounded-lg bg-primary/10 border border-primary/30 text-primary font-bold hover:bg-primary/20 transition-all cursor-pointer text-center"
              >
                Director (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('verifier')}
                className="py-1.5 px-2 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary font-bold hover:bg-secondary/20 transition-all cursor-pointer text-center"
              >
                Maria (Verifier)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('contributor')}
                className="py-1.5 px-2 rounded-lg bg-surface-container border border-outline-variant/30 text-outline hover:text-on-surface transition-all cursor-pointer text-center"
              >
                Scout (Reject)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/60 py-3 px-6 text-center text-xs text-on-surface-variant">
        <p>© 2026 Republic of the Philippines • SaanMura Civic PriceWatch Network (RA 7581) • DTI Admin Gateway</p>
      </footer>
    </div>
  );
};
