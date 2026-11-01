import React from 'react';
import type { Product } from '@saanmura/shared-types';
import { formatPeso, evaluateSrpStatus } from '@saanmura/domain';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddPriceObservation: (productId: string) => void;
}

const SAMPLE_STORE_TRENDS = [
  { date: 'Oct 05', puregold: 39.50, sm: 41.50, robinsons: 42.00, srp: 41.50 },
  { date: 'Oct 12', puregold: 40.00, sm: 41.50, robinsons: 42.50, srp: 41.50 },
  { date: 'Oct 19', puregold: 39.80, sm: 41.00, robinsons: 42.00, srp: 41.50 },
  { date: 'Oct 26', puregold: 39.50, sm: 41.50, robinsons: 42.00, srp: 41.50 },
  { date: 'Oct 31', puregold: 39.50, sm: 41.50, robinsons: 42.80, srp: 41.50 },
];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddPriceObservation,
}) => {
  if (!product) return null;

  const srpEval = evaluateSrpStatus(product.lowest_verified_price || 0, product.srp_price);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-outline-variant space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-outline-variant/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-surface-container-low border border-outline-variant/30 p-1 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-headline font-bold text-base text-on-surface block">
                {product.name}
              </span>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                <span className="font-mono bg-surface-container px-1.5 py-0.2 rounded text-[10px]">
                  SKU: {product.barcode}
                </span>
                <span>•</span>
                <span>{product.package_quantity} {product.unit?.abbreviation || 'g'}</span>
                <span>•</span>
                <span className="capitalize">{product.category?.name}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Bento Strip: Lowest, SRP, Spike */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-2.5 rounded-xl bg-surface-container-low">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Lowest Deal</span>
            <span className="font-headline text-lg font-bold text-secondary mt-0.5 block">
              {formatPeso(product.lowest_verified_price)}
            </span>
            <span className="text-[10px] text-on-surface-variant truncate block">Puregold Paso de Blas</span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-low">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Official DTI SRP</span>
            <span className="font-headline text-lg font-bold text-on-surface mt-0.5 block">
              {formatPeso(product.srp_price)}
            </span>
            <span className="text-[10px] text-secondary font-bold truncate block">{srpEval.badgeLabel}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-low">
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider block">Highest Shelf</span>
            <span className="font-headline text-lg font-bold text-tertiary mt-0.5 block">
              {formatPeso(product.highest_verified_price || (product.lowest_verified_price || 0) + 3)}
            </span>
            <span className="text-[10px] text-on-surface-variant truncate block">7-Eleven Mini Mart</span>
          </div>
        </div>

        {/* Multi-Store Comparison Line Chart */}
        <div className="p-3 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-headline font-bold text-xs text-on-surface">Store Price Comparison Trends</span>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="text-secondary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Puregold
              </span>
              <span className="text-primary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span> SM Supermarket
              </span>
              <span className="text-tertiary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span> Robinsons
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SAMPLE_STORE_TRENDS} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7eeff" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#877365' }} axisLine={false} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10, fill: '#877365' }} axisLine={false} />
                <Tooltip formatter={(v: any) => formatPeso(Number(v))} contentStyle={{ backgroundColor: '#263143', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="puregold" stroke="#00d26a" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="sm" stroke="#ff9f43" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="robinsons" stroke="#ff5a5f" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contributor Attribution Footer */}
        <div className="p-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">shield_person</span>
            <div className="text-xs">
              <span className="font-bold text-on-surface block">Attributed to Juan Dela Cruz (Tier-2 Palengke Scout)</span>
              <span className="text-[10px] text-outline">Verified by Maria Santos (LGU Verifier) • Oct 31, 2026</span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onAddPriceObservation(product.id);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-fixed font-bold text-xs shadow-xs hover:brightness-105 active:scale-[0.98] cursor-pointer"
          >
            + Log New Store Price
          </button>
        </div>
      </div>
    </div>
  );
};
