import React from 'react';
import type { Profile } from '@saanmura/shared-types';

interface TopNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: Profile;
  onSwitchUser: () => void;
  pendingCount: number;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onSwitchUser,
  pendingCount,
}) => {
  return (
    <header className="bg-surface border-b border-outline-variant shadow-xs sticky top-0 z-40 bg-[#f9f9ff]">
      <div className="flex justify-between items-center w-full px-6 py-2.5 max-w-[1440px] mx-auto gap-4">
        {/* Brand & Search */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-fixed flex items-center justify-center font-bold text-lg font-headline shadow-xs group-hover:scale-105 transition-transform">
              ₱
            </span>
            <div>
              <span className="font-headline text-lg font-bold text-primary tracking-tight block leading-tight">
                SaanMura <span className="text-on-surface font-semibold text-sm">PriceWatch PH</span>
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium tracking-wide">
                Civic Open-Data Governance
              </span>
            </div>
          </button>

          {/* Quick Search Input */}
          <div className="relative hidden lg:block w-72">
            <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search SKU, barcode, store, or scout..."
              className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-full pl-9 pr-8 py-1.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
            />
            <span className="absolute right-2.5 top-1.5 bg-surface-container text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded font-mono border border-outline-variant/40">
              Ctrl+K
            </span>
          </div>
        </div>

        {/* Center: Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-5">
          <button
            onClick={() => onNavigate('catalog')}
            className={`font-label text-xs font-semibold py-1.5 transition-colors cursor-pointer ${
              currentView === 'catalog'
                ? 'border-b-2 border-primary text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Catalog & Discovery
          </button>

          <button
            onClick={() => onNavigate('queue')}
            className={`font-label text-xs font-semibold py-1.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'queue'
                ? 'border-b-2 border-primary text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Verifier Queue</span>
            {pendingCount > 0 && (
              <span className="bg-primary text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`font-label text-xs font-semibold py-1.5 transition-colors cursor-pointer ${
              currentView === 'dashboard'
                ? 'border-b-2 border-primary text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Admin Control Center
          </button>
        </nav>

        {/* Right cluster: Role, live sync, notifications, and avatar */}
        <div className="flex items-center gap-3">
          {/* Role badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed/60 border border-outline-variant/40 text-[11px] font-bold text-on-primary-fixed">
            <span className="material-symbols-outlined text-[14px] text-primary">
              verified_user
            </span>
            <span className="capitalize">{currentUser.role}</span>
          </div>

          <div className="h-5 w-px bg-outline-variant/60 hidden sm:block"></div>

          {/* Quick tool icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => alert('Supabase Edge Node: Synchronized and listening on Realtime channels.')}
              className="p-1.5 text-secondary hover:bg-surface-container rounded-lg transition-colors cursor-pointer relative"
              title="Database Sync: Healthy"
            >
              <span className="material-symbols-outlined text-[19px]">database</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary absolute top-1 right-1 animate-pulse"></span>
            </button>

            <button
              onClick={() => onNavigate('queue')}
              className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[19px]">notifications</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-tertiary absolute top-1.5 right-1.5"></span>
              )}
            </button>
          </div>

          {/* Profile Avatar & Switcher */}
          <div 
            onClick={onSwitchUser}
            className="flex items-center gap-2 pl-1 cursor-pointer group"
            title="Click to switch role / user profile"
          >
            <div className="relative">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser.display_name}
                className="w-8 h-8 rounded-full border-2 border-primary-container object-cover shadow-xs group-hover:ring-2 ring-primary/40 transition-all"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-secondary border-2 border-white absolute bottom-0 right-0"></span>
            </div>
            <div className="hidden xl:block text-left">
              <span className="font-headline text-xs font-bold text-on-surface block leading-tight truncate max-w-[120px]">
                {currentUser.display_name}
              </span>
              <span className="text-[10px] text-on-surface-variant block">
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
