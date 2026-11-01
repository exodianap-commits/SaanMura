import React from 'react';

interface SideNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  pendingCount: number;
  onOpenAddModal: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentView,
  onNavigate,
  pendingCount,
  onOpenAddModal,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Admin Control Center',
      icon: 'insights',
      description: 'Analytics & Telemetry',
    },
    {
      id: 'queue',
      label: 'Verification Queue',
      icon: 'fact_check',
      badge: pendingCount > 0 ? pendingCount : null,
      description: 'Consensus Reviews',
    },
    {
      id: 'catalog',
      label: 'Catalog & Discovery',
      icon: 'storefront',
      description: 'Commodities Registry',
    },
    {
      id: 'stores',
      label: 'Store Directory & Map',
      icon: 'map',
      description: 'Wet Markets & Stores',
    },
    {
      id: 'users',
      label: 'Civic Contributors',
      icon: 'badge',
      description: 'Scouts & PhilSys IDs',
    },
    {
      id: 'srp',
      label: 'DTI SRP Reference',
      icon: 'verified',
      description: 'Suggested Retail Prices',
    },
    {
      id: 'audit',
      label: 'Supabase & RLS Monitor',
      icon: 'security',
      description: 'Audit Trail & Policies',
    },
  ];

  return (
    <aside className="w-64 min-h-[calc(100vh-56px)] p-4 flex flex-col justify-between shrink-0 bg-surface-container-low border-r border-outline-variant/60 hidden md:flex">
      <div className="space-y-5">
        {/* Module Sub-Header & Seal */}
        <div className="flex items-center gap-3 px-2 py-1 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-secondary-container/40 border border-secondary text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">shield</span>
          </div>
          <div className="leading-tight">
            <div className="font-headline text-xs font-bold text-primary">Civic Modules</div>
            <div className="text-[11px] text-on-surface-variant">Palengke & Retail Watch</div>
            <div className="text-[9px] font-bold text-secondary flex items-center gap-0.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
              DTI OPEN DATA ALLIANCE
            </div>
          </div>
        </div>

        {/* Primary CTA in Sidebar: Log Price Observation */}
        <button
          onClick={onOpenAddModal}
          className="w-full py-2.5 px-3 rounded-lg bg-primary-container text-on-primary-fixed font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_task</span>
          <span>Log Price Observation</span>
        </button>

        {/* Navigation Item Tabs */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
            Governance Pillars
          </div>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-primary-fixed text-on-primary-fixed font-bold shadow-xs border border-primary/20'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[19px] ${
                      isActive ? 'text-primary' : 'text-outline'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="ml-2 bg-tertiary text-white font-bold px-1.5 py-0.2 rounded-full text-[10px] shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Edge Node Status */}
      <div className="pt-3 border-t border-outline-variant/60">
        <div className="px-2 text-[10px] text-secondary flex items-center gap-1.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          <span>Supabase PostgreSQL 15 • Healthy</span>
        </div>
      </div>
    </aside>
  );
};
