import React from 'react';
import type { ExternalReferencePrice } from '@saanmura/shared-types';
import { formatPeso } from '@saanmura/domain';

interface DtiReferenceViewProps {
  references: ExternalReferencePrice[];
}

export const DtiReferenceView: React.FC<DtiReferenceViewProps> = ({ references }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-outline-variant/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              Republic Act No. 7581 (Price Act)
            </span>
          </div>
          <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight">
            Official DTI / DA Suggested Retail Price (SRP) Bulletins
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Reference benchmarks published by the Department of Trade and Industry (DTI E-Presyo).
          </p>
        </div>

        <button
          onClick={() => alert('Official DTI E-Presyo CSV bulletin import wizard is ready.')}
          className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-surface-container cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          <span>Import DTI SRP Bulletin</span>
        </button>
      </div>

      {/* Reference Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/40 text-[11px] font-bold text-outline uppercase tracking-wider">
                <th className="py-2.5 px-4">Commodity Specification</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Unit / Package</th>
                <th className="py-2.5 px-4">SRP Range (Min - Max)</th>
                <th className="py-2.5 px-4">Prevailing SRP</th>
                <th className="py-2.5 px-4">Effective Date</th>
                <th className="py-2.5 px-4 text-right">Regulatory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {references.map((ref) => (
                <tr key={ref.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-on-surface block">{ref.product_name}</span>
                    <span className="font-mono text-[10px] text-outline">
                      {ref.barcode || 'Standard SKU'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">{ref.category}</td>
                  <td className="py-3 px-4 font-mono">{ref.unit}</td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {formatPeso(ref.srp_min_price)} – {formatPeso(ref.srp_max_price)}
                  </td>
                  <td className="py-3 px-4 font-headline font-bold text-primary">
                    {formatPeso(ref.prevailing_price || ref.srp_max_price)}
                  </td>
                  <td className="py-3 px-4 text-outline font-mono text-[11px]">{ref.effective_date}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-fixed/40 text-secondary border border-secondary/20">
                      ACTIVE MANDATE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
