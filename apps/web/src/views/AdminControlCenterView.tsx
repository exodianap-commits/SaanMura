import React from 'react';
import type { Product, VerificationStats } from '@saanmura/shared-types';
import { formatPeso } from '@saanmura/domain';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

interface AdminControlCenterViewProps {
  stats: VerificationStats;
  products: Product[];
  onNavigate: (view: string) => void;
}

// Sample 30-day price trend telemetry data for the chart
const VOLATILITY_DATA = [
  { day: 'Oct 01', supermarket: 41.50, wetMarket: 39.80, srp: 41.50 },
  { day: 'Oct 05', supermarket: 41.50, wetMarket: 40.00, srp: 41.50 },
  { day: 'Oct 10', supermarket: 42.00, wetMarket: 39.50, srp: 41.50 },
  { day: 'Oct 15', supermarket: 41.80, wetMarket: 39.20, srp: 41.50 },
  { day: 'Oct 20', supermarket: 41.50, wetMarket: 39.00, srp: 41.50 },
  { day: 'Oct 25', supermarket: 42.20, wetMarket: 39.50, srp: 41.50 },
  { day: 'Oct 31', supermarket: 42.00, wetMarket: 39.50, srp: 41.50 },
];

export const AdminControlCenterView: React.FC<AdminControlCenterViewProps> = ({
  stats,
  products,
  onNavigate,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-outline-variant/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-xs text-secondary font-bold uppercase tracking-wider">
              Live National Command Center
            </span>
          </div>
          <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight">
            Administrator Control Center & Price Telemetry
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Supervisory monitoring across Philippine wet markets, supermarkets, and municipal price watch councils.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('queue')}
            className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">fact_check</span>
            <span>Review Pending Queue ({stats.pendingPriceSubmissions})</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Approved Commodities
          </span>
          <div className="font-headline text-2xl font-bold text-on-surface mt-1">
            {stats.totalApprovedProducts}
          </div>
          <span className="text-[10px] text-secondary font-semibold flex items-center gap-0.5 mt-0.5">
            <span className="material-symbols-outlined text-[12px]">check_circle</span> 100% Barcode Indexed
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Monitored Stores
          </span>
          <div className="font-headline text-2xl font-bold text-on-surface mt-1">
            {stats.totalActiveStores}
          </div>
          <span className="text-[10px] text-primary font-semibold flex items-center gap-0.5 mt-0.5">
            <span className="material-symbols-outlined text-[12px]">location_on</span> Geolocation Active
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Verified Price Logs
          </span>
          <div className="font-headline text-2xl font-bold text-secondary mt-1">
            {stats.totalVerifiedPriceRecords.toLocaleString()}
          </div>
          <span className="text-[10px] text-outline mt-0.5 block">
            Append-only audit ledger
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Consensus Accuracy
          </span>
          <div className="font-headline text-2xl font-bold text-primary mt-1">
            {stats.consensusRate}%
          </div>
          <span className="text-[10px] text-secondary font-bold flex items-center gap-0.5 mt-0.5">
            <span className="material-symbols-outlined text-[12px]">verified</span> Dual-Verifier Quorum
          </span>
        </div>
      </div>

      {/* 3. Volatility Line Chart & Live Stream Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Price History Line Graph */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline font-bold text-sm text-on-surface">
                30-Day Commodity Price Volatility (NCR)
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                Metro Manila Wet Markets vs Supermarkets vs DTI SRP Baseline
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-primary">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span> Supermarkets
              </span>
              <span className="flex items-center gap-1 text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Wet Markets
              </span>
              <span className="flex items-center gap-1 text-outline">
                <span className="w-2.5 h-0.5 bg-outline"></span> Official SRP
              </span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VOLATILITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSupermarket" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9f43" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff9f43" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWetMarket" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d26a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d26a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7eeff" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#877365' }} axisLine={false} />
                <YAxis domain={[35, 45]} tick={{ fontSize: 10, fill: '#877365' }} axisLine={false} />
                <Tooltip 
                  formatter={(val: any) => formatPeso(Number(val))} 
                  contentStyle={{ backgroundColor: '#263143', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="supermarket" stroke="#ff9f43" strokeWidth={2} fillOpacity={1} fill="url(#colorSupermarket)" />
                <Area type="monotone" dataKey="wetMarket" stroke="#00d26a" strokeWidth={2} fillOpacity={1} fill="url(#colorWetMarket)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent 10 Approved Commodities Stream */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-outline-variant/30 pb-2">
              <h2 className="font-headline font-bold text-sm text-on-surface">Recent Active Products</h2>
              <button 
                onClick={() => onNavigate('catalog')}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {products.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-outline-variant/20 last:border-none">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-on-surface block truncate">{p.name}</span>
                    <span className="text-[10px] text-on-surface-variant block">{p.stores_count} stores active</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-headline font-bold text-on-surface block">{formatPeso(p.lowest_verified_price)}</span>
                    <span className="text-[9px] font-bold text-secondary">verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/30 mt-3 text-center">
            <button
              onClick={() => onNavigate('queue')}
              className="w-full py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary transition-all cursor-pointer"
            >
              Open Verification Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
